import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  User, 
  Plus, 
  LogOut, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="gradient-primary rounded-lg p-2">
            <span className="text-lg font-bold text-white">TSS</span>
          </div>
          <span className="text-xl font-bold text-primary">TANGAZASASA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/ads" className="text-foreground hover:text-primary transition-smooth">
            Browse Ads
          </Link>
          <Link to="/categories" className="text-foreground hover:text-primary transition-smooth">
            Categories
          </Link>
          {user && (
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-smooth">
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-foreground hover:text-primary transition-smooth">
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Button asChild variant="gradient" size="sm">
                <Link to="/post-ad">
                  <Plus className="w-4 h-4 mr-1" />
                  Post Ad
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <User className="w-4 h-4 mr-1" />
                    Profile
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="space-y-3">
              <Link 
                to="/ads" 
                className="block text-foreground hover:text-primary transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Ads
              </Link>
              <Link 
                to="/categories" 
                className="block text-foreground hover:text-primary transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              {user && (
                <Link 
                  to="/dashboard" 
                  className="block text-foreground hover:text-primary transition-smooth"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="block text-foreground hover:text-primary transition-smooth"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </nav>

            <div className="space-y-3 pt-4 border-t">
              {user ? (
                <>
                  <Button asChild variant="gradient" className="w-full" size="sm">
                    <Link to="/post-ad" onClick={() => setIsMobileMenuOpen(false)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Post Ad
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="hero" className="w-full">
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};