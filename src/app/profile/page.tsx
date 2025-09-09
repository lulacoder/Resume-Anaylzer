import { getUserProfileServer } from '@/lib/auth-server-utils';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/ProfileForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ProfilePage() {
  const { user, error } = await getUserProfileServer();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto object-cover mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              
              <div className="mt-4 flex items-center justify-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.provider === 'google' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.provider === 'google' ? (
                    <>
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google Account
                    </>
                  ) : (
                    'Email Account'
                  )}
                </span>
              </div>

              <div className="mt-6 text-sm text-gray-500 space-y-1">
                <p>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                {user.lastSignIn && (
                  <p>Last sign in: {new Date(user.lastSignIn).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Google Account Details */}
          {user.googleData && (
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Google Account Details</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Name:</strong> {user.googleData.name}</p>
                <p><strong>Email:</strong> {user.googleData.email}</p>
                <p><strong>Google ID:</strong> {user.googleData.id}</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}