# Google OAuth Configuration Guide

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - Development: `https://uylewhickrfkymjkhmti.supabase.co/auth/v1/callback`
     https://qvfwskzszeaexsiwuqit.supabase.co/auth/v1/callback
     - Production: `https://your-production-domain.supabase.co/auth/v1/callback`
   - Save the Client ID and Client Secret

## Step 2: Supabase Dashboard Configuration

1. Go to your Supabase project dashboard: https://uylewhickrfkymjkhmti.supabase.co
2. Navigate to "Authentication" > "Providers"
3. Find "Google" in the list and click to configure
4. Enable Google provider
5. Enter the Google OAuth credentials:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
6. Set redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://resume-anayzer-gamma.vercel.app/auth/callback`
7. Save the configuration

## Step 3: Environment Variables

Add to your `.env.local` file:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Test the Configuration

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Sign In with Google"
4. Complete the OAuth flow
5. Verify user data is properly stored in Supabase

## Verification Checklist

- [ ] Google Cloud Console project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 credentials created with correct redirect URIs
- [ ] Supabase Google provider enabled and configured
- [ ] Environment variables set
- [ ] OAuth flow tested successfully
- [ ] User profile data mapping verified