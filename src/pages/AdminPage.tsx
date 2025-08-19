import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';
import { Ad } from '@/types';
import { CheckCircle, XCircle, Users, FileText, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminPage = () => {
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAds: 0,
    pendingAds: 0,
    approvedAds: 0
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      // Fetch pending ads
      const { data: pendingData, error: pendingError } = await supabase
        .from('ads')
        .select(`
          *,
          category:categories(*),
          profile:profiles(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;
      setPendingAds(pendingData || []);

      // Fetch stats
      const [usersCount, adsCount, pendingCount, approvedCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('ads').select('*', { count: 'exact', head: true }),
        supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'approved')
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalAds: adsCount.count || 0,
        pendingAds: pendingCount.count || 0,
        approvedAds: approvedCount.count || 0
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleApproveAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', adId);

      if (error) throw error;

      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      setStats(prev => ({
        ...prev,
        pendingAds: prev.pendingAds - 1,
        approvedAds: prev.approvedAds + 1
      }));

      toast({
        title: "Success",
        description: "Ad approved successfully.",
      });
    } catch (error: any) {
      console.error('Error approving ad:', error);
      toast({
        title: "Error",
        description: "Failed to approve ad.",
        variant: "destructive",
      });
    }
  };

  const handleRejectAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: 'rejected' })
        .eq('id', adId);

      if (error) throw error;

      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      setStats(prev => ({
        ...prev,
        pendingAds: prev.pendingAds - 1
      }));

      toast({
        title: "Success",
        description: "Ad rejected.",
      });
    } catch (error: any) {
      console.error('Error rejecting ad:', error);
      toast({
        title: "Error",
        description: "Failed to reject ad.",
        variant: "destructive",
      });
    }
  };

  const handleFeatureAd = async (adId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_featured: !isFeatured })
        .eq('id', adId);

      if (error) throw error;

      setPendingAds(prev => prev.map(ad => 
        ad.id === adId ? { ...ad, is_featured: !isFeatured } : ad
      ));

      toast({
        title: "Success",
        description: `Ad ${!isFeatured ? 'featured' : 'unfeatured'} successfully.`,
      });
    } catch (error: any) {
      console.error('Error updating ad:', error);
      toast({
        title: "Error",
        description: "Failed to update ad.",
        variant: "destructive",
      });
    }
  };

  if (loading || loadingData) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalAds}</div>
                  <p className="text-muted-foreground">Total Ads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-success mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.approvedAds}</div>
                  <p className="text-muted-foreground">Approved Ads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-warning mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.pendingAds}</div>
                  <p className="text-muted-foreground">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Ads ({stats.pendingAds})</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ads Awaiting Approval</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingAds.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending ads to review.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAds.map((ad) => (
                      <div key={ad.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{ad.title}</h3>
                          <div className="flex gap-2">
                            {ad.is_featured && (
                              <Badge variant="secondary">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {ad.category?.name}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {ad.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span>Location: {ad.location}</span>
                          {ad.price && <span>Price: TSh {ad.price.toLocaleString()}</span>}
                          <span>Posted: {new Date(ad.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleApproveAd(ad.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRejectAd(ad.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleFeatureAd(ad.id, ad.is_featured)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            {ad.is_featured ? 'Unfeature' : 'Feature'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Reports and analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;