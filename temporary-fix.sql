-- TEMPORARY FIX: Disable RLS on profiles table for testing
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- This will allow the authentication to work while we debug
-- Remember to re-enable RLS later with proper policies
