-- Fix foreign key relationship between ads and profiles
ALTER TABLE public.ads 
ADD CONSTRAINT ads_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Create admin user role if it doesn't exist
INSERT INTO public.user_roles (user_id, role)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'Kasanga@admin.in' LIMIT 1),
  'admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'Kasanga@admin.in' LIMIT 1)
  AND role = 'admin'
);