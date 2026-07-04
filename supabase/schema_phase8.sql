-- Create blocks table
CREATE TABLE public.blocks (
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'action_taken', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_matches table
CREATE TABLE public.ai_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ai_score INTEGER DEFAULT 0,
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, matched_user_id)
);

-- Set up RLS
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_matches ENABLE ROW LEVEL SECURITY;

-- Blocks Policies
CREATE POLICY "Users can view who they blocked."
  ON public.blocks FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert blocks."
  ON public.blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their blocks."
  ON public.blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- Reports Policies
CREATE POLICY "Users can view reports they submitted."
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can submit reports."
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- AI Matches Policies
CREATE POLICY "Users can view their AI matches."
  ON public.ai_matches FOR SELECT
  USING (auth.uid() = user_id);

-- Filter profiles query helper (removes blocked/blockers from view)
CREATE OR REPLACE FUNCTION get_viewable_profiles(viewer_id UUID)
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY
  SELECT p.* FROM public.profiles p
  WHERE p.id != viewer_id
  AND NOT EXISTS (
    SELECT 1 FROM public.blocks b
    WHERE (b.blocker_id = viewer_id AND b.blocked_id = p.id)
       OR (b.blocker_id = p.id AND b.blocked_id = viewer_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
