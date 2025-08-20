-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION can_user_post_directly(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT p.can_post_directly 
    FROM public.profiles p 
    WHERE p.user_id = user_uuid
  ), false);
$$;

CREATE OR REPLACE FUNCTION auto_approve_verified_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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