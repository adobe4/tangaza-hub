export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  location?: string;
  is_trusted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Ad {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  price?: number;
  location?: string;
  contact_phone?: string;
  contact_email?: string;
  image_url?: string;
  images?: string[];
  status: string;
  is_premium?: boolean;
  is_featured?: boolean;
  display_order?: number;
  views_count?: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  expires_at?: string;
  // Relations
  category?: Category;
  profiles?: any;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

export interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

export interface AdFilters {
  search?: string;
  category?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high';
}