import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import { Category } from '@/types';
import { Upload, Link, X } from 'lucide-react';

const PostAd = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [checkingApproval, setCheckingApproval] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    location: '',
    contact_phone: '',
    contact_email: '',
    image_urls: [''],
    uploaded_images: []
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (user) {
      checkUserApproval();
    }
  }, [user]);

  const checkUserApproval = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_approved, is_verified, can_post_directly')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error checking user approval:', error);
    } finally {
      setCheckingApproval(false);
    }
  };

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
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!user) return;
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('ads')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('ads')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        uploaded_images: [...prev.uploaded_images, ...uploadedUrls]
      }));

      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`,
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const addImageUrlField = () => {
    setFormData(prev => ({
      ...prev,
      image_urls: [...prev.image_urls, '']
    }));
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const removeUploadedImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploaded_images: prev.uploaded_images.filter((_, i) => i !== index)
    }));
  };

  const updateImageUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.map((url, i) => i === index ? value : url)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      // Combine uploaded images and URL images
      const allImages = [
        ...formData.uploaded_images,
        ...formData.image_urls.filter(url => url.trim() !== '')
      ];

      const { error } = await supabase
        .from('ads')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          price: formData.price ? parseFloat(formData.price) : null,
          location: formData.location,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email || user.email,
          image_urls: allImages.length > 0 ? allImages : null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your ad has been submitted for approval.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error posting ad:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checkingApproval) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  // Check if user is approved to post ads
  if (userProfile && !userProfile.is_approved) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-warning">Account Approval Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your account is currently pending approval from our administrators. 
                You'll be able to post ads once your account has been approved.
              </p>
              <p className="text-sm text-muted-foreground">
                This process typically takes 24-48 hours. Thank you for your patience!
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Post Your Ad</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData(prev => ({...prev, category_id: value}))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (Optional)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({...prev, contact_phone: e.target.value}))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({...prev, contact_email: e.target.value}))}
                    placeholder={user?.email}
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label>Images (Optional)</Label>
                
                {/* File Upload */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Upload images from your device</p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      disabled={uploadingImages}
                      className="max-w-xs mx-auto"
                    />
                    {uploadingImages && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                  </div>
                </div>

                {/* Uploaded Images Preview */}
                {formData.uploaded_images.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Uploaded Images:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.uploaded_images.map((url, index) => (
                        <div key={index} className="relative">
                          <img src={url} alt={`Upload ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeUploadedImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* URL Input */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <Label className="text-sm font-medium">Or add image URLs:</Label>
                  </div>
                  {formData.image_urls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Enter image URL"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImageUrl(index)}
                        disabled={formData.image_urls.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageUrlField}
                  >
                    + Add Another URL
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                variant="gradient"
                disabled={submitting || uploadingImages}
              >
                {submitting ? 'Posting...' : 'Post Ad'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostAd;