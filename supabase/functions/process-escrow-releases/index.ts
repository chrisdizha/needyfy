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
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    })

    // Get pending releases that are due
    const { data: pendingReleases, error: releasesError } = await supabaseService
      .from("escrow_releases")
      .select(`
        *,
        bookings (
          stripe_connect_account_id,
          stripe_session_id,
          owner_id,
          equipment_title
        )
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())

    if (releasesError) {
      console.error("Error fetching releases:", releasesError)
      throw new Error("Failed to fetch pending releases")
    }

    console.log(`Processing ${pendingReleases?.length || 0} pending releases`)

    for (const release of pendingReleases || []) {
      try {
        // Update status to processing
        await supabaseService
          .from("escrow_releases")
          .update({ status: "processing" })
          .eq("id", release.id)

        // Create transfer to provider's Connect account
        const transfer = await stripe.transfers.create({
          amount: release.amount,
          currency: "usd",
          destination: release.bookings.stripe_connect_account_id,
          metadata: {
            booking_id: release.booking_id,
            release_id: release.id,
            release_type: release.release_type,
          },
        })

        // Update release with success
        await supabaseService
          .from("escrow_releases")
          .update({
            status: "completed",
            released_at: new Date().toISOString(),
            stripe_transfer_id: transfer.id,
          })
          .eq("id", release.id)

        // Update booking released amount
        await supabaseService.rpc("sql", {
          query: `
            UPDATE bookings 
            SET released_amount = released_amount + ${release.amount}
            WHERE id = '${release.booking_id}'
          `
        })

        // Send notification to provider
        await supabaseService.rpc("send_notification", {
          p_user_id: release.bookings.owner_id,
          p_title: "Escrow Release Processed",
          p_message: `$${(release.amount / 100).toFixed(2)} has been released for ${release.bookings.equipment_title}`,
          p_type: "success",
          p_data: {
            booking_id: release.booking_id,
            release_id: release.id,
            amount: release.amount,
          },
        })

        console.log(`Successfully processed release ${release.id} for $${release.amount / 100}`)

      } catch (releaseError) {
        console.error(`Failed to process release ${release.id}:`, releaseError)
        
        // Update release with failure
        await supabaseService
          .from("escrow_releases")
          .update({
            status: "failed",
            failure_reason: releaseError.message,
          })
          .eq("id", release.id)
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: pendingReleases?.length || 0,
        message: "Escrow releases processed successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )

  } catch (error) {
    console.error("Error processing escrow releases:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})