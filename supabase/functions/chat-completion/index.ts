import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');

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
        model: 'microsoft/wizardlm-2-8x22b',
        messages: [
          {
            role: 'system',
            content: `You are ${chatbotData.business_name || 'a helpful assistant'}, an AI customer service representative. 

CRITICAL INSTRUCTIONS:
1. You MUST ONLY answer questions using the information provided in the business knowledge base below
2. If the question cannot be answered using the knowledge base, respond with: "I don't have specific information about that. Please contact us directly at ${chatbotData.contact_phone || 'our support team'} for assistance."
3. Do NOT make up information or provide general answers not found in the knowledge base
4. Be helpful, professional, and concise
5. Always stay in character as a representative of ${chatbotData.business_name || 'the business'}

BUSINESS INFORMATION:
- Business: ${chatbotData.business_name || 'N/A'}
- Industry: ${chatbotData.industry_type || 'N/A'}
- Location: ${chatbotData.location || 'N/A'}
- Contact: ${chatbotData.contact_phone || 'N/A'}

KNOWLEDGE BASE:
${ragContent}

Remember: ONLY use information from the knowledge base above. If you cannot find the answer there, ask them to contact support.`
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