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
import { CheckCircle, XCircle, Users, FileText, Star, Shield, Trash2, ArrowUp, ArrowDown, Crown } from 'lucide-react';
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
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else if (!loading) {
      // If not admin and auth loading is complete, set loadingData to false
      setLoadingData(false);
    }
  }, [isAdmin, loading]);

  const fetchAdminData = async () => {
    try {
      console.log('Fetching admin data...');
      
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

      if (pendingError) {
        console.error('Error fetching pending ads:', pendingError);
        throw pendingError;
      }
      console.log('Fetched pending ads:', pendingData?.length || 0);
      setPendingAds(pendingData || []);

      // Fetch all users for management
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }
      console.log('Fetched users:', usersData?.length || 0);
      setUsers(usersData || []);

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

      console.log('Admin data fetched successfully');
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data. Please refresh the page.",
        variant: "destructive",
      });
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

  const handleApproveUser = async (userId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_approved: !isApproved
        })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { 
          ...u, 
          is_approved: !isApproved
        } : u
      ));

      toast({
        title: "Success",
        description: `User ${!isApproved ? 'approved' : 'disapproved'} successfully.`,
      });
    } catch (error: any) {
      console.error('Error updating user approval:', error);
      toast({
        title: "Error",
        description: "Failed to update user approval.",
        variant: "destructive",
      });
    }
  };

  const handleMakePremium = async (userId: string, isPremium: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: !isPremium,
          can_post_directly: !isPremium,
          verified_at: !isPremium ? new Date().toISOString() : null,
          verified_by: !isPremium ? user?.id : null
        })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { 
          ...u, 
          is_verified: !isPremium,
          can_post_directly: !isPremium,
          verified_at: !isPremium ? new Date().toISOString() : null 
        } : u
      ));

      toast({
        title: "Success",
        description: `User ${!isPremium ? 'upgraded to premium' : 'removed from premium'} successfully.`,
      });
    } catch (error: any) {
      console.error('Error updating user premium status:', error);
      toast({
        title: "Error",
        description: "Failed to update user premium status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1
      }));

      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleReorderAd = async (adId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ display_order: newOrder })
        .eq('id', adId);

      if (error) throw error;

      setPendingAds(prev => prev.map(ad => 
        ad.id === adId ? { ...ad, display_order: newOrder } : ad
      ));

      toast({
        title: "Success",
        description: "Ad order updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating ad order:', error);
      toast({
        title: "Error",
        description: "Failed to update ad order.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      setStats(prev => ({
        ...prev,
        pendingAds: prev.pendingAds - 1,
        totalAds: prev.totalAds - 1
      }));

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
            <TabsTrigger value="users">Users ({stats.totalUsers})</TabsTrigger>
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

                         <div className="flex gap-2 flex-wrap">
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
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => handleReorderAd(ad.id, (ad.display_order || 0) + 1)}
                           >
                             <ArrowUp className="h-4 w-4 mr-2" />
                             Move Up
                           </Button>
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => handleReorderAd(ad.id, Math.max(0, (ad.display_order || 0) - 1))}
                           >
                             <ArrowDown className="h-4 w-4 mr-2" />
                             Move Down
                           </Button>
                           <Button 
                             variant="destructive" 
                             size="sm"
                             onClick={() => handleDeleteAd(ad.id)}
                           >
                             <Trash2 className="h-4 w-4 mr-2" />
                             Delete
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
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((profile) => (
                      <div key={profile.id} className="border rounded-lg p-4">
                         <div className="flex justify-between items-start mb-2">
                           <div>
                             <h3 className="font-semibold text-lg">{profile.full_name || 'Anonymous User'}</h3>
                             <p className="text-muted-foreground">{profile.email}</p>
                           </div>
                           <div className="flex gap-2">
                             {profile.is_approved && (
                               <Badge variant="default">
                                 <CheckCircle className="h-3 w-3 mr-1" />
                                 Approved
                               </Badge>
                             )}
                             {profile.is_verified && (
                               <Badge variant="secondary">
                                 <Crown className="h-3 w-3 mr-1" />
                                 Premium
                               </Badge>
                             )}
                             {profile.can_post_directly && (
                               <Badge variant="outline">
                                 Auto-Approve
                               </Badge>
                             )}
                           </div>
                         </div>
                         
                         <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                           <span>Status: {profile.is_approved ? 'Approved' : 'Pending Approval'}</span>
                           <span>Location: {profile.location || 'Not specified'}</span>
                           <span>Phone: {profile.phone || 'Not provided'}</span>
                           <span>Joined: {new Date(profile.created_at).toLocaleDateString()}</span>
                         </div>

                         <div className="flex gap-2 flex-wrap">
                           <Button 
                             variant={profile.is_approved ? "outline" : "default"}
                             size="sm"
                             onClick={() => handleApproveUser(profile.user_id, profile.is_approved)}
                           >
                             <CheckCircle className="h-4 w-4 mr-2" />
                             {profile.is_approved ? 'Disapprove' : 'Approve'} User
                           </Button>
                           <Button 
                             variant={profile.is_verified ? "outline" : "secondary"}
                             size="sm"
                             onClick={() => handleMakePremium(profile.user_id, profile.is_verified)}
                           >
                             <Crown className="h-4 w-4 mr-2" />
                             {profile.is_verified ? 'Remove Premium' : 'Make Premium'}
                           </Button>
                           <Button 
                             variant="destructive" 
                             size="sm"
                             onClick={() => handleDeleteUser(profile.user_id)}
                           >
                             <Trash2 className="h-4 w-4 mr-2" />
                             Delete User
                           </Button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
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