'use client';

import Link from 'next/link';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { WifiOff, Home, RefreshCw } from 'lucide-react';


export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <LogoIcon size={72} />
        </div>

        {/* Offline icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-display font-bold text-foreground mb-3">
          You&apos;re offline
        </h1>
        <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
          It looks like you&apos;ve lost your internet connection. Check your network
          and try again.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>

        {/* Tip */}
        <p className="mt-10 text-sm text-muted-foreground">
          Some pages may be available from cache while offline.
        </p>
      </div>
    </div>
  );
}
