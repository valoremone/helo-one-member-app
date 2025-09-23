### HELO One Data & API Map

This document describes the database schema (tables, views, relationships, policies, and indexes) and maps API routes to the data they read/write.

Generated from the checked-in migration `supabase/migrations/20250205_member_management.sql` and the Next.js API routes under `app/api/*`.

---

## Schema overview

- Tables (public): `members`, `requests`, `request_messages`, `flight_requests`, `bookings`, `attachments`, `memberships`, `organizations`, `profiles`
- Views (public): `member_list`, `member_360` (definitions not returned via information_schema on this project)
- Referenced tables (external): `auth.users`
- RLS: enabled on `members`, `requests`, `request_messages`, `flight_requests`, `bookings`, `profiles`, `memberships` (per policy listing). `attachments` currently shows RLS disabled.

### MCP validation snapshot
- Project: https://zbkbeqidbeqatcwmajia.supabase.co
- Verified via MCP: tables, indexes, and policies fetched successfully
- Migrations present: `20250205_member_management`

---

## Tables

### members
- Purpose: Master record for each member profile.
- Columns:
  - `id uuid pk default gen_random_uuid()`
  - `user_id uuid fk -> auth.users(id) on delete set null`
  - `external_ref text`
  - `status text not null default 'active'` one of `active|inactive|pending|prospect`
  - `tier text not null default 'Standard'` one of `Founding50|Standard|House|Corporate` (app-level)
  - `first_name text`
  - `last_name text`
  - `email text not null`
  - `phone text`
  - `preferred_airport text`
  - `city text`
  - `country text`
  - `notes text`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- Indexes:
  - `members_user_id_idx(user_id)`
  - `members_status_idx(status)`
- Triggers:
  - `members_set_updated_at` → sets `updated_at` on update
- RLS policies (MCP):
  - "members admin access" (ALL)
  - "member view self" (SELECT)
  - "member read self" (SELECT)
  - "Users can read own member record" (SELECT)
  - "Users can insert own member record" (INSERT with check `auth.uid() = user_id`)
- Live MCP schema differences:
  - Status check set is `{active, inactive, prospect}` (does not include `pending`)
  - `email` is nullable in live DB
- Example row:
```json
{
  "id": "c1f6…",
  "user_id": "a8b2…",
  "external_ref": null,
  "status": "active",
  "tier": "Founding50",
  "first_name": "Ava",
  "last_name": "Stone",
  "email": "ava@example.com",
  "phone": "+1 555 0100",
  "preferred_airport": "JFK",
  "city": "New York",
  "country": "US",
  "notes": null,
  "created_at": "2025-02-06T12:00:00Z",
  "updated_at": "2025-02-06T12:00:00Z"
}
```

### requests
- Purpose: Member service requests (concierge/flight/other).
- Columns (app intent from migration):
  - `id uuid pk default gen_random_uuid()`
  - `member_id uuid not null fk -> members(id) on delete cascade`
  - `created_by uuid fk -> profiles(id) on delete set null`
  - `subject text not null`
  - `details text`
  - `type text not null` one of `concierge|flight|other`
  - `status text not null default 'new'` one of `new|in_progress|awaiting_member|completed|canceled`
  - `priority text not null default 'medium'` one of `high|medium|low`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- Indexes:
  - `requests_member_id_idx(member_id)`
  - `requests_status_idx(status)`
- Triggers:
  - `requests_set_updated_at` → sets `updated_at` on update
- RLS policies (MCP):
  - "requests admin access" (ALL)
  - "requests member access" (SELECT)
  - "requests member insert" (INSERT)
  - "requests member update" (UPDATE)
  - "member read/write own requests" (SELECT)
  - "member insert own requests" (INSERT)
- Live MCP schema:
  - `type` is enum `request_type` with values `{flight, ground, experience, general}`
  - `status` is enum `request_status` with values `{new, in_progress, awaiting_member, completed, canceled}`
  - `priority` is `integer` default `3` with check `1 <= priority <= 5`
  - `details` column not reported by MCP on live DB
- Example row:
```json
{
  "id": "f9ab…",
  "member_id": "c1f6…",
  "created_by": null,
  "subject": "Dinner reservation in Paris",
  "details": "Table for 2 at 8pm",
  "type": "concierge",
  "status": "in_progress",
  "priority": "high",
  "created_at": "2025-02-06T12:10:00Z",
  "updated_at": "2025-02-06T13:00:00Z"
}
```

### request_messages
- Purpose: Threaded messages on a request (member/admin), with internal messages hidden from members.
- Columns (app intent from migration):
  - `id uuid pk default gen_random_uuid()`
  - `request_id uuid not null fk -> requests(id) on delete cascade`
  - `sender_id uuid fk -> profiles(id) on delete set null`
  - `message text`
  - `is_internal boolean not null default false`
  - `created_at timestamptz not null default now()`
- Indexes:
  - `request_messages_request_idx(request_id)`
- RLS policies (MCP, condensed):
  - Admin: "request messages admin" (ALL)
  - Member read own (SELECT): "request messages member" / "member read own request messages"
  - Member insert own (INSERT): "request messages member insert" / "member insert on own requests" (enforces `is_internal = false`)
- Live MCP schema:
  - Column names are `author_id` and `body` instead of `sender_id` and `message`
- Example row:
```json
{
  "id": "9f2d…",
  "request_id": "f9ab…",
  "sender_id": "a8b2…",
  "message": "Here are options",
  "is_internal": false,
  "created_at": "2025-02-06T12:15:00Z"
}
```

### flight_requests
- Purpose: Flight-specific details attached 1:1 to a `requests` row when `type = 'flight'`.
- Columns (app intent from migration):
  - `request_id uuid pk fk -> requests(id) on delete cascade`
  - `origin text`
  - `destination text`
  - `departure_date date`
  - `return_date date`
  - `passengers integer`
  - `cabin_class text`
  - `notes text`
  - `created_at timestamptz not null default now()`
- RLS policies (MCP):
  - "flight requests admin" (ALL)
  - "flight requests member" (SELECT)
  - "member read own flight requests" (SELECT)
  - "member insert own flight requests" (INSERT)
- Live MCP schema:
  - Columns include: `trip_purpose, pax_count (>0), origin, destination, earliest_departure, latest_departure, return_earliest, return_latest, one_way (default true), cabin_preference, baggage_notes, special_requests`
- Example row:
```json
{
  "request_id": "c0d3…",
  "origin": "LAX",
  "destination": "CUN",
  "departure_date": "2025-03-01",
  "return_date": "2025-03-07",
  "passengers": 4,
  "cabin_class": "business",
  "notes": "Prefer morning",
  "created_at": "2025-02-06T12:20:00Z"
}
```

### bookings
- Purpose: Confirmed bookings tied to a member with financials.
- Columns:
  - `id uuid pk default gen_random_uuid()`
  - `member_id uuid not null fk -> members(id) on delete cascade`
  - `itinerary text not null`
  - `status text not null default 'pending'` one of `confirmed|pending|canceled`
  - `amount numeric(12,2) not null default 0`
  - `commission numeric(12,2) not null default 0`
  - `currency text not null default 'USD'`
  - `booked_date date`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- Indexes:
  - `bookings_member_id_idx(member_id)`
- Triggers:
  - `bookings_set_updated_at` → sets `updated_at` on update
- RLS policies:
  - "bookings admin": admins/ops can do all ops
  - "bookings member": members can `select` their own rows

### attachments (MCP)
- Purpose: Files attached to requests
- Columns:
  - `id uuid pk default gen_random_uuid()`
  - `request_id uuid`
  - `storage_path text`
  - `filename text`
  - `created_at timestamptz default now()`
- RLS: disabled (consider enabling with policies if member-visible)
- Indexes: `attachments_pkey`

### memberships (MCP)
- Purpose: Explicit membership periods per member
- Columns:
  - `id uuid pk default gen_random_uuid()`
  - `member_id uuid fk -> members(id)`
  - `tier text`
  - `start_date date`
  - `end_date date?`
  - `status text default 'active'` one of `{active, expired, pending}`
  - `created_at timestamptz default now()`
- RLS policies: member can read own memberships (two equivalent policies reported)
- Indexes: `memberships_pkey`

### organizations (MCP)
- Purpose: Organizations catalog
- Columns:
  - `id uuid pk default gen_random_uuid()`
  - `name text`
  - `created_at timestamptz default now()`
- Indexes: `organizations_pkey`

### profiles (MCP)
- Purpose: User profile overlay on `auth.users`
- Columns:
  - `id uuid pk fk -> auth.users(id)`
  - `email text`
  - `full_name text`
  - `role text default 'member'` one of `{member, admin, ops}`
  - `created_at timestamptz default now()`
  - `updated_at timestamptz default now()`
- RLS policies: "Allow all operations" (ALL with `true` qual) — validate against security expectations
- Indexes: `profiles_pkey`
- Example row:
```json
{
  "id": "b00k…",
  "member_id": "c1f6…",
  "itinerary": "Private Jet - NYC to Aspen",
  "status": "confirmed",
  "amount": 15000.00,
  "commission": 1500.00,
  "currency": "USD",
  "booked_date": "2025-02-10",
  "created_at": "2025-02-11T10:00:00Z",
  "updated_at": "2025-02-11T10:00:00Z"
}
```

---

## Views

### member_list
- Purpose: Flat list of members enriched with counts.
- Columns (selected):
  - All core member fields: `id, user_id, status, tier, first_name, last_name, email, phone, preferred_airport, city, country, notes, created_at, updated_at`
  - `request_count int` → `count(*)` of `requests` per member
  - `booking_count int` → `count(*)` of `bookings` per member

### member_360
- Purpose: Single-member 360 view with recent requests and computed membership array.
- Columns (selected):
  - `member_id, first_name, last_name, phone, preferred_airport, city, country, member_status, email, profile_name, role`
  - `recent_requests json[]` (up to 5 most recent requests with `id, type, status, subject, created_at`)
  - `memberships json[]` (derived from `members.tier` + dates + mapped status)

---

## Relationships

- `members (1) ── (many) requests`
- `requests (1) ── (many) request_messages`
- `requests (1) ── (0..1) flight_requests`
- `members (1) ── (many) bookings`
- `members.user_id → auth.users(id)`
- `request_messages.sender_id → profiles(id)`

---

## RLS summary

- Admin/ops have full access on all tables via explicit policies.
- Members can:
  - read their own `members` row
  - read/insert/update their own `requests`
  - read/insert non-internal `request_messages` on their requests
  - read `flight_requests` for their requests
  - read their own `bookings`

---

## Indexes

From MCP:
- attachments: `attachments_pkey`
- bookings: `bookings_pkey`, `bookings_member_id_idx`
- flight_requests: `flight_requests_pkey`
- members: `members_pkey`, `members_user_id_idx`, `members_status_idx`
- memberships: `memberships_pkey`
- organizations: `organizations_pkey`
- profiles: `profiles_pkey`
- request_messages: `request_messages_pkey`, `request_messages_request_idx`
- requests: `requests_pkey`, `requests_member_id_idx`, `requests_status_idx`

---

## API Map (Next.js `app/api/*`)

### POST `/api/admin/members`
- Auth: Admin only
- Validates body with zod:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "status": "active|inactive|pending|prospect",
  "tier": "Founding50|Standard|House|Corporate",
  "phone": "string?",
  "city": "string?",
  "country": "string?",
  "preferredAirport": "string?",
  "notes": "string?"
}
```
- Writes: `members.insert`
- Response: `{ member }` (inserted row)

### PATCH `/api/admin/members/[memberId]`
- Auth: Admin only
- Validates body with zod (all fields optional; at least one required):
```json
{
  "firstName?": "string",
  "lastName?": "string",
  "email?": "string",
  "status?": "active|inactive|pending|prospect",
  "tier?": "Founding50|Standard|House|Corporate",
  "phone?": "string|null",
  "city?": "string|null",
  "country?": "string|null",
  "preferredAirport?": "string|null",
  "notes?": "string|null"
}
```
- Writes: `members.update(where id = :memberId)`
- Response: `{ member }` (updated row)

### GET `/api/member360/[memberId]`
- Auth: Admin only
- Reads: `member_360` view filtered by `member_id`
- Response: full 360 record (single row)

### PATCH `/api/profile`
- Auth: signed-in user
- Writes:
  - `public.profiles.update` (full_name)
  - `supabase.auth.updateUser` (user metadata: `signature`, `concierge_notes`)
- Response: `{ profile, metadata }`

### POST `/api/requests`
- Auth: member (must resolve to a `members` row via `user_id`)
- Validates body with zod:
```json
{
  "type": "concierge|flight",
  "title": "string",
  "category?": "string",
  "details": "string",
  "origin?": "string",
  "destination?": "string",
  "departureDate?": "string",
  "returnDate?": "string",
  "passengers?": 1,
  "cabin?": "string",
  "notes?": "string"
}
```
- Writes:
  - `requests.insert`
  - if `type = 'flight'`: `flight_requests.insert`
  - seed thread: `request_messages.insert` (non-internal)
- Response: `{ ok: true, data: { id, type, subject, status } }`

### GET `/api/requests`
- Auth: member
- Reads: `requests` for the member (via resolved `member_id`)
- Response: `{ ok: true, data: Request[] }`

### GET `/api/requests/[id]/messages`
- Auth: member or admin/ops
- Reads: `request_messages` joined to `profiles(sender)`
  - Admin: all messages
  - Member: `is_internal = false`
- Response: `Message[]`

### POST `/api/requests/[id]/messages`
- Auth: member or admin/ops
- Validates body with zod:
```json
{ "message": "string", "is_internal": false }
```
- Writes: `request_messages.insert`
  - Member cannot create internal messages
- Response: created message row with sender profile fields

---

## Page-level server reads (selected)

- Admin
  - `app/admin/requests/page.tsx` → `requests` + joined `members`
  - `app/admin/requests/[id]/page.tsx` → `requests` (by id) + `flight_requests` when `type='flight'`
  - `app/admin/bookings/page.tsx` → `bookings` + joined `members`
  - `app/admin/members/page.tsx` → `member_list`
  - `app/admin/members/[memberId]/page.tsx` → `member_360`
- Member
  - `app/member/requests/page.tsx` → `requests` for current member
  - `app/member/requests/[id]/page.tsx` → `requests` (by id, ownership enforced) + `flight_requests`

---

## Validation notes

Validated via MCP
- Connected to project and listed tables, policies, indexes successfully
- Views `member_list` and `member_360` are present; `information_schema.views` returned null definitions (likely permission or view security setting)

Notable app vs live schema differences (action items)
- `requests.type` live is enum `{flight, ground, experience, general}` vs app expects `'concierge'|'flight'|…`
- `requests.priority` live is `integer (1..5)` vs app expects `'high'|'medium'|'low'`
- `requests.details` not reported live; app writes `details`
- `request_messages` live uses `author_id` + `body` vs app expects `sender_id` + `message`
- `members.status` live excludes `pending`
- `attachments` RLS disabled

Recommend reconciling app and DB schema (migration or code adjustments) before production.


