'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface User {
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
  user: User;
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
  useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
      const savedNotifications = localStorage.getItem('notifications') !== 'false';
      const savedPrivacy = localStorage.getItem('privacyLevel') as 'public' | 'private' || 'private';
      
      setTheme(savedTheme);
      setNotifications(savedNotifications);
      setPrivacyLevel(savedPrivacy);
    }
  });

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

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
        
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will be displayed in your profile and throughout the application.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={user.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email address cannot be changed. Contact support if you need to update it.
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <Button type="submit" loading={isLoading} loadingText="Saving...">
            Save Profile
          </Button>
        </form>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
        
        <div className="space-y-6">
          {/* Theme Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Theme Preference
            </label>
            <div className="space-y-2">
              {[
                { value: 'light', label: 'Light', description: 'Always use light theme' },
                { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
                { value: 'system', label: 'System', description: 'Follow system preference' },
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={option.value}
                    checked={theme === option.value}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Email Notifications</div>
                <div className="text-xs text-gray-500">Receive updates about your analyses and account</div>
              </div>
            </label>
          </div>

          {/* Privacy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Privacy Level
            </label>
            <div className="space-y-2">
              {[
                { value: 'private', label: 'Private', description: 'Your data is private and not shared' },
                { value: 'public', label: 'Public', description: 'Allow anonymous usage analytics' },
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    value={option.value}
                    checked={privacyLevel === option.value}
                    onChange={(e) => setPrivacyLevel(e.target.value as 'public' | 'private')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Management</h2>
        
        <div className="space-y-4">
          {/* Google Account Linking */}
          {user.provider === 'google' && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Google Account Connected</h3>
                  <p className="text-xs text-blue-700">Your account is linked to Google for easy sign-in</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnlinkGoogle}
                  disabled={isLoading}
                >
                  Unlink
                </Button>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                  <p className="text-xs text-red-700">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}