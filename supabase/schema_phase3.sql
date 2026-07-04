-- Create followers table
CREATE TABLE public.followers (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  compatibility_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Set up RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Followers Policies
CREATE POLICY "Followers are viewable by everyone."
  ON public.followers FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own follows."
  ON public.followers FOR ALL
  USING (auth.uid() = follower_id);

-- Matches Policies
CREATE POLICY "Users can view their own matches."
  ON public.matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create helper function for mutual matches/followers
CREATE OR REPLACE FUNCTION get_mutual_followers(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.followers WHERE follower_id = user_a AND following_id = user_b
  ) AND EXISTS (
    SELECT 1 FROM public.followers WHERE follower_id = user_b AND following_id = user_a
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
