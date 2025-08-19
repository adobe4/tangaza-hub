-- Ensure all required columns exist in the ads table
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'expires_at') THEN
        ALTER TABLE public.ads ADD COLUMN expires_at timestamp with time zone;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'images') THEN
        ALTER TABLE public.ads ADD COLUMN images text[];
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'is_featured') THEN
        ALTER TABLE public.ads ADD COLUMN is_featured boolean DEFAULT false;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'views_count') THEN
        ALTER TABLE public.ads ADD COLUMN views_count integer DEFAULT 0;
    END IF;
END $$;

-- Ensure all required columns exist in the profiles table
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location text;
    END IF;
END $$;

-- Add some default categories if they don't exist
INSERT INTO public.categories (name, description) VALUES
('Vifaa vya Umeme', 'Elektroniki, vifaa vya umeme na teknolojia'),
('Magari na Pikipiki', 'Magari, pikipiki na vyombo vingine'),
('Mali Isiyohamishika', 'Nyumba, ardhi na mali isiyohamishika'),
('Ajira na Kazi', 'Nafasi za kazi na fursa za ajira'),
('Huduma mbalimbali', 'Huduma za kila aina'),
('Mavazi na Ubunifu', 'Nguo, viatu na vitu vya ubunifu'),
('Vyakula na Vinywaji', 'Chakula, vinywaji na vitu vya okoloni'),
('Afya na Dawa', 'Huduma za afya na dawa'),
('Elimu na Mafunzo', 'Elimu, vitabu na mafunzo'),
('Simu na Computer', 'Simu, kompyuta na vifaa vya teknolojia')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON public.ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON public.ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_title_search ON public.ads USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_ads_location ON public.ads(location);

-- Update the updated_at trigger for ads table
DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
CREATE TRIGGER update_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Update the updated_at trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();