import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBanner from '@/assets/hero-banner.jpg';

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/ads?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 gradient-hero opacity-90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover Amazing
            <span className="block gradient-primary bg-clip-text text-transparent">
              Deals & Opportunities
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Tanzania's premier classified ads platform. Buy, sell, and discover everything 
            you need in your community. From electronics to real estate, find it all on TANGAZASASA.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
              <Input
                type="text"
                placeholder="Search for products, services, jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-white/20 text-white placeholder:text-white/70 focus:bg-white/30 transition-smooth"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                variant="secondary"
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="xl" variant="secondary" className="bg-white text-primary hover:bg-white/90 shadow-lg min-w-[200px]">
              <Link to="/ads">
                Browse All Ads
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white text-white hover:bg-white/10 min-w-[200px]">
              <Link to="/post-ad">
                Post Your Ad
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">10K+</div>
              <div className="text-white/80 text-sm">Active Ads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">5K+</div>
              <div className="text-white/80 text-sm">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">20+</div>
              <div className="text-white/80 text-sm">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">24/7</div>
              <div className="text-white/80 text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};