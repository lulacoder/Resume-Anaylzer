'use client';

import { useEffect } from 'react';
import { trackWebVitals, logBundleInfo } from '@/lib/performance';

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize performance tracking
    trackWebVitals();
    logBundleInfo();
  }, []);

  return <>{children}</>;
}