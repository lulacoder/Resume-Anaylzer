import { Suspense } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import {
  DynamicFeaturesSection,
  DynamicTestimonialsSection,
  DynamicCTASection,
  DynamicFooter,
  LoadingSpinner,
} from '@/lib/dynamic-imports';

export default function LandingPage() {
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