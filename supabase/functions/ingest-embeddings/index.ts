import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function chunkText(text: string, maxTokens = 700): string[] {
  // Simple chunker by paragraphs then by length
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  for (const p of paragraphs) {
    if (p.length <= maxTokens) {
      chunks.push(p);
    } else {
      for (let i = 0; i < p.length; i += maxTokens) {
        chunks.push(p.slice(i, i + maxTokens));
      }
    }
  }
  return chunks.slice(0, 1000);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatbotId } = await req.json();

    if (!chatbotId) {
      return new Response(JSON.stringify({ error: 'chatbotId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('id, rag_content, business_name')
      .eq('id', chatbotId)
      .maybeSingle();

    if (error || !chatbot) {
      return new Response(JSON.stringify({ error: 'Chatbot not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const raw = chatbot.rag_content || '';
    if (!raw.trim()) {
      return new Response(JSON.stringify({ message: 'No RAG content to ingest' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const chunks = chunkText(raw);

    // Create embeddings in batches
    const embedResp = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: chunks,
      }),
    });

    if (!embedResp.ok) {
      const txt = await embedResp.text();
      throw new Error(`Embeddings API error: ${txt}`);
    }

    const embedJson = await embedResp.json();
    const vectors: number[][] = embedJson.data.map((d: any) => d.embedding);

    // Clear previous embeddings for this bot
    await supabase.from('document_embeddings').delete().eq('chatbot_id', chatbotId);

    // Insert new rows
    const rows = chunks.map((content, i) => ({
      chatbot_id: chatbotId,
      content,
      embedding: vectors[i],
      metadata: { source: 'rag_content', index: i, business: chatbot.business_name },
    }));

    const { error: insertError } = await supabase.from('document_embeddings').insert(rows);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ inserted: rows.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('ingest-embeddings error:', e);
    return new Response(JSON.stringify({ error: e.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});