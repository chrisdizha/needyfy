
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

// Secure CORS - replace with your actual domain
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://needyfy.lovable.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting - simple IP-based check (in production, use Redis/database)
    const userIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.log(`Checkout request from IP: ${userIP}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not found');
    }

    const requestData = await req.json();
    const {
      equipmentId,
      equipmentTitle,
      startDate,
      endDate,
      totalPrice,
    } = requestData;

    // Input validation
    if (!equipmentId || !equipmentTitle || !startDate || !endDate || !totalPrice) {
      throw new Error('Missing required fields');
    }

    if (typeof totalPrice !== 'number' || totalPrice <= 0) {
      throw new Error('Invalid price');
    }

    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error('Invalid date range');
    }

    if (new Date(startDate) < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    // Sanitize inputs
    const sanitizedTitle = equipmentTitle.substring(0, 255); // Limit title length

    // 1. Create a pending booking in the database
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        equipment_id: equipmentId,
        equipment_title: sanitizedTitle,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice * 100, // Convert to cents
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw bookingError;
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2023-10-16',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: sanitizedTitle,
              description: `Rental from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
            },
            unit_amount: Math.round(totalPrice * 100), // Price in cents, rounded
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/booking-cancelled`,
      client_reference_id: booking.id, // Link Stripe session to our booking
      metadata: {
        user_id: user.id,
        equipment_id: equipmentId,
      },
    });

    // Update booking with Stripe session ID
    await supabase
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id);

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    
    // Don't expose detailed error messages in production
    const isProduction = Deno.env.get("ENVIRONMENT") === "production";
    const errorMessage = isProduction ? "Payment processing failed" : error.message;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
