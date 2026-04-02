'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Mail, Bell, Shield, Moon, Sun, Monitor, Link2, Trash2, Check, AlertCircle } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  createdAt: string;
  lastSignIn?: string;
  googleData?: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

interface ProfileFormProps {
  user: UserData;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(user.name || '');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [notifications, setNotifications] = useState(true);
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'private'>('private');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
      const savedNotifications = localStorage.getItem('notifications') !== 'false';
      const savedPrivacy = localStorage.getItem('privacyLevel') as 'public' | 'private' || 'private';
      
      setTheme(savedTheme);
      setNotifications(savedNotifications);
      setPrivacyLevel(savedPrivacy);
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: displayName,
          display_name: displayName,
        }
      });

      if (error) {
        throw error;
      }

      localStorage.setItem('theme', theme);
      localStorage.setItem('notifications', notifications.toString());
      localStorage.setItem('privacyLevel', privacyLevel);

      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => {
        router.refresh();
      }, 1000);

    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!confirm('Are you sure you want to unlink your Google account? You will need to set a password to continue using email authentication.')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      setMessage({ 
        type: 'error', 
        text: 'Account unlinking is not yet implemented. Please contact support.' 
      });
    } catch {
      setMessage({ 
        type: 'error', 
        text: 'Failed to unlink Google account' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      setMessage({ 
        type: 'error', 
        text: 'Account deletion is not yet implemented. Please contact support.' 
      });
    } catch {
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete account' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun, description: 'Always use light theme' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, description: 'Always use dark theme' },
    { value: 'system' as const, label: 'System', icon: Monitor, description: 'Follow system preference' },
  ];

  const privacyOptions = [
    { value: 'private' as const, label: 'Private', description: 'Your data is private and not shared' },
    { value: 'public' as const, label: 'Public', description: 'Allow anonymous usage analytics' },
  ];

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          {message.type === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <Label htmlFor="displayName" className="mb-2">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                This name will be displayed throughout the application.
              </p>
            </div>

            <div>
              <Label htmlFor="email" className="mb-2">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="pl-10 bg-muted cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Contact support if you need to update your email address.
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isLoading} loading={isLoading} loadingText="Saving...">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div>
            <Label className="mb-3 block">Theme</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${
                        isSelected ? 'text-foreground' : 'text-foreground'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Email Notifications</div>
                <div className="text-xs text-muted-foreground">Receive updates about your analyses</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                notifications ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Privacy Level */}
          <div>
            <Label className="mb-3 block">Privacy Level</Label>
            <div className="space-y-3">
              {privacyOptions.map((option) => {
                const isSelected = privacyLevel === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrivacyLevel(option.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div>
                        <div className={`text-sm font-medium text-foreground`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Google Account Linking */}
          {user.provider === 'google' && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-card rounded-lg shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Google Account Connected</div>
                  <div className="text-xs text-muted-foreground">You sign in with Google</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlinkGoogle}
                disabled={isLoading}
              >
                <Link2 className="w-4 h-4 mr-1.5" />
                Unlink
              </Button>
            </div>
          )}

          {/* Danger Zone */}
          <div className="pt-4">
            <Separator className="mb-4" />
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-destructive uppercase tracking-wide">Danger Zone</h3>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div>
                <div className="text-sm font-medium text-foreground">Delete Account</div>
                <div className="text-xs text-muted-foreground">
                  Permanently delete your account and all data. This cannot be undone.
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
