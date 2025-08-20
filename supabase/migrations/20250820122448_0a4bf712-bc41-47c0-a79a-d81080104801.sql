-- Fix admin RLS policies and user management system

-- Clean up duplicate user roles first
DELETE FROM user_roles 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, role ORDER BY id) as rn 
    FROM user_roles
  ) t 
  WHERE rn > 1
);

-- Drop all existing RLS policies to start fresh
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Admins can manage all ads" ON public.ads;
DROP POLICY IF EXISTS "Everyone can view approved ads" ON public.ads;
DROP POLICY IF EXISTS "Users can view their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can create ads" ON public.ads;
DROP POLICY IF EXISTS "Users can update their own ads" ON public.ads;

-- Add user approval system - new column to track if user is approved to post
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Public profiles visibility" 
ON public.profiles 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own profile" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for ads
CREATE POLICY "Public can view approved ads" 
ON public.ads 
FOR SELECT 
TO public
USING (status = 'approved');

CREATE POLICY "Admins can manage all ads" 
ON public.ads 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own ads" 
ON public.ads 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Approved users can create ads" 
ON public.ads 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_approved = true
  )
);

CREATE POLICY "Users can update their own ads" 
ON public.ads 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Update the auto-approval trigger for premium users
DROP TRIGGER IF EXISTS auto_approve_verified_users ON public.ads;

CREATE OR REPLACE FUNCTION public.auto_approve_premium_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is verified and can post directly (premium)
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = NEW.user_id 
    AND is_verified = true 
    AND can_post_directly = true
  ) THEN
    NEW.status = 'approved';
    NEW.approved_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_approve_premium_users
  BEFORE INSERT ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_premium_users();

-- Approve the admin user by default
UPDATE public.profiles 
SET is_approved = true 
WHERE user_id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);