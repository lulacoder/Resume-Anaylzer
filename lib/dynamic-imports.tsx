import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading component for lazy-loaded components
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Dynamic imports for landing page components
export const DynamicFeaturesSection = dynamic(
  () => import('@/components/landing/FeaturesSection'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true, // Keep SSR for SEO
  }
);

export const DynamicTestimonialsSection = dynamic(
  () => import('@/components/landing/TestimonialsSection'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
);

export const DynamicCTASection = dynamic(
  () => import('@/components/landing/CTASection'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
);

export const DynamicFooter = dynamic(
  () => import('@/components/landing/Footer'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
);

// Dynamic imports for heavy components (client-side only)
export const DynamicAnalysisResult = dynamic(
  () => import('@/components/AnalysisResult').then(mod => ({ default: mod.AnalysisResult })),
  {
    loading: () => <LoadingSpinner />,
  }
);

// Dynamic import for profile form (heavy component)
export const DynamicProfileForm = dynamic(
  () => import('@/components/ProfileForm').then(mod => ({ default: mod.ProfileForm })),
  {
    loading: () => <LoadingSpinner />,
  }
);

// Utility function for creating dynamic imports with custom loading
export function createDynamicImport<T = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    loading?: ComponentType;
    ssr?: boolean;
  } = {}
) {
  const LoadingComponent = options.loading || LoadingSpinner;
  return dynamic(importFn, {
    loading: () => <LoadingComponent />,
    ssr: options.ssr ?? true,
  });
}