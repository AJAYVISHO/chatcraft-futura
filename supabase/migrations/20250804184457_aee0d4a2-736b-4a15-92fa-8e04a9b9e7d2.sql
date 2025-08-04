-- Add user_id column to chatbots table if it doesn't exist
ALTER TABLE public.chatbots 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chatbots_user_id ON public.chatbots(user_id);