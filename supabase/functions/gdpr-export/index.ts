import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

// Production domains for CORS - replace with your actual domains
const allowedOrigins = [
  "https://needyfy.lovable.app",
  "https://yoodlize.lovable.app", 
  "https://your-production-domain.com"
]

const getCorsHeaders = (origin: string | null) => {
  const isAllowedOrigin = origin && allowedOrigins.includes(origin)
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; connect-src 'self' https://*.supabase.co",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
  }
}

serve(async (req) => {
  const origin = req.headers.get("origin")
  const corsHeaders = getCorsHeaders(origin)
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    // Verify authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("No authorization header")
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error("Invalid authentication")
    }

    const { action } = await req.json()

    if (action === 'export') {
      // Export all user data
      const userData = {
        user_id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }

      // Get profile data
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Get bookings
      const { data: bookings } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)

      // Get messages
      const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('sender_id', user.id)

      // Get reports
      const { data: reports } = await supabaseAdmin
        .from('reports')
        .select('*')
        .eq('reporter_id', user.id)

      // Get disputes
      const { data: disputes } = await supabaseAdmin
        .from('disputes')
        .select('*')
        .or(`opened_by.eq.${user.id},against_user_id.eq.${user.id}`)

      // Get equipment documents
      const { data: documents } = await supabaseAdmin
        .from('equipment_documents')
        .select('*')
        .eq('uploaded_by', user.id)

      const exportData = {
        export_date: new Date().toISOString(),
        user_data: userData,
        profile,
        bookings,
        messages,
        reports,
        disputes,
        equipment_documents: documents
      }

      // Log the export request
      await supabaseAdmin.rpc('log_admin_action', {
        p_action: 'gdpr_data_export',
        p_table_name: 'profiles',
        p_record_id: user.id
      })

      return new Response(
        JSON.stringify(exportData, null, 2),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="needyfy-data-export-${user.id}.json"`
          }
        }
      )

    } else if (action === 'delete') {
      // GDPR Right to be Forgotten - Delete all user data
      
      // Delete in reverse order of dependencies
      await supabaseAdmin.from('equipment_documents').delete().eq('uploaded_by', user.id)
      await supabaseAdmin.from('messages').delete().eq('sender_id', user.id)
      await supabaseAdmin.from('disputes').delete().or(`opened_by.eq.${user.id},against_user_id.eq.${user.id}`)
      await supabaseAdmin.from('reports').delete().eq('reporter_id', user.id)
      await supabaseAdmin.from('bookings').delete().or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
      await supabaseAdmin.from('user_roles').delete().eq('user_id', user.id)
      await supabaseAdmin.from('profiles').delete().eq('id', user.id)

      // Log the deletion request before deleting auth user
      await supabaseAdmin.rpc('log_admin_action', {
        p_action: 'gdpr_account_deletion',
        p_table_name: 'auth.users',
        p_record_id: user.id
      })

      // Delete the auth user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (deleteError) {
        throw deleteError
      }

      return new Response(
        JSON.stringify({ success: true, message: "Account and all data deleted successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )

    } else {
      throw new Error("Invalid action")
    }

  } catch (error) {
    console.error("GDPR operation error:", error)
    
    return new Response(
      JSON.stringify({ 
        error: "Operation failed",
        ...(Deno.env.get("ENVIRONMENT") === "development" && { details: error.message })
      }), 
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})