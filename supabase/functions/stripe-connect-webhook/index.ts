import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
})

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
)

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret')
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.text()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        
        // Only process if this is an escrow payment
        if (paymentIntent.metadata?.escrow === "true") {
          const bookingId = paymentIntent.metadata.booking_id

          // Update booking status to confirmed and setup escrow
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ 
              status: 'confirmed',
              escrow_status: 'holding'
            })
            .eq('id', bookingId)

          if (updateError) {
            console.error('Error updating booking:', updateError)
          } else {
            // Setup escrow releases
            await supabase.rpc('setup_escrow_releases', {
              p_booking_id: bookingId
            })
            console.log('Escrow setup completed for booking:', bookingId)
          }
        }
        break

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        const bookingId = session.client_reference_id
        if (bookingId) {
          const { error: sessionUpdateError } = await supabase
            .from('bookings')
            .update({ 
              status: 'confirmed',
              escrow_status: 'holding'
            })
            .eq('id', bookingId)

          if (sessionUpdateError) {
            console.error('Error updating booking from session:', sessionUpdateError)
          } else {
            // Setup escrow releases
            await supabase.rpc('setup_escrow_releases', {
              p_booking_id: bookingId
            })
            console.log('Escrow setup completed for booking:', bookingId)
          }
        }
        break

      case 'transfer.paid':
        const transfer = event.data.object as Stripe.Transfer
        console.log('Transfer completed:', transfer.id)
        
        if (transfer.metadata?.release_id) {
          await supabase
            .from('escrow_releases')
            .update({ 
              status: 'completed',
              released_at: new Date().toISOString()
            })
            .eq('id', transfer.metadata.release_id)
        }
        break

      case 'transfer.failed':
        const failedTransfer = event.data.object as Stripe.Transfer
        console.log('Transfer failed:', failedTransfer.id)
        
        if (failedTransfer.metadata?.release_id) {
          await supabase
            .from('escrow_releases')
            .update({ 
              status: 'failed',
              failure_reason: 'Stripe transfer failed'
            })
            .eq('id', failedTransfer.metadata.release_id)
        }
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    // Log the webhook event for audit trail
    await supabase.rpc('log_admin_action', {
      p_action: `stripe_connect_webhook_${event.type}`,
      p_table_name: 'webhooks',
      p_record_id: event.id,
      p_new_values: { event_type: event.type, processed_at: new Date().toISOString() }
    })

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})