'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { handleAuthError, signInWithRetry } from '@/lib/auth-error-handler';
import { FileText, ArrowLeft, AlertCircle, Sparkles, Check } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = '/dashboard';
      }
    };
    checkExistingSession();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      await signInWithRetry(supabase, { email, password });
      window.location.href = '/dashboard';
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError.userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'AI-powered resume analysis',
    'Match score with job descriptions', 
    'Actionable improvement tips',
    'Track your progress over time',
  ];

  return (
    <div className="min-h-screen flex bg-gradient-warm">
      {/* Left side - Decorative Panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-rose" />
        
        {/* Decorative shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-32 right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        
        {/* Floating elements */}
        <div className={`absolute top-32 right-20 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className={`absolute bottom-40 left-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
          <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-4xl xl:text-5xl font-display font-bold text-white leading-tight mb-6">
              Your career journey<br />
              <span className="text-white/80">starts here</span>
            </h2>
            <p className="text-white/70 text-lg max-w-md mb-10">
              Join thousands of professionals who've optimized their resumes and landed their dream jobs.
            </p>
          </div>
          
          {/* Feature list */}
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li 
                key={feature}
                className={`flex items-center gap-3 text-white/90 transition-all duration-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${600 + i * 100}ms` }}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {/* Stats */}
          <div className={`mt-12 pt-8 border-t border-white/20 grid grid-cols-2 gap-8 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-white/60 text-sm">Resumes analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">89%</div>
              <div className="text-white/60 text-sm">Success rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className={`mx-auto w-full max-w-md transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Back link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">Resume Analyzer</span>
            </Link>
            <h1 className="text-3xl font-display font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-lg">Sign in to continue optimizing your career</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                error={!!error}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-accent transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                error={!!error}
                className="h-12 text-base"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              size="lg"
              loading={isLoading}
              loadingText="Signing in..."
            >
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* Social login placeholder */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-medium"
            disabled
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google (Coming soon)
          </Button>

          {/* Footer */}
          <p className="mt-10 text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary hover:text-accent transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
