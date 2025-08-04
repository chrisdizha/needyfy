import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import Stripe from "https://esm.sh/stripe@14.21.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    )

    const authHeader = req.headers.get("Authorization")!
    const token = authHeader.replace("Bearer ", "")
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user
    if (!user) throw new Error("User not authenticated")

    const { equipmentId, startDate, endDate, totalPrice } = await req.json()

    // Get equipment details and owner info
    const { data: equipment, error: equipmentError } = await supabaseClient
      .from("equipment_listings")
      .select("title, owner_id")
      .eq("id", equipmentId)
      .single()

    if (equipmentError) throw new Error("Equipment not found")

    // Get provider's Stripe Connect account
    const { data: providerProfile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("stripe_connect_account_id")
      .eq("id", equipment.owner_id)
      .single()

    if (profileError || !providerProfile?.stripe_connect_account_id) {
      throw new Error("Provider has not set up Stripe Connect")
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    })

    // Create booking record first
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    const { data: booking, error: bookingError } = await supabaseService
      .from("bookings")
      .insert({
        user_id: user.id,
        owner_id: equipment.owner_id,
        equipment_id: equipmentId,
        equipment_title: equipment.title,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
        status: "pending",
        stripe_connect_account_id: providerProfile.stripe_connect_account_id,
        escrow_status: "pending"
      })
      .select()
      .single()

    if (bookingError) throw new Error("Failed to create booking")

    // Calculate platform fee (5%)
    const platformFee = Math.round(totalPrice * 0.05)
    const providerAmount = totalPrice - platformFee

    // Create Stripe Connect checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Rental: ${equipment.title}`,
              description: `${startDate} to ${endDate}`,
            },
            unit_amount: totalPrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?booking_id=${booking.id}`,
      cancel_url: `${req.headers.get("origin")}/equipment/${equipmentId}`,
      client_reference_id: booking.id,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: providerProfile.stripe_connect_account_id,
        },
        metadata: {
          booking_id: booking.id,
          escrow: "true",
        },
      },
    })

    // Update booking with Stripe session ID
    await supabaseService
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id)

    return new Response(
      JSON.stringify({ url: session.url, booking_id: booking.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )

  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})