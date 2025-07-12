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
    // Verify webhook signature
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

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        
        // Update booking status
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('stripe_session_id', paymentIntent.id)

        if (updateError) {
          console.error('Error updating booking:', updateError)
        }
        break

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        // Update booking status for checkout session
        const { error: sessionUpdateError } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('stripe_session_id', session.id)

        if (sessionUpdateError) {
          console.error('Error updating booking from session:', sessionUpdateError)
        }
        break

      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)
        
        // Handle failed payment (e.g., notify user, suspend service)
        if (invoice.customer) {
          console.log('Customer payment failed:', invoice.customer)
          // Add your logic here
        }
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    // Log the webhook event for audit trail
    await supabase.rpc('log_admin_action', {
      p_action: `stripe_webhook_${event.type}`,
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