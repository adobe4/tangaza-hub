import React from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FeaturedAdsSection } from '@/components/home/FeaturedAdsSection';
import { RecentAdsSection } from '@/components/home/RecentAdsSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <FeaturedAdsSection />
      <RecentAdsSection />
    </div>
  );
};

export default Index;
