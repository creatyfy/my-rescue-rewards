
-- ============================================================
-- REFERRAL SYSTEM MIGRATION
-- ============================================================

-- 1. referral_codes: stores each user's unique permanent code
CREATE TABLE public.referral_codes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE,
  code       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Users can only read their own code; writes are via SECURITY DEFINER functions only
CREATE POLICY "Referral codes: select own"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Referral codes: admins select all"
  ON public.referral_codes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));


-- 2. referral_events: tracks every referral event with identity hashes (LGPD-safe)
-- No FK with CASCADE to auth.users so records survive account deletion
CREATE TABLE public.referral_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id       uuid NOT NULL,
  referred_user_id  uuid NOT NULL,
  email_hash        text NOT NULL,
  cpf_hash          text NOT NULL,
  points_granted    boolean NOT NULL DEFAULT false,
  status            text NOT NULL DEFAULT 'valid'
                    CHECK (status IN ('valid', 'recorrencia_detectada')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

-- Referrer sees their own events; admins see all; no direct writes
CREATE POLICY "Referral events: select own as referrer"
  ON public.referral_events FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Referral events: admins select all"
  ON public.referral_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));


-- 3. referral_welcome_shown: tracks whether the welcome modal was already displayed
CREATE TABLE public.referral_welcome_shown (
  user_id  uuid PRIMARY KEY,
  shown_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_welcome_shown ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referral welcome shown: select own"
  ON public.referral_welcome_shown FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Referral welcome shown: insert own"
  ON public.referral_welcome_shown FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- RPC: generate_referral_code
-- Called by the Edge Function after user creation
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id uuid, p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (p_user_id, p_code)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;


-- ============================================================
-- RPC: process_referral_bonus (atomic, SECURITY DEFINER)
-- Verifies identity hashes and credits 100 pts if first time
-- ============================================================
CREATE OR REPLACE FUNCTION public.process_referral_bonus(
  p_referrer_id      uuid,
  p_referred_user_id uuid,
  p_email_hash       text,
  p_cpf_hash         text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already_exists boolean;
  v_status         text;
  v_granted        boolean;
BEGIN
  -- Check if this identity (email OR CPF hash) has already generated a bonus
  SELECT EXISTS (
    SELECT 1
    FROM public.referral_events
    WHERE email_hash = p_email_hash
       OR cpf_hash   = p_cpf_hash
  ) INTO v_already_exists;

  IF v_already_exists THEN
    v_status  := 'recorrencia_detectada';
    v_granted := false;
  ELSE
    v_status  := 'valid';
    v_granted := true;
  END IF;

  -- Always insert the event for audit trail
  INSERT INTO public.referral_events (
    referrer_id, referred_user_id, email_hash, cpf_hash, points_granted, status
  ) VALUES (
    p_referrer_id, p_referred_user_id, p_email_hash, p_cpf_hash, v_granted, v_status
  );

  -- Only credit points if this is a new identity
  IF v_granted THEN
    INSERT INTO public.points_ledger (user_id, ledger_type, amount)
    VALUES (p_referrer_id, 'adjustment', 100);
  END IF;

  RETURN jsonb_build_object(
    'points_granted', v_granted,
    'status', v_status
  );
END;
$$;


-- ============================================================
-- RPC: get_referral_stats
-- Returns stats for the "Indique e Ganhe" page
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id uuid)
RETURNS TABLE(total_referred int, total_points_earned int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::int                                           AS total_referred,
    (COUNT(*) FILTER (WHERE points_granted) * 100)::int    AS total_points_earned
  FROM public.referral_events
  WHERE referrer_id = p_user_id
    AND status = 'valid';
$$;


-- ============================================================
-- RPC: mark_referral_welcome_shown
-- Inserts the record so modal never shows again
-- ============================================================
CREATE OR REPLACE FUNCTION public.mark_referral_welcome_shown(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.referral_welcome_shown (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;


-- ============================================================
-- RPC: has_referral_welcome_been_shown
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_referral_welcome_been_shown(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.referral_welcome_shown WHERE user_id = p_user_id
  );
$$;


-- ============================================================
-- Index for performance
-- ============================================================
CREATE INDEX idx_referral_events_email_hash ON public.referral_events (email_hash);
CREATE INDEX idx_referral_events_cpf_hash   ON public.referral_events (cpf_hash);
CREATE INDEX idx_referral_events_referrer   ON public.referral_events (referrer_id);
CREATE INDEX idx_referral_codes_code        ON public.referral_codes  (code);
