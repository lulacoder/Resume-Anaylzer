'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { useSession } from '@/lib/hooks/useSession';
import { useNavigation, useTheme } from '@/lib/hooks/useNavigation';
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { FileText, LayoutDashboard, Settings, LogOut, ChevronDown, Menu, X, Sun, Moon, Monitor } from 'lucide-react';

export default function Navbar() {
  const { user, loading, signOut } = useSession();
  const { 
    mobileMenuOpen, 
    userMenuOpen, 
    toggleMobileMenu, 
    toggleUserMenu, 
    closeAllMenus 
  } = useNavigation();
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getUserInitials = (user: User) => {
    const name = user.user_metadata?.full_name || user.user_metadata?.name;
    if (name) {
      return name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const getUserAvatar = (user: User) => {
    return user.user_metadata?.avatar_url || user.user_metadata?.picture;
  };

  const getUserDisplayName = (user: User) => {
    return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  };

  const isGoogleUser = (user: User) => {
    return user.identities?.some(identity => identity.provider === 'google') || false;
  };

  // Logo component
  const Logo = () => (
    <Link 
      href="/" 
      prefetch={true}
      className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity"
    >
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
        <FileText className="h-5 w-5 text-white" />
      </div>
      <span className="text-lg font-display font-bold text-foreground">Resume Analyzer</span>
    </Link>
  );

  // Navigation items for authenticated users
  const AuthenticatedNav = ({ user }: { user: User }) => (
    <>
      <Link 
        href="/dashboard" 
        prefetch={true}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>
      
      <Link 
        href="/analyze" 
        prefetch={true}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Analyze
      </Link>
      
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
        title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
      >
        {getThemeIcon()}
      </Button>

      {/* User Menu */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleUserMenu}
          className="flex items-center gap-2 h-9 px-2"
        >
          {getUserAvatar(user) ? (
            <img
              src={getUserAvatar(user)}
              alt="Profile"
              className="h-7 w-7 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              {getUserInitials(user)}
            </div>
          )}
          <span className="text-sm font-medium hidden lg:block">{getUserDisplayName(user)}</span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", userMenuOpen && "rotate-180")} />
        </Button>

        {/* User Dropdown */}
        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground">{getUserDisplayName(user)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
              {isGoogleUser(user) && (
                <span className="inline-flex items-center mt-2 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google Account
                </span>
              )}
            </div>
            <Link 
              href="/dashboard" 
              prefetch={true}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              onClick={closeAllMenus}
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Dashboard
            </Link>
            <Link 
              href="/profile" 
              prefetch={true}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              onClick={closeAllMenus}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Profile Settings
            </Link>
            <div className="border-t border-border mt-1 pt-1">
              <button 
                onClick={signOut}
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Navigation items for unauthenticated users
  const UnauthenticatedNav = () => (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
        title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
      >
        {getThemeIcon()}
      </Button>
      <Link href="/auth/login" prefetch={true}>
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          Log In
        </Button>
      </Link>
      <Link href="/auth/signup" prefetch={true}>
        <Button>
          Get Started
        </Button>
      </Link>
    </div>
  );

  // Skeleton for loading state
  const UserSkeleton = () => (
    <div className="flex items-center space-x-3">
      <div className="h-9 w-9 bg-muted animate-pulse rounded-lg"></div>
      <div className="h-7 w-7 bg-muted animate-pulse rounded-full"></div>
      <div className="h-4 w-20 bg-muted animate-pulse rounded hidden lg:block"></div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {loading ? (
            <UserSkeleton />
          ) : user ? (
            <AuthenticatedNav user={user} />
          ) : (
            <UnauthenticatedNav />
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground"
          >
            {getThemeIcon()}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="h-9 w-9 text-muted-foreground"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-10 bg-muted animate-pulse rounded-lg"></div>
                <div className="h-10 bg-muted animate-pulse rounded-lg"></div>
              </div>
            ) : user ? (
              <>
                <div className="flex items-center space-x-3 pb-4 border-b border-border">
                  {getUserAvatar(user) ? (
                    <img
                      src={getUserAvatar(user)}
                      alt="Profile"
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {getUserInitials(user)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{getUserDisplayName(user)}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Link 
                  href="/dashboard" 
                  prefetch={true}
                  className="flex items-center gap-2 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={closeAllMenus}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/analyze" 
                  prefetch={true}
                  className="flex items-center gap-2 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={closeAllMenus}
                >
                  <FileText className="h-4 w-4" />
                  Analyze Resume
                </Link>
                <Link 
                  href="/profile" 
                  prefetch={true}
                  className="flex items-center gap-2 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={closeAllMenus}
                >
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </Link>
                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={signOut}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Link href="/auth/login" prefetch={true} onClick={closeAllMenus}>
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup" prefetch={true} onClick={closeAllMenus}>
                  <Button className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(mobileMenuOpen || userMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeAllMenus}
        />
      )}
    </nav>
  );
}
