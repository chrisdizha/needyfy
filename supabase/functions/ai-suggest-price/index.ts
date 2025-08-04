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
    const { title, category, condition, location, features } = await req.json();

    console.log('Generating price suggestion for:', { title, category, condition, location });

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Get market data from database for context
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: marketData } = await supabaseAdmin
      .from('equipment_listings')
      .select('price, title, category')
      .eq('category', category)
      .eq('status', 'active')
      .limit(10);

    const marketPrices = marketData?.map(item => `${item.title}: $${item.price}/day`) || [];

    const prompt = `Analyze and suggest a competitive daily rental price for this equipment:

Equipment Details:
- Title: ${title}
- Category: ${category}
- Condition: ${condition || 'Good'}
- Location: ${location}
- Features: ${features || 'Not specified'}

Market Context (similar items in ${category}):
${marketPrices.length > 0 ? marketPrices.join('\n') : 'No comparable items found'}

Consider:
- Equipment value and depreciation
- Local market conditions
- Seasonal demand
- Condition impact on pricing
- Competitive positioning

Provide:
1. Suggested daily price (USD)
2. Price range (minimum to maximum)
3. Brief reasoning (2-3 sentences)

Format your response as JSON:
{
  "suggestedPrice": number,
  "priceRange": {"min": number, "max": number},
  "reasoning": "string"
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://needyfy.com',
        'X-Title': 'Needyfy Equipment Rental'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a pricing expert for equipment rentals. Analyze market data and provide accurate, competitive pricing suggestions. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let pricingData;
    
    try {
      pricingData = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse pricing data:', data.choices[0].message.content);
      throw new Error('Invalid response format from AI');
    }

    // Log AI interaction
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
      
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id;
    }

    await supabaseAdmin.from('ai_interactions').insert({
      user_id: userId,
      feature_type: 'price_suggestion',
      input_data: { title, category, condition, location, features, marketDataCount: marketPrices.length },
      output_data: pricingData,
      tokens_used: data.usage?.total_tokens || 0,
      cost_usd: (data.usage?.total_tokens || 0) * 0.000003
    });

    console.log('Generated price suggestion successfully');

    return new Response(JSON.stringify({ 
      ...pricingData,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-suggest-price:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});