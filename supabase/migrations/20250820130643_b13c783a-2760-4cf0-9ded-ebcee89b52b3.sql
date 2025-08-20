-- Fix RLS policies to ensure admin can see all users and data

-- Drop existing problematic policies on profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles visibility" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;

-- Create simple, working admin policies
CREATE POLICY "Admins can do everything on profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage their own profile"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Fix ads policies too
DROP POLICY IF EXISTS "Admins can manage all ads" ON public.ads;

CREATE POLICY "Admins can do everything on ads"
ON public.ads
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure admin can see user roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can do everything on user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));