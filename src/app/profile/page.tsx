import { getUserProfileServer } from '@/lib/auth-server-utils';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/ProfileForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Shield, Mail } from 'lucide-react';

export default async function ProfilePage() {
  const { user, error } = await getUserProfileServer();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-foreground">Profile</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
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
            <Card className="overflow-hidden sticky top-8">
              {/* Profile Header with gradient */}
              <div className="h-24 bg-gradient-to-br from-primary to-accent relative">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
                    <AvatarImage src={user.avatar} alt="Profile" />
                    <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <CardContent className="pt-14 pb-6 text-center">
                <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </p>
                
                {/* Account type badge */}
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
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
              </CardContent>

              {/* Account Stats */}
              <Separator />
              <CardContent className="space-y-3 py-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-muted rounded-lg">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Member since</div>
                    <div className="text-foreground font-medium">
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
                    <div className="p-2 bg-muted rounded-lg">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Last sign in</div>
                      <div className="text-foreground font-medium">
                        {new Date(user.lastSignIn).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Security */}
              <Separator />
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Your data is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>
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
