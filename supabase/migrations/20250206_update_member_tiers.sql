-- Update member tier constraints to new values
-- ASSUMPTION: Mapping existing tiers to new ones: Platinum -> Founding50, Gold -> House, Silver -> Standard

-- First, update existing data to map to new tier values
update public.members 
set tier = case 
  when tier = 'Platinum' then 'Founding50'
  when tier = 'Gold' then 'House' 
  when tier = 'Silver' then 'Standard'
  else 'Standard' -- fallback for any unexpected values
end;

-- Update the default tier
alter table public.members alter column tier set default 'Standard';

-- Drop the existing check constraint (if it exists)
alter table public.members drop constraint if exists members_tier_check;

-- Add new check constraint for the new tier values
alter table public.members add constraint members_tier_check 
check (tier in ('Founding50', 'Standard', 'House', 'Corporate'));

-- Update any existing memberships table if it has tier constraints
do $$
begin
  -- Check if memberships table exists and has tier column
  if exists (
    select 1 from information_schema.columns 
    where table_name = 'memberships' 
    and column_name = 'tier'
    and table_schema = 'public'
  ) then
    -- Update existing memberships data
    update public.memberships 
    set tier = case 
      when tier = 'Platinum' then 'Founding50'
      when tier = 'Gold' then 'House' 
      when tier = 'Silver' then 'Standard'
      else 'Standard'
    end;
    
    -- Drop and recreate constraint for memberships if it exists
    alter table public.memberships drop constraint if exists memberships_tier_check;
    alter table public.memberships add constraint memberships_tier_check 
    check (tier in ('Founding50', 'Standard', 'House', 'Corporate'));
  end if;
end $$;
