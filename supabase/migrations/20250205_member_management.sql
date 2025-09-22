-- Member management schema additions
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  external_ref text,
  status text not null default 'active' check (status in ('active', 'inactive', 'pending', 'prospect')),
  tier text not null default 'Silver',
  first_name text,
  last_name text,
  email text not null,
  phone text,
  preferred_airport text,
  city text,
  country text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists members_user_id_idx on public.members(user_id);
create index if not exists members_status_idx on public.members(status);

create trigger members_set_updated_at
before update on public.members
for each row execute function public.set_updated_at();

-- Ensure required columns exist on pre-existing deployments
alter table public.members add column if not exists tier text;
alter table public.members alter column tier set default 'Silver';
update public.members set tier = 'Silver' where tier is null;
alter table public.members alter column tier set not null;
alter table public.members add column if not exists email text;
alter table public.members add column if not exists first_name text;
alter table public.members add column if not exists last_name text;
alter table public.members add column if not exists phone text;
alter table public.members add column if not exists preferred_airport text;
alter table public.members add column if not exists city text;
alter table public.members add column if not exists country text;
alter table public.members add column if not exists notes text;
alter table public.members add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.members add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- Backfill email from profiles when possible
update public.members m
set email = p.email
from public.profiles p
where m.user_id = p.id and (m.email is null or m.email = '');

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  subject text not null,
  details text,
  type text not null check (type in ('concierge', 'flight', 'other')),
  status text not null default 'new' check (status in ('new', 'in_progress', 'awaiting_member', 'completed', 'canceled')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists requests_member_id_idx on public.requests(member_id);
create index if not exists requests_status_idx on public.requests(status);

create trigger requests_set_updated_at
before update on public.requests
for each row execute function public.set_updated_at();

create table if not exists public.request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  message text,
  is_internal boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists request_messages_request_idx on public.request_messages(request_id);

create table if not exists public.flight_requests (
  request_id uuid primary key references public.requests(id) on delete cascade,
  origin text,
  destination text,
  departure_date date,
  return_date date,
  passengers integer,
  cabin_class text,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  itinerary text not null,
  status text not null default 'pending' check (status in ('confirmed', 'pending', 'canceled')),
  amount numeric(12,2) not null default 0,
  commission numeric(12,2) not null default 0,
  currency text not null default 'USD',
  booked_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists bookings_member_id_idx on public.bookings(member_id);

create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

alter table public.members enable row level security;
alter table public.requests enable row level security;
alter table public.request_messages enable row level security;
alter table public.flight_requests enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "members admin access" on public.members;
drop policy if exists "member view self" on public.members;

create policy "members admin access" on public.members
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'ops')
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'ops')
    )
  );

create policy "member view self" on public.members
  for select using (user_id = auth.uid());

drop policy if exists "requests admin access" on public.requests;
drop policy if exists "requests member access" on public.requests;
drop policy if exists "requests member insert" on public.requests;
drop policy if exists "requests member update" on public.requests;

create policy "requests admin access" on public.requests
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'ops')
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'ops')
    )
  );

create policy "requests member access" on public.requests
  for select using (
    exists (
      select 1 from public.members m
      where m.id = requests.member_id and m.user_id = auth.uid()
    )
  );

create policy "requests member insert" on public.requests
  for insert with check (
    exists (
      select 1 from public.members m
      where m.id = requests.member_id and m.user_id = auth.uid()
    )
  );

create policy "requests member update" on public.requests
  for update using (
    exists (
      select 1 from public.members m
      where m.id = requests.member_id and m.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.members m
      where m.id = requests.member_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "request messages admin" on public.request_messages;
drop policy if exists "request messages member" on public.request_messages;
drop policy if exists "request messages member insert" on public.request_messages;

create policy "request messages admin" on public.request_messages
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'ops')
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'ops')
    )
  );

create policy "request messages member" on public.request_messages
  for select using (
    exists (
      select 1 from public.requests r
      join public.members m on m.id = r.member_id
      where r.id = request_messages.request_id and m.user_id = auth.uid()
    )
    and request_messages.is_internal = false
  );

create policy "request messages member insert" on public.request_messages
  for insert with check (
    exists (
      select 1 from public.requests r
      join public.members m on m.id = r.member_id
      where r.id = request_messages.request_id and m.user_id = auth.uid()
    )
    and request_messages.is_internal = false
  );

drop policy if exists "flight requests admin" on public.flight_requests;
drop policy if exists "flight requests member" on public.flight_requests;

create policy "flight requests admin" on public.flight_requests
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'ops')
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'ops')
    )
  );

create policy "flight requests member" on public.flight_requests
  for select using (
    exists (
      select 1 from public.requests r
      join public.members m on m.id = r.member_id
      where r.id = flight_requests.request_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "bookings admin" on public.bookings;
drop policy if exists "bookings member" on public.bookings;

create policy "bookings admin" on public.bookings
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'ops')
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'ops')
    )
  );

create policy "bookings member" on public.bookings
  for select using (
    exists (
      select 1 from public.members m
      where m.id = bookings.member_id and m.user_id = auth.uid()
    )
  );

create or replace view public.member_list as
select
  m.id,
  m.user_id,
  m.status,
  m.tier,
  m.first_name,
  m.last_name,
  m.email,
  m.phone,
  m.preferred_airport,
  m.city,
  m.country,
  m.notes,
  m.created_at,
  m.updated_at,
  coalesce(req_counts.request_count, 0) as request_count,
  coalesce(book_counts.booking_count, 0) as booking_count
from public.members m
left join (
  select member_id, count(*) as request_count
  from public.requests
  group by member_id
) req_counts on req_counts.member_id = m.id
left join (
  select member_id, count(*) as booking_count
  from public.bookings
  group by member_id
) book_counts on book_counts.member_id = m.id;

create or replace view public.member_360 as
select
  m.id as member_id,
  m.first_name,
  m.last_name,
  m.phone,
  m.preferred_airport,
  m.city,
  m.country,
  m.status as member_status,
  m.email,
  p.full_name as profile_name,
  p.role,
  coalesce(
    (
      select json_agg(json_build_object(
        'id', r.id,
        'type', r.type,
        'status', r.status,
        'subject', r.subject,
        'created_at', r.created_at
      ))
      from (
        select id, type, status, subject, created_at
        from public.requests r2
        where r2.member_id = m.id
        order by r2.created_at desc
        limit 5
      ) r
    ),
    '[]'::json
  ) as recent_requests,
  coalesce(
    json_build_array(
      json_build_object(
        'tier', m.tier,
        'start_date', m.created_at,
        'end_date', null,
        'status', case
          when m.status = 'inactive' then 'expired'
          when m.status = 'pending' then 'pending'
          else 'active'
        end
      )
    ),
    '[]'::json
  ) as memberships
from public.members m
left join public.profiles p on p.id = m.user_id;
