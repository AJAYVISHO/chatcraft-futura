import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      chatbotId, 
      conversationHistory = [], 
      emailNotifications = false, 
      notificationEmail = '' 
    } = await req.json();

    if (!message || !chatbotId) {
      return new Response(
        JSON.stringify({ error: 'Message and chatbotId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle preview mode or get chatbot data from Supabase
    let chatbotData;
    
    if (chatbotId === 'preview') {
      // Use default values for preview mode
      chatbotData = {
        business_name: 'Preview Chatbot',
        industry_type: 'Demo',
        location: 'Preview Mode',
        contact_phone: 'N/A',
        rag_content: 'This is a preview of the chatbot. You can ask me anything!',
        config: {}
      };
    } else {
      const { data: fetchedData, error: fetchError } = await supabase
        .from('chatbots')
        .select('*')
        .eq('id', chatbotId)
        .single();

      if (fetchError || !fetchedData) {
        return new Response(
          JSON.stringify({ error: 'Chatbot not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      chatbotData = fetchedData;
    }

    const config = chatbotData.config || {};
    const ragContent = chatbotData.rag_content || 'No specific knowledge base provided.';

    // Retrieval-Augmented: try to fetch matching context using embeddings if OPENAI_API_KEY is set
    let retrievedContext = '';
    try {
      if (openaiApiKey) {
        const embedResp = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: message,
            model: 'text-embedding-3-small'
          })
        });
        if (embedResp.ok) {
          const embedJson = await embedResp.json();
          const queryEmbedding = embedJson.data?.[0]?.embedding;
          if (Array.isArray(queryEmbedding)) {
            const { data: matches, error: matchError } = await supabase.rpc('match_documents', {
              query_embedding: queryEmbedding,
              chatbot_id_param: chatbotId,
              match_threshold: 0.7,
              match_count: 5
            });
            if (!matchError && matches?.length) {
              retrievedContext = matches.map((m: any, i: number) => `[${i + 1}] ${m.content}`).join('\n\n');
            }
          }
        }
      }
    } catch (e) {
      console.error('RAG retrieval failed:', e);
    }

    // Use OpenRouter API key from config or environment
    const apiKey = config.openRouterApiKey || openRouterApiKey;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Chatbot Builder'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        messages: [
          {
            role: 'system',
            content: (() => {
              // Parse configuration for AI persona settings
              const configData = typeof chatbotData.config === 'string' ? JSON.parse(chatbotData.config) : (chatbotData.config || {});
              const agentName = configData.agentName || 'Customer Service Agent';
              const agentRole = configData.agentRole || 'Customer Support Agent';
              const agentDescription = configData.agentDescription || '';
              const chattiness = configData.chattiness !== undefined ? configData.chattiness : 1;
              const toneOfVoice = configData.toneOfVoice || 'friendly';
              const responseStyle = configData.responseStyle || 'conversational';
              const specialInstructions = configData.specialInstructions || '';
              const defaultLanguage = configData.defaultLanguage || 'en';

              // Construct the system prompt with persona configuration
              let systemPrompt = `You are ${agentName}, a ${agentRole} for ${chatbotData.business_name || 'the business'}.`;
              
              if (agentDescription) {
                systemPrompt += ` ${agentDescription}`;
              }

              systemPrompt += `

PERSONALITY & COMMUNICATION STYLE:
- Tone: ${toneOfVoice} (be ${toneOfVoice} in all interactions)
- Response Style: ${responseStyle}
- Language: Respond primarily in ${defaultLanguage === 'en' ? 'English' : defaultLanguage}
- Response Length: ${chattiness === 0 ? 'Keep responses to 1 sentence maximum' : 
                        chattiness === 1 ? 'Keep responses brief (2-3 sentences)' :
                        chattiness === 2 ? 'Provide standard responses (4-5 sentences)' :
                        'Provide detailed, comprehensive responses (6+ sentences)'}`;

              if (specialInstructions) {
                systemPrompt += `

SPECIAL INSTRUCTIONS:
${specialInstructions}`;
              }

              systemPrompt += `
            
            CRITICAL INSTRUCTIONS:
            1. You MUST ONLY answer questions using the information provided in the business knowledge base below
            2. If the question cannot be answered using the knowledge base, respond with: "I don't have specific information about that. Please contact us directly at ${chatbotData.contact_phone || 'our support team'} for assistance."
            3. Do NOT make up information or provide general answers not found in the knowledge base
            4. Follow your personality traits (${toneOfVoice}, ${responseStyle}) while staying professional
            5. Always stay in character as ${agentName} from ${chatbotData.business_name || 'the business'}
            6. Include inline citations like [1], [2] corresponding to source snippets in the Retrieved Context when applicable
            
            BUSINESS INFORMATION:
- Business: ${chatbotData.business_name || 'N/A'}
- Industry: ${chatbotData.industry_type || 'N/A'}
- Location: ${chatbotData.location || 'N/A'}
- Contact: ${chatbotData.contact_phone || 'N/A'}

            RETRIEVED CONTEXT (most relevant first):
            ${retrievedContext || ragContent}
            
            Remember: ONLY use information from the context above while maintaining your personality as ${agentName}.`;

              return systemPrompt;
            })()
          },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't process your request at the moment.";

    // Send email notification if enabled
    if (emailNotifications && notificationEmail && resend) {
      try {
        const fullConversation = [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: aiResponse }
        ];

        const conversationText = fullConversation
          .map(msg => `${msg.role === 'user' ? 'Customer' : 'AI'}: ${msg.content}`)
          .join('\n\n');

        await resend.emails.send({
          from: 'Chatbot Conversations <onboarding@resend.dev>',
          to: [notificationEmail],
          subject: `New Conversation - ${chatbotData.business_name || 'Chatbot'}`,
          html: `
            <h2>New Chatbot Conversation</h2>
            <p><strong>Business:</strong> ${chatbotData.business_name || 'N/A'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <h3>Conversation:</h3>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-family: monospace;">
${conversationText}
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-completion function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});