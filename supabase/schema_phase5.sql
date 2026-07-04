-- Create calls table
CREATE TABLE public.calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL, -- 'audio' or 'video'
  status TEXT DEFAULT 'initiated', -- 'initiated', 'ongoing', 'completed', 'missed', 'rejected'
  duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Set up RLS
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Calls Policies
CREATE POLICY "Users can view their own calls."
  ON public.calls FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert calls they initiate."
  ON public.calls FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their calls."
  ON public.calls FOR UPDATE
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);
