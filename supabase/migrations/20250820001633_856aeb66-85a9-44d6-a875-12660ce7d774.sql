-- Add verification columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS can_post_directly boolean DEFAULT false;

-- Update ads table to include image fields
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS image_urls text[],
ADD COLUMN IF NOT EXISTS uploaded_images text[];

-- Create a function for verified users to post directly
CREATE OR REPLACE FUNCTION can_user_post_directly(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE((
    SELECT p.can_post_directly 
    FROM public.profiles p 
    WHERE p.user_id = user_uuid
  ), false);
$$;

-- Add trigger to auto-approve ads from verified users
CREATE OR REPLACE FUNCTION auto_approve_verified_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user can post directly
  IF can_user_post_directly(NEW.user_id) THEN
    NEW.status = 'approved';
    NEW.approved_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-approval
DROP TRIGGER IF EXISTS auto_approve_ads_trigger ON public.ads;
CREATE TRIGGER auto_approve_ads_trigger
  BEFORE INSERT ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_verified_users();

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));