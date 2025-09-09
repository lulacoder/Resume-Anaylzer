import { testGoogleOAuthConfigServer, getUserProfileServer } from '@/lib/auth-server-utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export default async function AuthTestPage() {
  const configTest = await testGoogleOAuthConfigServer();
  const profileData = await getUserProfileServer();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Google OAuth Configuration Test</h1>
      
      <div className="space-y-6">
        {/* Configuration Test Results */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
          <div className={`p-4 rounded ${configTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {configTest.success ? '✅ OAuth Configuration Test Passed' : '❌ OAuth Configuration Test Failed'}
            {configTest.error && <p className="mt-2">Error: {configTest.error}</p>}
            {configTest.message && <p className="mt-2">{configTest.message}</p>}
          </div>
        </div>

        {/* User Profile Data */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Profile Data</h2>
          {profileData.user ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>ID:</strong> {profileData.user.id}
                </div>
                <div>
                  <strong>Email:</strong> {profileData.user.email}
                </div>
                <div>
                  <strong>Name:</strong> {profileData.user.name || 'Not provided'}
                </div>
                <div>
                  <strong>Provider:</strong> {profileData.user.provider}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(profileData.user.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Last Sign In:</strong> {profileData.user.lastSignIn ? new Date(profileData.user.lastSignIn).toLocaleString() : 'Never'}
                </div>
              </div>
              
              {profileData.user.avatar && (
                <div className="mt-4">
                  <strong>Avatar:</strong>
                  <img src={profileData.user.avatar} alt="User avatar" className="w-16 h-16 rounded-full mt-2" />
                </div>
              )}

              {profileData.user.googleData && (
                <div className="mt-4 p-4 bg-blue-50 rounded">
                  <strong>Google Profile Data:</strong>
                  <pre className="mt-2 text-sm overflow-auto">
                    {JSON.stringify(profileData.user.googleData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-600">
              No user session found. Please sign in to test user data mapping.
            </div>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button>Test Login</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Configuration Instructions */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold mb-4">Configuration Checklist</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Environment variables configured</li>
            <li>⏳ Google Cloud Console OAuth credentials (see GOOGLE_OAUTH_SETUP.md)</li>
            <li>⏳ Supabase Google provider enabled and configured</li>
            <li>⏳ Redirect URLs properly set in both Google and Supabase</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            Follow the instructions in <code>GOOGLE_OAUTH_SETUP.md</code> to complete the configuration.
          </p>
        </div>
      </div>
    </div>
  );
}