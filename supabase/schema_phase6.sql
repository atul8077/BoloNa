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
