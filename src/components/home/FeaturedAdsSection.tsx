import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ad } from '@/types';
import { AdCard } from '@/components/ads/AdCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturedAdsSection = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchFeaturedAds();
  }, []);

  const fetchFeaturedAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          category:categories(*),
          profiles(*)
        `)
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching featured ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, ads.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, ads.length - 3)) % Math.max(1, ads.length - 3));
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Ads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded mb-2 w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (ads.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Featured Ads</h2>
            <p className="text-muted-foreground mb-8">
              No featured ads available at the moment. Check back soon!
            </p>
            <Button asChild variant="gradient">
              <Link to="/ads">Browse All Ads</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Ads</h2>
            <p className="text-muted-foreground">
              Premium listings and top-rated products
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {ads.length > 4 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={prevSlide}
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={nextSlide}
                  className="h-10 w-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            <Button asChild variant="gradient">
              <Link to="/ads">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out gap-6"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / Math.min(4, ads.length))}%)`,
            }}
          >
            {ads.map((ad) => (
              <div 
                key={ad.id} 
                className="flex-none w-full md:w-1/2 lg:w-1/4"
              >
                <AdCard ad={ad} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator for mobile */}
        {ads.length > 1 && (
          <div className="flex justify-center mt-8 gap-2 md:hidden">
            {Array.from({ length: Math.ceil(ads.length / 1) }).map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};