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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Email Account
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


        </div>

        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}