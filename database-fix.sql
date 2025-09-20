-- Complete Database Fix for "Database error granting user"
-- Run this in your Supabase SQL Editor to fix authentication issues

-- 1. First, let's ensure the profiles table exists and has the right structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'ops')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow profile creation for new users" ON public.profiles;
DROP POLICY IF EXISTS "read own profile" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
DROP POLICY IF EXISTS "staff read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

-- 4. Create the function to handle new user signup (SECURITY DEFINER is crucial)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- 6. Create the trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create RLS policies that allow the trigger to work
-- This policy allows the trigger function to insert profiles (SECURITY DEFINER bypasses RLS)
CREATE POLICY "Allow profile creation via trigger" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Allow staff to read all profiles
CREATE POLICY "Staff can read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles sp 
      WHERE sp.id = auth.uid() 
      AND sp.role IN ('admin', 'ops')
    )
  );

-- 8. Create members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Enable RLS on members table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 10. Create policies for members table
DROP POLICY IF EXISTS "Users can read own member record" ON public.members;
DROP POLICY IF EXISTS "Users can insert own member record" ON public.members;
DROP POLICY IF EXISTS "Staff can read all members" ON public.members;

CREATE POLICY "Users can read own member record" ON public.members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own member record" ON public.members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can read all members" ON public.members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles sp 
      WHERE sp.id = auth.uid() 
      AND sp.role IN ('admin', 'ops')
    )
  );

-- 11. Create a function to automatically create member record when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.members (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.full_name, ' ', 1),
    SPLIT_PART(NEW.full_name, ' ', 2)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create trigger to create member record when profile is created
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- 13. Grant permissions for member creation
GRANT ALL ON public.members TO postgres, anon, authenticated, service_role;

-- 14. Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 16. Create policy for organizations (staff can read all)
CREATE POLICY "Staff can read all organizations" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles sp 
      WHERE sp.id = auth.uid() 
      AND sp.role IN ('admin', 'ops')
    )
  );

GRANT ALL ON public.organizations TO postgres, anon, authenticated, service_role;

-- 17. Insert a default organization if none exists
INSERT INTO public.organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Helo One')
ON CONFLICT (id) DO NOTHING;

-- 18. Create memberships table
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, organization_id)
);

-- 19. Enable RLS on memberships
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- 20. Create policies for memberships
CREATE POLICY "Users can read own memberships" ON public.memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.members m 
      WHERE m.id = member_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can read all memberships" ON public.memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles sp 
      WHERE sp.id = auth.uid() 
      AND sp.role IN ('admin', 'ops')
    )
  );

GRANT ALL ON public.memberships TO postgres, anon, authenticated, service_role;

-- 21. Create a function to automatically create membership when member is created
CREATE OR REPLACE FUNCTION public.handle_new_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.memberships (member_id, organization_id)
  VALUES (NEW.id, '00000000-0000-0000-0000-000000000000');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 22. Create trigger to create membership when member is created
DROP TRIGGER IF EXISTS on_member_created ON public.members;
CREATE TRIGGER on_member_created
  AFTER INSERT ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_member();

-- 23. Final permissions check
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
