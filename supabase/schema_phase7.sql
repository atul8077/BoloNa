-- Create admin_users table
CREATE TABLE public.admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'admin', -- 'super_admin', 'admin', 'moderator', 'support'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create creator_profiles table
CREATE TABLE public.creator_profiles (
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended'
  total_earnings INTEGER DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  call_price INTEGER DEFAULT 50, -- Coins per minute for audio
  video_call_price INTEGER DEFAULT 100, -- Coins per minute for video
  is_busy BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create live_streams table
CREATE TABLE public.live_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.creator_profiles(profile_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'live', -- 'scheduled', 'live', 'ended'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Set up RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- Admins Policies
CREATE POLICY "Admins can view admins"
  ON public.admin_users FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Creator Profiles Policies
CREATE POLICY "Creator profiles are viewable by everyone."
  ON public.creator_profiles FOR SELECT
  USING (true);

CREATE POLICY "Creators can update their own settings."
  ON public.creator_profiles FOR UPDATE
  USING (auth.uid() = profile_id);

-- Live Streams Policies
CREATE POLICY "Live streams are viewable by everyone."
  ON public.live_streams FOR SELECT
  USING (true);

CREATE POLICY "Hosts can manage their own streams."
  ON public.live_streams FOR ALL
  USING (auth.uid() = host_id);
