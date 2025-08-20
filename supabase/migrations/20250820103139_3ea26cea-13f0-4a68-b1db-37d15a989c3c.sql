-- Fix RLS policies for admin access to profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create more permissive admin policies for profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.uid() = user_id
);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.uid() = user_id
);

-- Also ensure admins can see pending ads with proper joins
DROP POLICY IF EXISTS "Admins can manage all ads" ON public.ads;

CREATE POLICY "Admins can manage all ads" 
ON public.ads 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));