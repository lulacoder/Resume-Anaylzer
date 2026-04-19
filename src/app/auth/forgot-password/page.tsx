'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/login`
        : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess('Password reset link sent. Check your email inbox.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-12">
        <div className="w-full space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your account email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} loading={isLoading} loadingText="Sending...">
              Send reset link
            </Button>
          </form>

          {success && (
            <Alert className="border-success/20 bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle className="text-success">Email sent</AlertTitle>
              <AlertDescription className="text-success/90">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Reset failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
