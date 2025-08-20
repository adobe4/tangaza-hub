/*
# Fix duplicate foreign key constraints

1. Database Changes
   - Remove duplicate foreign key constraint between ads and categories
   - Keep only one clean foreign key relationship
   - Ensure proper indexing for performance

2. Security
   - Maintain existing RLS policies
   - No changes to user permissions

This migration fixes the "more than one relationship was found" error by cleaning up duplicate foreign key constraints.
*/

-- Drop the duplicate foreign key constraint (keep the newer one)
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_category_id_fkey;

-- Ensure we have the proper foreign key constraint
DO $$
BEGIN
    -- Check if fk_ads_category_id exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_ads_category_id' 
        AND table_name = 'ads'
    ) THEN
        ALTER TABLE public.ads 
        ADD CONSTRAINT fk_ads_category_id 
        FOREIGN KEY (category_id) REFERENCES public.categories(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Ensure proper indexing exists
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON public.ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_status_created ON public.ads(status, created_at DESC);