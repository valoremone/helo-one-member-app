-- ASSUMPTION: This migration augments existing public.members and adds public.member_codes per PMC spec.
-- Idempotent guards used where possible to avoid breaking existing data.

-- 1) members.account_id column and index
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS account_id uuid;

CREATE INDEX IF NOT EXISTS members_account_id_idx ON public.members(account_id);

-- 2) member_codes table
CREATE TABLE IF NOT EXISTS public.member_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  core text NOT NULL,
  display text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('F50','H1','FF')),
  nm2 char(2) NOT NULL,
  sig char(4) NOT NULL,
  rand char(4) NOT NULL,
  chk char(1) NOT NULL,
  role char(1) NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

-- Only one active code per member
CREATE UNIQUE INDEX IF NOT EXISTS uq_member_codes_active_member
ON public.member_codes(member_id)
WHERE status = 'active';

-- PMC uniqueness across all active codes
CREATE UNIQUE INDEX IF NOT EXISTS uq_member_codes_active_core
ON public.member_codes(core, role)
WHERE status = 'active';

-- 3) RLS
ALTER TABLE public.member_codes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "member_codes_admin_all"
  ON public.member_codes
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','ops')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','ops')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "member_codes_self_read"
  ON public.member_codes
  FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM public.members m
      WHERE m.id = member_id AND m.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


