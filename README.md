# Helo One Member App

A premium concierge services platform with dedicated member and operator experiences powered by Next.js, Supabase, and shadcn/ui.

## Feature Highlights
- **Dual Portals**: Tailored dashboards for members and operators with luxury-focused UI components and quick access to critical flows.
- **Concierge Operations**: Request intake, flight briefings, bookings ledger, and commission tracking to keep high-touch service workstreams organized.
- **Member 360 Intelligence**: Supabase views power a consolidated relationship profile with request history, membership status, and key preferences.
- **Brand Enablement Toolkit**: Curated brand assets, shareable media, and communication templates live inside the admin console for fast go-to-market execution.
- **Collaborative Messaging**: Threaded conversations with internal notes ensure teams coordinate discreetly while keeping members informed.
- **Secure Data Layer**: Row Level Security policies guard members, requests, messages, and bookings across member/admin roles.

### Member Experience
- Refreshed member dashboard with KPI stat cards, recent activity timeline, and quick actions (flight concierge, concierge services, bookings).
- Bookings workspace with sortable tables and concierge-specific status pills for itineraries, hotels, and lifestyle reservations.
- Self-service profile area covering membership details, travel preferences, and contact information.

### Operator Console
- Bento-style admin home with live metrics, booking velocity insights, concierge schedules, and revenue snapshots.
- Request pipeline table backed by Supabase data, plus detailed request view with flight-specific enrichment and private notes.
- Member management table with create/edit dialogs, inline actions, and deep links into the Member 360 view.
- Dedicated sections for bookings, payments, brand assets, shareable assets, and templates/forms to centralize operations and marketing collateral.

### Collaboration & Messaging
- Rich request thread component with avatars, timestamps, toast feedback, and the ability to mark updates as member-facing or internal-only.
- API endpoints for creating requests and posting messages keep the UI reactive while preserving Supabase-authenticated access control.

### Data Platform
- Database migration adds `members`, `requests`, `request_messages`, `flight_requests`, and `bookings` tables with automatic `updated_at` triggers.
- Supabase views `member_list` and `member_360` aggregate relationship intelligence for the admin experience.
- Comprehensive RLS policies differentiate member self-service access from operator-level permissions.

## Tech Stack
- **Frontend**: Next.js 15 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Radix UI primitives, Framer Motion.
- **Forms & Validation**: React Hook Form with Zod resolvers.
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security, server-side helpers).
- **UI Enhancements**: Lucide icons, custom glassmorphism components, Sonner for notifications.
- **Formatting & Tooling**: ESLint 9, Prettier 3, Tailwind Merge.

## Getting Started

### Prerequisites
- Node.js 20.18.0+ (see `.nvmrc`)
- A Supabase project with access to the SQL editor

### 1. Clone and Install
```bash
git clone https://github.com/valoremone/helo-one-member-app.git
cd helo-one-member-app
npm install
```

### 2. Apply the Database Schema
1. In the Supabase dashboard, open **SQL Editor**.
2. Copy the contents of `supabase/migrations/20250205_member_management.sql` and run the script.
   - This migration enables `pgcrypto`, creates core tables (members, requests, request messages, flight requests, bookings), and sets up RLS policies and helper views (`member_list`, `member_360`).

### 3. Configure Environment Variables
Create a `.env.local` file in the project root and add your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Create an Initial Admin User
1. Sign up through the app using the email you want to promote.
2. In Supabase SQL Editor, promote the profile and create a member record:
```sql
-- Replace with your email and desired member details
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

INSERT INTO public.members (user_id, email, first_name, last_name, status, tier)
SELECT id, email, split_part(full_name, ' ', 1), split_part(full_name || ' ', ' ', 2), 'active', 'Platinum'
FROM public.profiles
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO NOTHING;
```

### 5. Run the Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to explore the member and admin portals.

## Project Structure
```text
app/
├── admin/
│   ├── bookings/
│   ├── brand-assets/
│   ├── members/
│   ├── payments/
│   ├── profile/
│   ├── requests/
│   ├── shareable-assets/
│   └── templates-and-forms/
├── api/
│   ├── admin/
│   ├── member360/
│   ├── profile/
│   └── requests/
├── auth/
├── login/
├── member/
│   ├── bookings/
│   ├── profile/
│   └── requests/
└── unauthorized/

components/
├── app/
│   ├── member-management/
│   ├── tables/
│   └── *.tsx
├── RequestThread.tsx
└── ui/

supabase/
└── migrations/20250205_member_management.sql
```

## Supabase Data Model
- `members`: Concierge contact record with tier, status, preferred airport, and timestamps.
- `requests`: Member service requests with type, status, priority, and optional flight details.
- `request_messages`: Threaded updates supporting internal-only notes.
- `flight_requests`: Flight-specific enrichment tied 1:1 to a request.
- `bookings`: Confirmed itineraries with commission tracking and currency handling.
- `member_list` view: Aggregates request and booking counts for the admin table.
- `member_360` view: Provides the data used by the Member 360 page and API endpoint.

## API Routes
- `POST /api/requests` – Member-facing endpoint for concierge or flight requests.
- `GET /api/requests` – Retrieves the authenticated member’s request history.
- `POST /api/admin/members` – Admin-only member creation with validation.
- `GET /api/member360/[memberId]` – Admin-only access to the Member 360 view.
- `PATCH /api/profile` – Updates operator profile information and metadata.

## Available Scripts
- `npm run dev` – Start the development server (Turbopack).
- `npm run build` – Build for production.
- `npm run start` – Run the production build.
- `npm run lint` – Run ESLint.
- `npm run typecheck` – Run TypeScript type checking.

## Deployment
1. Push your code to GitHub.
2. Connect the repository to Vercel (or your preferred Next.js host).
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy. The included `vercel.json` contains recommended optimizations.

## Contributing
1. Fork the repository.
2. Create a feature branch.
3. Make your changes and add tests where applicable.
4. Open a pull request.

## License
This project is licensed under the MIT License.
