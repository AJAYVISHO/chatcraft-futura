-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table for RAG functionality
CREATE TABLE IF NOT EXISTS public.document_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search (only if not exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'document_embeddings_embedding_ivfflat_idx'
  ) THEN
    EXECUTE 'CREATE INDEX document_embeddings_embedding_ivfflat_idx ON public.document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'document_embeddings' AND policyname = 'Users can view embeddings for their chatbots'
  ) THEN
    CREATE POLICY "Users can view embeddings for their chatbots" 
    ON public.document_embeddings 
    FOR SELECT 
    USING (
      chatbot_id IN (
        SELECT id FROM public.chatbots WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'document_embeddings' AND policyname = 'Users can create embeddings for their chatbots'
  ) THEN
    CREATE POLICY "Users can create embeddings for their chatbots" 
    ON public.document_embeddings 
    FOR INSERT 
    WITH CHECK (
      chatbot_id IN (
        SELECT id FROM public.chatbots WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'document_embeddings' AND policyname = 'Users can update embeddings for their chatbots'
  ) THEN
    CREATE POLICY "Users can update embeddings for their chatbots" 
    ON public.document_embeddings 
    FOR UPDATE 
    USING (
      chatbot_id IN (
        SELECT id FROM public.chatbots WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'document_embeddings' AND policyname = 'Users can delete embeddings for their chatbots'
  ) THEN
    CREATE POLICY "Users can delete embeddings for their chatbots" 
    ON public.document_embeddings 
    FOR DELETE 
    USING (
      chatbot_id IN (
        SELECT id FROM public.chatbots WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_document_embeddings_updated_at'
  ) THEN
    CREATE TRIGGER update_document_embeddings_updated_at
    BEFORE UPDATE ON public.document_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Similarity search function
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536),
  chatbot_id_param uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM public.document_embeddings
  WHERE 
    document_embeddings.chatbot_id = chatbot_id_param
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;