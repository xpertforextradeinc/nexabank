-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE SCHEMAS & TABLES

-- Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'frozen', 'hold')) DEFAULT 'active',
  withdrawal_pin_required BOOLEAN DEFAULT true,
  withdrawal_pin TEXT,
  is_upgraded BOOLEAN DEFAULT false,
  phone TEXT,
  mfa_enabled BOOLEAN DEFAULT false,
  verification_status TEXT CHECK (verification_status IN ('verified', 'pending', 'unverified')) DEFAULT 'unverified',
  avatar TEXT,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  withdrawals_locked BOOLEAN DEFAULT false
);

-- Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  main_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  available_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  pending_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  savings_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  category TEXT NOT NULL CHECK (category IN ('deposit', 'withdrawal', 'transfer', 'bonus', 'adjustment', 'shopping', 'food', 'salary', 'utilities')),
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
  reference TEXT NOT NULL
);

-- Deposits Table
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('bank_wire', 'crypto_usdt', 'credit_card')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  reference TEXT NOT NULL
);

-- Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('bank_wire', 'crypto_usdt')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  reference TEXT NOT NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Audit Logs Table (Immutable)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_name TEXT,
  details TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Admin Users Table (For fast admin membership checks)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Transfer History Table
CREATE TABLE IF NOT EXISTS public.transfer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  reference TEXT NOT NULL
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_history ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES

-- Profiles policies
CREATE POLICY "Users can select their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Wallets policies
CREATE POLICY "Users can select their own wallet" ON public.wallets
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can modify wallets directly" ON public.wallets
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can modify transactions" ON public.transactions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Deposits policies
CREATE POLICY "Users can view and request their own deposits" ON public.deposits
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own deposits" ON public.deposits
  FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can modify deposits" ON public.deposits
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Withdrawals policies
CREATE POLICY "Users can view and request their own withdrawals" ON public.withdrawals
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can modify withdrawals" ON public.withdrawals
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update/delete their own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Audit Logs policies (Immutable - Read-only to admins, insertable by system/authenticated users)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users/system can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin Users policies
CREATE POLICY "Anyone authenticated can view admin list" ON public.admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage admin list" ON public.admin_users
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Transfer History policies
CREATE POLICY "Users can view their transfer history" ON public.transfer_history
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- 5. TRIGGER FUNCTIONS

-- Trigger to sync auth.users with public.profiles and public.wallets
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    email, 
    avatar, 
    role, 
    status, 
    verification_status, 
    joined_date, 
    withdrawal_pin_required, 
    withdrawal_pin, 
    is_upgraded, 
    phone, 
    mfa_enabled, 
    withdrawals_locked
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'),
    'user',
    'active',
    CASE WHEN new.email_confirmed_at IS NOT NULL THEN 'verified'::text ELSE 'unverified'::text END,
    timezone('utc'::text, now()),
    true,
    (floor(random() * 9000 + 1000))::text,
    false,
    COALESCE(new.phone, '+1 (555) 019-2831'),
    false,
    false
  );

  INSERT INTO public.wallets (user_id, main_balance, available_balance, pending_balance, savings_balance)
  VALUES (new.id, 0.00, 0.00, 0.00, 0.00);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to sync profile.role with public.admin_users
CREATE OR REPLACE FUNCTION public.handle_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    INSERT INTO public.admin_users (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    DELETE FROM public.admin_users WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_role_changed
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_role_change();

-- 6. SECURE RPC FUNCTIONS FOR TRANSACTION ACID SAFETY

-- Direct peer payment RPC
CREATE OR REPLACE FUNCTION public.transfer_funds(p_recipient_id UUID, p_amount NUMERIC)
RETURNS jsonb AS $$
DECLARE
  v_sender_id UUID := auth.uid();
  v_sender_wallet RECORD;
  v_receiver_wallet RECORD;
  v_sender_profile RECORD;
  v_receiver_profile RECORD;
  v_ref TEXT;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Check sender active status
  SELECT * INTO v_sender_profile FROM public.profiles WHERE id = v_sender_id;
  IF v_sender_profile.status IN ('suspended', 'frozen') THEN
    RAISE EXCEPTION 'Your account is suspended or frozen';
  END IF;

  -- Check if sender withdrawals are locked
  IF v_sender_profile.withdrawals_locked THEN
    RAISE EXCEPTION 'Withdrawals are locked for this account';
  END IF;

  -- Check if recipient exists
  SELECT * INTO v_receiver_profile FROM public.profiles WHERE id = p_recipient_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;

  -- Prevent self-transfers
  IF v_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot transfer money to yourself';
  END IF;

  -- Check sender wallet
  SELECT * INTO v_sender_wallet FROM public.wallets WHERE user_id = v_sender_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sender wallet not found';
  END IF;

  IF v_sender_wallet.available_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds in sender account';
  END IF;

  -- Check receiver wallet
  SELECT * INTO v_receiver_wallet FROM public.wallets WHERE user_id = p_recipient_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Receiver wallet not found';
  END IF;

  -- Update sender balances
  UPDATE public.wallets
  SET available_balance = available_balance - p_amount,
      main_balance = main_balance - p_amount
  WHERE user_id = v_sender_id;

  -- Update receiver balances
  UPDATE public.wallets
  SET available_balance = available_balance + p_amount,
      main_balance = main_balance + p_amount
  WHERE user_id = p_recipient_id;

  -- Reference string
  v_ref := 'NEX-TRF-' || floor(random() * 90000 + 10000)::text;

  -- Create sender transaction
  INSERT INTO public.transactions (user_id, wallet_id, description, amount, category, type, status, reference)
  VALUES (
    v_sender_id,
    v_sender_wallet.id,
    'Peer payment to ' || v_receiver_profile.name,
    p_amount,
    'transfer',
    'debit',
    'completed',
    v_ref
  );

  -- Create receiver transaction
  INSERT INTO public.transactions (user_id, wallet_id, description, amount, category, type, status, reference)
  VALUES (
    p_recipient_id,
    v_receiver_wallet.id,
    'Peer payment from ' || v_sender_profile.name,
    p_amount,
    'transfer',
    'credit',
    'completed',
    v_ref
  );

  -- Create transfer history
  INSERT INTO public.transfer_history (sender_id, receiver_id, amount, reference)
  VALUES (v_sender_id, p_recipient_id, p_amount, v_ref);

  -- Create sender notification
  INSERT INTO public.notifications (user_id, title, message)
  VALUES (
    v_sender_id,
    'Peer Ledger Settled',
    'Direct peer transfer of $' || to_char(p_amount, 'FM999,999,990.00') || ' to ' || v_receiver_profile.name || ' executed in real-time.'
  );

  -- Create receiver notification
  INSERT INTO public.notifications (user_id, title, message)
  VALUES (
    p_recipient_id,
    'Ledger Credited',
    'Direct peer transfer of $' || to_char(p_amount, 'FM999,999,990.00') || ' received from ' || v_sender_profile.name || '.'
  );

  -- Create Audit log
  INSERT INTO public.audit_logs (actor_id, actor_name, action, target_user_id, target_user_name, details)
  VALUES (
    v_sender_id,
    v_sender_profile.name,
    'Peer Settle',
    p_recipient_id,
    v_receiver_profile.name,
    'Direct peer payment of $' || to_char(p_amount, 'FM999,999,990.00') || '.'
  );

  RETURN jsonb_build_object('success', true, 'reference', v_ref);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
