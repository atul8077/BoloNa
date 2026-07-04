-- Create messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call_logs table
CREATE TABLE public.call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL, -- 'audio', 'video'
  status TEXT DEFAULT 'initiated', -- 'initiated', 'ongoing', 'completed', 'missed', 'rejected'
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 0 -- in seconds
);

-- Push subscriptions table (for Web Push)
CREATE TABLE public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Set up RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Messages Policies
CREATE POLICY "Users can insert their own messages."
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view messages they sent or received."
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can update status of received messages."
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Call Logs Policies
CREATE POLICY "Users can insert call logs as caller."
  ON public.call_logs FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can view their call logs."
  ON public.call_logs FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can update their call logs."
  ON public.call_logs FOR UPDATE
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Push Subscriptions Policies
CREATE POLICY "Users can insert their own push subscriptions."
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own push subscriptions."
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions."
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger for messages
CREATE OR REPLACE FUNCTION update_messages_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_modtime
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE PROCEDURE update_messages_updated_at_column();
