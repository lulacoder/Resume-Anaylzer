'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
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

  // Load preferences from localStorage on component mount
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
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: displayName,
          display_name: displayName,
        }
      });

      if (error) {
        throw error;
      }

      // Save preferences to localStorage
      localStorage.setItem('theme', theme);
      localStorage.setItem('notifications', notifications.toString());
      localStorage.setItem('privacyLevel', privacyLevel);

      // Apply theme immediately
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Refresh the page to show updated data
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
      // Note: Supabase doesn't provide a direct way to unlink providers
      // This would typically require backend implementation
      setMessage({ 
        type: 'error', 
        text: 'Account unlinking is not yet implemented. Please contact support.' 
      });
    } catch (error) {
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
      // Note: Account deletion would typically require backend implementation
      // to properly clean up user data across all tables
      setMessage({ 
        type: 'error', 
        text: 'Account deletion is not yet implemented. Please contact support.' 
      });
    } catch (error) {
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
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your personal details</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Name
            </label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              This name will be displayed throughout the application.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-10 bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Contact support if you need to update your email address.
            </p>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customize your experience</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme
            </label>
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
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-blue-100 dark:bg-blue-800' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        isSelected 
                          ? 'text-blue-600 dark:text-blue-300' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${
                        isSelected 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Receive updates about your analyses</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Privacy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Privacy Level
            </label>
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
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className={`text-sm font-medium ${
                          isSelected 
                            ? 'text-blue-900 dark:text-blue-100' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account settings</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Google Account Linking */}
          {user.provider === 'google' && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-blue-800 rounded-lg shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Google Account Connected</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">You sign in with Google</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlinkGoogle}
                disabled={isLoading}
                className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
              >
                <Link2 className="w-4 h-4 mr-1.5" />
                Unlink
              </Button>
            </div>
          )}

          {/* Danger Zone */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Danger Zone</h3>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div>
                <div className="text-sm font-medium text-red-900 dark:text-red-100">Delete Account</div>
                <div className="text-xs text-red-700 dark:text-red-300">
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
        </div>
      </div>
    </div>
  );
}
