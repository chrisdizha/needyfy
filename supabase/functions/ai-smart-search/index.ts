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
    const { query, userLocation, budget, timeframe } = await req.json();

    console.log('Processing smart search for:', { query, userLocation, budget, timeframe });

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Get equipment listings from database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: equipmentListings } = await supabaseAdmin
      .from('equipment_listings')
      .select('id, title, description, category, price, location, rating')
      .eq('status', 'active')
      .limit(50);

    const equipmentData = equipmentListings?.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description?.substring(0, 100) + '...',
      category: item.category,
      price: item.price,
      location: item.location,
      rating: item.rating
    })) || [];

    const prompt = `Analyze this search query and recommend the most relevant equipment from the available listings:

User Query: "${query}"
User Location: ${userLocation || 'Not specified'}
Budget: ${budget ? `$${budget}/day` : 'Not specified'}
Timeframe: ${timeframe || 'Not specified'}

Available Equipment:
${equipmentData.map(item => 
  `ID: ${item.id} | ${item.title} | ${item.category} | $${item.price}/day | ${item.location} | Rating: ${item.rating || 'N/A'}`
).join('\n')}

Task:
1. Understand the user's intent and needs
2. Match equipment based on relevance, location, budget, and quality
3. Rank results by best fit
4. Provide search suggestions if query is unclear

Return JSON response:
{
  "recommendations": [
    {
      "equipmentId": "string",
      "relevanceScore": number (0-100),
      "reason": "string"
    }
  ],
  "searchSuggestions": ["string"],
  "summary": "string"
}

Limit to top 10 recommendations.`;

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
            content: 'You are an AI search assistant for equipment rentals. Analyze user queries and match them with relevant equipment based on functionality, location, budget, and quality. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let searchResults;
    
    try {
      searchResults = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse search results:', data.choices[0].message.content);
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
      feature_type: 'smart_search',
      input_data: { query, userLocation, budget, timeframe, equipmentCount: equipmentData.length },
      output_data: searchResults,
      tokens_used: data.usage?.total_tokens || 0,
      cost_usd: (data.usage?.total_tokens || 0) * 0.000003
    });

    console.log('Smart search completed successfully');

    return new Response(JSON.stringify({ 
      ...searchResults,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-smart-search:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});