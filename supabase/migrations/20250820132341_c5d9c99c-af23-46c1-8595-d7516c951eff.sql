-- Add foreign key constraints to fix relation issues

-- Add foreign key from ads to categories
ALTER TABLE public.ads 
ADD CONSTRAINT fk_ads_category_id 
FOREIGN KEY (category_id) REFERENCES public.categories(id) 
ON DELETE SET NULL;

-- Add foreign key from ads to profiles (user relationship)
ALTER TABLE public.ads 
ADD CONSTRAINT fk_ads_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;