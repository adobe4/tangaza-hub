import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

export const CategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    'Vifaa vya Umeme': '⚡',
    'Magari na Pikipiki': '🚗',
    'Mali Isiyohamishika': '🏠',
    'Ajira na Kazi': '💼',
    'Huduma mbalimbali': '🛠️',
    'Mavazi na Ubunifu': '👕',
    'Vyakula na Vinywaji': '🍕',
    'Afya na Dawa': '💊',
    'Elimu na Mafunzo': '📚',
    'Simu na Computer': '📱',
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="gradient-card hover-scale transition-spring shadow-card animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3"></div>
                  <div className="h-4 bg-muted rounded mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore thousands of ads across various categories. Find exactly what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/ads?category=${category.id}`}
              className="block"
            >
              <Card className="gradient-card hover-scale transition-spring shadow-card h-full group">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-spring">
                    {categoryIcons[category.name] || '📋'}
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-smooth">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/categories"
            className="story-link text-primary font-semibold hover:text-primary-dark transition-smooth"
          >
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  );
};