import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://needyfy.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface RateLimitConfig {
  requests: number
  windowSeconds: number
  identifier: string
}

// Database-based rate limiting since Redis isn't available
async function checkRateLimit(
  supabase: any,
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowSeconds * 1000)
  
  // Clean up old entries
  await supabase
    .from('rate_limit_log')
    .delete()
    .lt('created_at', windowStart.toISOString())
  
  // Count current requests in window
  const { data: requests, error } = await supabase
    .from('rate_limit_log')
    .select('id')
    .eq('identifier', identifier)
    .gte('created_at', windowStart.toISOString())
  
  if (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true, remaining: maxRequests, resetTime: now.getTime() + windowSeconds * 1000 }
  }
  
  const currentCount = requests?.length || 0
  const remaining = Math.max(0, maxRequests - currentCount - 1)
  const resetTime = now.getTime() + windowSeconds * 1000
  
  if (currentCount >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime }
  }
  
  // Log this request
  await supabase
    .from('rate_limit_log')
    .insert({
      identifier,
      created_at: now.toISOString()
    })
  
  return { allowed: true, remaining, resetTime }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  const securityHeaders = {
    ...corsHeaders,
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.gpteng.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    const { identifier, requests = 100, windowSeconds = 3600 }: RateLimitConfig = await req.json()
    
    // Use IP + user agent as identifier if none provided
    const clientIdentifier = identifier || 
      `${req.headers.get('x-forwarded-for') || 'unknown'}_${req.headers.get('user-agent')?.slice(0, 50) || 'unknown'}`
    
    const rateLimit = await checkRateLimit(supabase, clientIdentifier, requests, windowSeconds)
    
    const response = {
      allowed: rateLimit.allowed,
      remaining: rateLimit.remaining,
      resetTime: rateLimit.resetTime,
      identifier: clientIdentifier
    }

    return new Response(
      JSON.stringify(response),
      {
        status: rateLimit.allowed ? 200 : 429,
        headers: {
          ...securityHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Limit": requests.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": Math.ceil(rateLimit.resetTime / 1000).toString()
        }
      }
    )
  } catch (error) {
    console.error('Rate limiter error:', error)
    return new Response(
      JSON.stringify({ error: "Rate limiting service unavailable" }),
      { 
        status: 500, 
        headers: { ...securityHeaders, "Content-Type": "application/json" }
      }
    )
  }
})