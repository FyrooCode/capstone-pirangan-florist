-- Update the profiles table without dropping it if it exists

-- Check if the profiles table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE 'The profiles table exists, updating permissions...';
    ELSE
        -- Create profiles table with proper structure
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
            first_name TEXT,
            last_name TEXT,
            role TEXT NOT NULL DEFAULT 'customer',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Created new profiles table';
    END IF;
END $$;

-- Grant appropriate permissions
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clear any existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;
DROP POLICY IF EXISTS "Allow logged in users to insert their profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow logged in users to update their profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow logged in users to view their profile" ON public.profiles;
DROP POLICY IF EXISTS "New users can create their profile" ON public.profiles;

-- Create simple policies that should work properly
-- Allow users to see their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to create their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow service_role to do everything
CREATE POLICY "Service role has full access" 
ON public.profiles 
USING (auth.role() = 'service_role');

-- Debugging function to help diagnose issues
CREATE OR REPLACE FUNCTION debug_auth() 
RETURNS TABLE (
    role text,
    uid uuid,
    email text
) 
LANGUAGE SQL SECURITY DEFINER 
AS $$
  SELECT
    current_setting('role', true),
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid())
$$;
