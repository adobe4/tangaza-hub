import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigate, Link } from 'react-router-dom';
import { Ad } from '@/types';
import { PlusCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserAds();
    }
  }, [user]);

  const fetchUserAds = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          categories!category_id(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserAds(data || []);
    } catch (error) {
      console.error('Error fetching user ads:', error);
    } finally {
      setAdsLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      setUserAds(prev => prev.filter(ad => ad.id !== adId));
      toast({
        title: "Success",
        description: "Ad deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting ad:', error);
      toast({
        title: "Error",
        description: "Failed to delete ad.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-success">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <Button asChild variant="gradient">
            <Link to="/post-ad">
              <PlusCircle className="h-4 w-4 mr-2" />
              Post New Ad
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{userAds.length}</div>
              <p className="text-muted-foreground">Total Ads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {userAds.filter(ad => ad.status === 'approved').length}
              </div>
              <p className="text-muted-foreground">Active Ads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {userAds.filter(ad => ad.status === 'pending').length}
              </div>
              <p className="text-muted-foreground">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {userAds.reduce((sum, ad) => sum + (ad.views_count || 0), 0)}
              </div>
              <p className="text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>
        </div>

        {/* My Ads */}
        <Card>
          <CardHeader>
            <CardTitle>My Ads</CardTitle>
          </CardHeader>
          <CardContent>
            {adsLoading ? (
              <div className="text-center py-8">Loading your ads...</div>
            ) : userAds.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't posted any ads yet.</p>
                <Button asChild variant="gradient">
                  <Link to="/post-ad">Post Your First Ad</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userAds.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ad.category?.name} • {ad.location} • 
                        Created: {new Date(ad.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(ad.status)}
                        {ad.price && (
                          <span className="font-semibold">TSh {ad.price.toLocaleString()}</span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          <Eye className="h-3 w-3 inline mr-1" />
                          {ad.views_count || 0} views
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAd(ad.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;