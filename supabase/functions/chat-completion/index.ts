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

STRICT INSTRUCTIONS:
- You must ONLY answer questions based on the knowledge base provided below
- If a question is not covered in the knowledge base, politely say "I don't have information about that in my knowledge base. Please contact us at ${chatbotConfig?.contactPhone || 'our support team'} for assistance."
- Do NOT make up information or provide general answers outside the knowledge base
- Stay strictly within the scope of the provided business information

Business Information:
- Industry: ${chatbotConfig?.industry || 'General'}
- Location: ${chatbotConfig?.location || 'Not specified'}
- Contact Phone: ${chatbotConfig?.contactPhone || 'Not provided'}

KNOWLEDGE BASE (THIS IS YOUR ONLY SOURCE OF INFORMATION):
${chatbotConfig?.ragContent || 'No specific knowledge base provided. Please tell users to contact support for any questions.'}

Remember: Only use information from the knowledge base above. If the knowledge base is empty or doesn't contain relevant information, direct users to contact support.`
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
        model: 'microsoft/wizardlm-2-8x22b',
        messages: openRouterMessages,
        temperature: 0.3,
        max_tokens: 500,
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