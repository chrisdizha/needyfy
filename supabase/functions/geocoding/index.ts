import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, query, latitude, longitude, countryCode } = await req.json();

    if (type === 'search' && query) {
      // Forward geocoding: search for locations
      const countryFilter = countryCode ? `&countrycodes=${countryCode}` : '';
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1${countryFilter}`,
        {
          headers: {
            'User-Agent': 'Needyfy App Geocoding Service'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        throw new Error('Geocoding search service unavailable');
      }
    } else if (type === 'reverse' && latitude && longitude) {
      // Reverse geocoding: get address from coordinates
      const countryFilter = countryCode ? `&countrycodes=${countryCode}` : '';
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1${countryFilter}`,
        {
          headers: {
            'User-Agent': 'Needyfy App Geocoding Service'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.address) {
          const { address } = data;
          const city = address.city || address.town || address.village || address.suburb;
          const state = address.state || address.region;
          const country = address.country;
          
          const formattedAddress = [city, state, country].filter(Boolean).join(', ');
          
          return new Response(JSON.stringify({ 
            success: true, 
            address: formattedAddress,
            raw: data 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Fallback to coordinates if no address found
          const coordinatesAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          return new Response(JSON.stringify({ 
            success: true, 
            address: coordinatesAddress,
            fallback: true 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        throw new Error('Reverse geocoding service unavailable');
      }
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid request parameters' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Geocoding service error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});