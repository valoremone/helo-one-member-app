-- Fix RLS policies to allow proper user creation and authentication
-- Run this in your Supabase SQL Editor

-- First, let's make sure the profiles table allows inserts for new users
DROP POLICY IF EXISTS "Allow profile creation for new users" ON public.profiles;
CREATE POLICY "Allow profile creation for new users" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own profile
DROP POLICY IF EXISTS "read own profile" ON public.profiles;
CREATE POLICY "read own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
CREATE POLICY "update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Allow staff to read all profiles
DROP POLICY IF EXISTS "staff read profiles" ON public.profiles;
CREATE POLICY "staff read profiles" ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles sp 
      WHERE sp.id = auth.uid() 
      AND sp.role IN ('admin', 'ops')
    )
  );

-- Make sure the function has the right permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- Ensure the trigger function can insert into profiles
GRANT INSERT ON public.profiles TO postgres, anon, authenticated, service_role;
