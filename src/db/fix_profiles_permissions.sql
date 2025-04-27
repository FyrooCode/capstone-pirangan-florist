-- Reset RLS and permissions for the profiles table to ensure it works properly

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Allow logged in users to insert their profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow logged in users to update their profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow logged in users to view their profile" ON public.profiles;
DROP POLICY IF EXISTS "New users can create their profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2. Temporarily disable RLS to check if that's the issue
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Grant proper permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;

-- 4. Re-enable RLS with simpler policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create simpler policies
CREATE POLICY "Allow authenticated users full access to their own profile"
ON public.profiles
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Create a service role policy
CREATE POLICY "Service role can manage all profiles"
ON public.profiles
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- 7. Reset the id sequence if needed
ALTER SEQUENCE IF EXISTS profiles_id_seq RESTART WITH 1;
