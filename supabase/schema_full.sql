-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  cover_url TEXT,
  gender TEXT,
  date_of_birth DATE,
  country TEXT,
  state TEXT,
  city TEXT,
  bio TEXT,
  occupation TEXT,
  education TEXT,
  relationship_status TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interests table
CREATE TABLE public.interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Create user_interests table
CREATE TABLE public.user_interests (
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_id UUID REFERENCES public.interests(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, interest_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Photos Policies
CREATE POLICY "Photos are viewable by everyone."
  ON public.photos FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own photos."
  ON public.photos FOR ALL
  USING (auth.uid() = profile_id);

-- Interests Policies
CREATE POLICY "Interests are viewable by everyone."
  ON public.interests FOR SELECT
  USING (true);

-- User Interests Policies
CREATE POLICY "User interests are viewable by everyone."
  ON public.user_interests FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own interests."
  ON public.user_interests FOR ALL
  USING (auth.uid() = profile_id);

-- Create a function to automatically handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
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
-- Create conversations table
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, image, voice
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
CREATE POLICY "Users can view their own conversations."
  ON public.conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert conversations if they are part of it."
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their conversations."
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages Policies
CREATE POLICY "Users can view messages in their conversations."
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their conversations."
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages in their conversations."
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- Enable Supabase Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
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
-- Create wallets table
CREATE TABLE public.wallets (
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  balance INTEGER DEFAULT 0,
  total_recharged INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet_transactions table
CREATE TABLE public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES public.wallets(profile_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'recharge', 'gift_sent', 'gift_received', 'call_deduction', 'referral_bonus'
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  reference_id TEXT, -- UPI reference or payment gateway ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coin_packages table
CREATE TABLE public.coin_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coins INTEGER NOT NULL,
  price_inr NUMERIC(10, 2) NOT NULL,
  bonus_coins INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gifts table
CREATE TABLE public.gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  coin_value INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  animation_url TEXT,
  category TEXT DEFAULT 'standard',
  is_active BOOLEAN DEFAULT TRUE
);

-- Set up RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Wallets Policies
CREATE POLICY "Users can view their own wallet."
  ON public.wallets FOR SELECT
  USING (auth.uid() = profile_id);

-- Wallet Transactions Policies
CREATE POLICY "Users can view their own transactions."
  ON public.wallet_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wallets w
      WHERE w.profile_id = wallet_transactions.wallet_id
      AND w.profile_id = auth.uid()
    )
  );

-- Packages & Gifts Policies
CREATE POLICY "Packages are viewable by everyone."
  ON public.coin_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Gifts are viewable by everyone."
  ON public.gifts FOR SELECT
  USING (is_active = true);

-- Auto-create wallet trigger
CREATE OR REPLACE FUNCTION public.handle_new_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (profile_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_wallet();
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
