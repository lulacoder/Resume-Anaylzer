import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import HeroSection from '@/components/landing/HeroSection';
import {
  DynamicFeaturesSection,
  DynamicTestimonialsSection,
  DynamicCTASection,
  DynamicFooter,
  LoadingSpinner,
} from '@/lib/dynamic-imports';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen">
      {/* Hero section loads immediately for above-the-fold content */}
      <HeroSection />
      
      {/* Below-the-fold sections are lazy loaded */}
      <Suspense fallback={<LoadingSpinner />}>
        <DynamicFeaturesSection />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <DynamicTestimonialsSection />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <DynamicCTASection />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <DynamicFooter />
      </Suspense>
    </div>
  );
}
