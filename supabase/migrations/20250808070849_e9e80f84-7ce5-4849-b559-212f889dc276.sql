-- Create embeddings table for RAG functionality
CREATE TABLE public.document_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX ON document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies for document embeddings
CREATE POLICY "Users can view embeddings for their chatbots" 
ON public.document_embeddings 
FOR SELECT 
USING (
  chatbot_id IN (
    SELECT id FROM public.chatbots WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create embeddings for their chatbots" 
ON public.document_embeddings 
FOR INSERT 
WITH CHECK (
  chatbot_id IN (
    SELECT id FROM public.chatbots WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update embeddings for their chatbots" 
ON public.document_embeddings 
FOR UPDATE 
USING (
  chatbot_id IN (
    SELECT id FROM public.chatbots WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete embeddings for their chatbots" 
ON public.document_embeddings 
FOR DELETE 
USING (
  chatbot_id IN (
    SELECT id FROM public.chatbots WHERE user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_document_embeddings_updated_at
BEFORE UPDATE ON public.document_embeddings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for similarity search
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
  FROM document_embeddings
  WHERE 
    document_embeddings.chatbot_id = chatbot_id_param
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;