-- ASSUMPTION: Add date-of-birth to members for SIG derivation; nullable for existing records.

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS dob date;


