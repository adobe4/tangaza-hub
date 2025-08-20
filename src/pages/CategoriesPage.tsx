import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Package, Grid } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/ads?category=${categoryId}`);
  };

  const categoryIcons = {
    'Electronics': Package,
    'Vehicles': Package,
    'Real Estate': Package,
    'Jobs': Package,
    'Services': Package,
    'Fashion': Package,
    'Sports': Package,
    'Books': Package,
    'default': Grid
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">All Categories</h1>
          <p className="text-lg text-muted-foreground">
            Browse ads by category to find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || categoryIcons.default;
            
            return (
              <Card 
                key={category.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardHeader className="text-center">
                  <IconComponent className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {category.description && (
                    <p className="text-muted-foreground text-center">
                      {category.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <Grid className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
            <p className="text-muted-foreground">
              Categories will appear here once they are added by administrators.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;