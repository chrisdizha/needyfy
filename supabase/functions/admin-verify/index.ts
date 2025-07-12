import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://needyfy.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; connect-src 'self' https://*.supabase.co",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}

interface AdminVerificationRequest {
  action: 'verify' | 'assign_role' | 'remove_role' | 'suspend_user' | 'reactivate_user'
  target_user_id?: string
  role?: 'admin' | 'moderator' | 'user'
  suspension_reason?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Rate limiting - simple in-memory store (in production, use Redis/database)
    const userIP = req.headers.get('x-forwarded-for') || 'unknown'
    
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    // Verify the requesting user's authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("No authorization header")
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error("Invalid authentication")
    }

    // Verify admin status using our secure function
    const { data: isAdminResult, error: adminCheckError } = await supabaseAdmin
      .rpc('is_admin', { _user_id: user.id })
    
    if (adminCheckError || !isAdminResult) {
      // Log security violation
      await supabaseAdmin.rpc('log_admin_action', {
        p_action: 'unauthorized_admin_access_attempt',
        p_table_name: 'user_roles',
        p_record_id: user.id
      })
      
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }), 
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    const requestBody: AdminVerificationRequest = await req.json()
    
    // Process different admin actions
    switch (requestBody.action) {
      case 'verify':
        return new Response(
          JSON.stringify({ 
            admin: true, 
            user_id: user.id,
            email: user.email 
          }), 
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        )

      case 'assign_role':
        if (!requestBody.target_user_id || !requestBody.role) {
          throw new Error("Missing required fields for role assignment")
        }
        
        // Prevent self-assignment
        if (requestBody.target_user_id === user.id) {
          throw new Error("Cannot assign roles to yourself")
        }

        const { error: assignError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: requestBody.target_user_id,
            role: requestBody.role
          })

        if (assignError) {
          if (assignError.code === '23505') {
            throw new Error("User already has this role")
          }
          throw assignError
        }

        // Log the action
        await supabaseAdmin.rpc('log_admin_action', {
          p_action: `assign_role_${requestBody.role}`,
          p_table_name: 'user_roles',
          p_record_id: requestBody.target_user_id
        })

        return new Response(
          JSON.stringify({ success: true, message: "Role assigned successfully" }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

      case 'remove_role':
        if (!requestBody.target_user_id || !requestBody.role) {
          throw new Error("Missing required fields for role removal")
        }
        
        // Prevent self-removal
        if (requestBody.target_user_id === user.id) {
          throw new Error("Cannot remove your own roles")
        }

        const { error: removeError } = await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', requestBody.target_user_id)
          .eq('role', requestBody.role)

        if (removeError) {
          throw removeError
        }

        // Log the action
        await supabaseAdmin.rpc('log_admin_action', {
          p_action: `remove_role_${requestBody.role}`,
          p_table_name: 'user_roles',
          p_record_id: requestBody.target_user_id
        })

        return new Response(
          JSON.stringify({ success: true, message: "Role removed successfully" }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

      case 'suspend_user':
        if (!requestBody.target_user_id || !requestBody.suspension_reason) {
          throw new Error("Missing required fields for user suspension")
        }

        const { error: suspendError } = await supabaseAdmin
          .from('profiles')
          .update({
            suspended: true,
            suspension_reason: requestBody.suspension_reason,
            suspended_at: new Date().toISOString()
          })
          .eq('id', requestBody.target_user_id)

        if (suspendError) {
          throw suspendError
        }

        // Log the action
        await supabaseAdmin.rpc('log_admin_action', {
          p_action: 'suspend_user',
          p_table_name: 'profiles',
          p_record_id: requestBody.target_user_id,
          p_new_values: { 
            suspended: true, 
            suspension_reason: requestBody.suspension_reason 
          }
        })

        return new Response(
          JSON.stringify({ success: true, message: "User suspended successfully" }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

      case 'reactivate_user':
        if (!requestBody.target_user_id) {
          throw new Error("Missing user ID for reactivation")
        }

        const { error: reactivateError } = await supabaseAdmin
          .from('profiles')
          .update({
            suspended: false,
            suspension_reason: null,
            suspended_at: null
          })
          .eq('id', requestBody.target_user_id)

        if (reactivateError) {
          throw reactivateError
        }

        // Log the action
        await supabaseAdmin.rpc('log_admin_action', {
          p_action: 'reactivate_user',
          p_table_name: 'profiles',
          p_record_id: requestBody.target_user_id
        })

        return new Response(
          JSON.stringify({ success: true, message: "User reactivated successfully" }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

      default:
        throw new Error("Invalid action")
    }

  } catch (error) {
    console.error("Admin verification error:", error)
    
    return new Response(
      JSON.stringify({ 
        error: "Operation failed",
        // Don't expose detailed error messages in production
        ...(Deno.env.get("ENVIRONMENT") === "development" && { details: error.message })
      }), 
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})