# Helo One Member App

A premium concierge services platform with member and admin portals, built with Next.js, Supabase, and shadcn/ui.

## Features

- **Member Portal**: Submit requests, view request history, and communicate with support
- **Admin Portal**: Manage requests, view member 360 profiles, and handle internal communications
- **Flight Request System**: Comprehensive flight booking request form with detailed preferences
- **Request Management**: Threaded messaging system with internal notes for staff
- **Authentication**: Secure email-based authentication via Supabase Auth
- **Role-based Access**: Member, Admin, and Ops roles with appropriate permissions

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.18.0+ (see `.nvmrc`)
- A Supabase project

### 1. Clone and Install

```bash
git clone https://github.com/valoremone/helo-one-member-app.git
cd helo-one-member-app
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the following SQL to create the database schema:

```sql
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'member' check (role in ('member','admin','ops')),
  organization_id uuid references public.organizations(id),
  created_at timestamptz default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  external_ref text,
  status text default 'active' check (status in ('active','inactive','prospect')),
  first_name text,
  last_name text,
  phone text,
  preferred_airport text,
  city text,
  country text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  tier text not null,
  start_date date not null,
  end_date date,
  status text default 'active' check (status in ('active','expired','pending')),
  created_at timestamptz default now()
);

create type request_type as enum ('flight','ground','experience','general');
create type request_status as enum ('new','in_progress','awaiting_member','completed','canceled');

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  type request_type not null,
  status request_status default 'new',
  subject text not null,
  priority int default 3 check (priority between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text,
  is_internal boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.flight_requests (
  request_id uuid primary key references public.requests(id) on delete cascade,
  trip_purpose text,
  pax_count int check (pax_count > 0),
  origin text not null,
  destination text not null,
  earliest_departure timestamptz,
  latest_departure timestamptz,
  return_earliest timestamptz,
  return_latest timestamptz,
  one_way boolean default true,
  cabin_preference text,
  baggage_notes text,
  special_requests text
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  created_at timestamptz default now()
);

create or replace view public.member_360 as
select m.id as member_id,
       m.first_name,
       m.last_name,
       m.phone,
       m.preferred_airport,
       m.city,
       m.country,
       m.status as member_status,
       p.email,
       p.full_name as profile_name,
       p.role,
       (select jsonb_agg(jsonb_build_object(
            'id', r.id,
            'type', r.type,
            'status', r.status,
            'subject', r.subject,
            'created_at', r.created_at
        ) order by r.created_at desc)
        from public.requests r where r.member_id = m.id) as recent_requests,
       (select jsonb_agg(jsonb_build_object(
            'tier', ms.tier,
            'start_date', ms.start_date,
            'end_date', ms.end_date,
            'status', ms.status
        ) order by ms.start_date desc)
        from public.memberships ms where ms.member_id = m.id) as memberships
from public.members m
left join public.profiles p on p.id = m.user_id;

-- Enable RLS
alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);
create policy "staff read profiles" on public.profiles for select using (exists (
  select 1 from public.profiles sp where sp.id = auth.uid() and sp.role in ('admin','ops')
));

alter table public.members enable row level security;
create policy "member read self" on public.members for select using (user_id = auth.uid());
create policy "staff all members" on public.members for all using (exists (
  select 1 from public.profiles sp where sp.id = auth.uid() and sp.role in ('admin','ops')
));

alter table public.memberships enable row level security;
create policy "member read own memberships" on public.memberships for select using (
  exists (select 1 from public.members m where m.id = memberships.member_id and m.user_id = auth.uid())
);
create policy "staff all memberships" on public.memberships for all using (exists (
  select 1 from public.profiles sp where sp.id = auth.uid() and sp.role in ('admin','ops')
));

alter table public.requests enable row level security;
create policy "member read/write own requests" on public.requests for select using (
  exists (select 1 from public.members m where m.id = requests.member_id and m.user_id = auth.uid())
);
create policy "member insert own requests" on public.requests for insert with check (
  exists (select 1 from public.members m where m.id = member_id and m.user_id = auth.uid())
);
create policy "staff all requests" on public.requests for all using (exists (
  select 1 from public.profiles sp where sp.id = auth.uid() and sp.role in ('admin','ops')
));

alter table public.request_messages enable row level security;
create policy "member read own request messages" on public.request_messages for select using (
  exists (
    select 1 from public.requests r
    join public.members m on m.id = r.member_id
    where r.id = request_messages.request_id and m.user_id = auth.uid()
  ) and (is_internal = false)
);
create policy "member insert on own requests" on public.request_messages for insert with check (
  exists (
    select 1 from public.requests r
    join public.members m on m.id = r.member_id
    where r.id = request_id and m.user_id = auth.uid()
  ) and (is_internal = false)
);
create policy "staff all messages" on public.request_messages for all using (exists (
  select 1 from public.profiles sp where sp.id = auth.uid() and sp.role in ('admin','ops')
));

alter table public.flight_requests enable row level security;
create policy "member read own flight requests" on public.flight_requests for select using (
  exists (
    select 1 from public.requests r
    join public.members m on m.id = r.member_id
    where r.id = flight_requests.request_id and m.user_id = auth.uid()
  )
);
create policy "member insert own flight requests" on public.flight_requests for insert with check (
  exists (
    select 1 from public.requests r
    join public.members m on m.id = r.member_id
    where r.id = request_id and m.user_id = auth.uid()
  )
);
create policy "staff all flight requests" on public.flight_requests for all using (exists (
  select 1 from public.profiles sp where sp.id = auth.uid() and sp.role in ('admin','ops')
));
```

### 3. Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Create Initial Admin User

1. Sign up for an account through the app
2. In your Supabase dashboard, go to the SQL Editor
3. Run this query to make your user an admin and create a member record:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Create a member record for the admin user
INSERT INTO public.members (user_id, first_name, last_name, status)
SELECT id, full_name, '', 'active'
FROM public.profiles 
WHERE email = 'your-email@example.com';
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (auth)/
│   ├── login/
│   └── auth/
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── requests/[id]/
│   └── members/[memberId]/
├── member/
│   ├── layout.tsx
│   ├── page.tsx
│   └── requests/
│       ├── new/flight/
│       └── [id]/
├── api/
│   ├── requests/
│   └── member360/
├── layout.tsx
└── page.tsx

components/
├── ui/ (shadcn/ui components)
├── Navigation.tsx
├── RequestFormFlight.tsx
├── RequestThread.tsx
└── DataTable.tsx

lib/
├── auth.ts
├── supabaseClient.ts
├── supabaseServer.ts
└── types.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Deployment

### Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

The app is configured with `vercel.json` for optimal deployment settings.

## Features Overview

### Member Portal
- Dashboard with request overview
- Flight request form with detailed preferences
- Request history and status tracking
- Communication with support team

### Admin Portal
- Request queue with filtering and status management
- Member 360 view with complete member information
- Internal messaging system
- Request assignment and priority management

### Security
- Row Level Security (RLS) on all database tables
- Role-based access control
- Secure authentication via Supabase Auth
- Protected API routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
