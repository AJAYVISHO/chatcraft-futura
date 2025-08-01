import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, chatbotConfig, userApiKey } = await req.json()

    // Use user-provided API key or fallback to environment variable
    const apiKey = userApiKey || Deno.env.get('OPENROUTER_API_KEY')
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare the system message with chatbot context
    const systemMessage = {
      role: 'system',
      content: `You are ${chatbotConfig?.name || 'a helpful assistant'} for ${chatbotConfig?.businessName || 'this business'}.
      
Business Information:
- Industry: ${chatbotConfig?.industry || 'General'}
- Location: ${chatbotConfig?.location || 'Not specified'}
- Contact Phone: ${chatbotConfig?.contactPhone || 'Not provided'}

Knowledge Base:
${chatbotConfig?.ragContent || 'No specific knowledge base provided.'}

Please respond helpfully and professionally, staying in character as this business's assistant. Use the knowledge base information when relevant to answer questions.`
    }

    // Prepare messages for OpenRouter
    const openRouterMessages = [systemMessage, ...messages]

    // Make request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Chatbot Builder'
      },
      body: JSON.stringify({
        model: 'tngtech/deepseek-r1t2-chimera:free',
        messages: openRouterMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenRouter API Error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to get response from AI service' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Chat completion error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})