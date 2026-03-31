import { getUserProfileServer } from '@/lib/auth-server-utils';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/ProfileForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Shield, Mail, User } from 'lucide-react';

export default async function ProfilePage() {
  const { user, error } = await getUserProfileServer();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Profile</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sticky top-8">
              {/* Profile Header with gradient */}
              <div className="h-24 bg-gradient-to-br from-blue-500 to-blue-600 relative">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-14 pb-6 px-6 text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </p>
                
                {/* Account type badge */}
                <div className="mt-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    user.provider === 'google'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                  }`}>
                    {user.provider === 'google' ? (
                      <>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        </svg>
                        Google Account
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        Email Account
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Account Stats */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">Member since</div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                
                {user.lastSignIn && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">Last sign in</div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {new Date(user.lastSignIn).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Your data is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <ProfileForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
