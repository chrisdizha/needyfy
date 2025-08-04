import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { equipmentId, equipmentTitle, startDate, endDate, totalPrice } = await req.json();

    console.log('Creating PayPal payment for:', { equipmentId, equipmentTitle, totalPrice });

    // Validate required PayPal credentials
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalEnvironment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Create booking record
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get equipment owner
    const { data: equipment } = await supabaseAdmin
      .from('equipment_listings')
      .select('owner_id')
      .eq('id', equipmentId)
      .single();

    if (!equipment) {
      throw new Error('Equipment not found');
    }

    // Get PayPal access token
    const paypalBaseURL = paypalEnvironment === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const authResponse = await fetch(`${paypalBaseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      throw new Error('PayPal authentication failed');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        user_id: user.id,
        owner_id: equipment.owner_id,
        equipment_id: equipmentId,
        equipment_title: equipmentTitle,
        start_date: startDate,
        end_date: endDate,
        total_price: Math.round(totalPrice * 100), // Convert to cents
        status: 'pending',
        payment_method: 'paypal'
      })
      .select()
      .single();

    if (bookingError) {
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    // Create PayPal order
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: booking.id,
        amount: {
          currency_code: 'USD',
          value: totalPrice.toFixed(2)
        },
        description: `Equipment rental: ${equipmentTitle}`
      }],
      application_context: {
        brand_name: 'Needyfy',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${req.headers.get('origin')}/booking-success?paypal=true&booking_id=${booking.id}`,
        cancel_url: `${req.headers.get('origin')}/booking-cancelled?paypal=true`
      }
    };

    const orderResponse = await fetch(`${paypalBaseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': booking.id
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      console.error('PayPal order creation failed:', errorData);
      throw new Error('PayPal order creation failed');
    }

    const order = await orderResponse.json();
    const approvalUrl = order.links.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      throw new Error('PayPal approval URL not found');
    }

    // Update booking with PayPal order ID
    await supabaseAdmin
      .from('bookings')
      .update({ stripe_session_id: order.id }) // Reuse this field for PayPal order ID
      .eq('id', booking.id);

    console.log('PayPal payment created successfully');

    return new Response(JSON.stringify({
      orderId: order.id,
      approvalUrl: approvalUrl,
      bookingId: booking.id,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-paypal-payment:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});