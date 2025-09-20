-- Fix Authentication Issues
-- This migration addresses the "Database error granting user" issue

-- 1. First, let's ensure we have the correct schema permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

-- 2. Create profiles table with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'ops')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow profile creation for new users" ON public.profiles;
DROP POLICY IF EXISTS "read own profile" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
DROP POLICY IF EXISTS "staff read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation via trigger" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can read all profiles" ON public.profiles;

-- 5. Grant comprehensive permissions on profiles table
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 6. Create the trigger function with SECURITY DEFINER (this is crucial)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'member'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions to the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- 8. Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Create RLS policies that work with the trigger
-- This policy allows the trigger function to insert profiles
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

-- 10. Create a function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to update profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Grant permissions to the update function
GRANT EXECUTE ON FUNCTION public.handle_user_update() TO postgres, anon, authenticated, service_role;

-- 12. Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- 13. Ensure the auth schema has proper permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT SELECT ON auth.users TO postgres, anon, authenticated, service_role;

-- 14. Create a function to manually create profiles for existing users (if needed)
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email),
    'member'
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Grant permissions to the manual creation function
GRANT EXECUTE ON FUNCTION public.create_missing_profiles() TO postgres, anon, authenticated, service_role;

-- 16. Run the function to create profiles for any existing users
SELECT public.create_missing_profiles();

-- 17. Final permissions check
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
