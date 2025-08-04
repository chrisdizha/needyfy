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
    const { title, category, keyFeatures, condition } = await req.json();

    console.log('Generating description for:', { title, category, keyFeatures, condition });

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `Generate a professional, engaging description for this equipment rental listing:

Title: ${title}
Category: ${category}
Key Features: ${keyFeatures || 'Not specified'}
Condition: ${condition || 'Good'}

Guidelines:
- Write 150-300 words
- Highlight key benefits and features
- Mention ideal use cases
- Include safety or usage notes where relevant
- Use professional but friendly tone
- Make it appealing to potential renters

Generate only the description text, no additional formatting or labels.`;

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
            content: 'You are an expert equipment rental copywriter. Generate compelling, professional descriptions that attract renters while being honest and informative.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedDescription = data.choices[0].message.content;

    // Log AI interaction to Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
      feature_type: 'description_generation',
      input_data: { title, category, keyFeatures, condition },
      output_data: { description: generatedDescription },
      tokens_used: data.usage?.total_tokens || 0,
      cost_usd: (data.usage?.total_tokens || 0) * 0.000003 // Estimate based on Claude pricing
    });

    console.log('Generated description successfully');

    return new Response(JSON.stringify({ 
      description: generatedDescription,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-generate-description:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});