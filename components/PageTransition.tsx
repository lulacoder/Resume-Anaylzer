'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Simplified page transition - only fade in new content, no fade out
// This prevents the "blink" effect when navigating
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      // New page - trigger fade in
      setIsVisible(false);
      // Use RAF to ensure the hidden state is applied before fading in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      previousPathname.current = pathname;
    }
  }, [pathname]);

  return (
    <div
      className={cn(
        "transition-opacity duration-200 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {children}
    </div>
  );
}

// Alternative slide transition for specific use cases
export function SlidePageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      setIsVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      previousPathname.current = pathname;
    }
  }, [pathname]);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-2"
      )}
    >
      {children}
    </div>
  );
}

// Performance-optimized transition with reduced motion support
// This is the recommended default - minimal flash, respects user preferences
export function OptimizedPageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;
    
    if (prefersReducedMotion) {
      // Skip animation for users who prefer reduced motion
      setIsReady(true);
      return;
    }

    if (previousPathname.current !== pathname) {
      // Page changed - do a quick fade in
      setIsReady(false);
      // Immediate reflow then fade in
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 10);
      previousPathname.current = pathname;
      return () => clearTimeout(timer);
    } else {
      // Initial mount
      setIsReady(true);
    }
  }, [pathname]);

  return (
    <div
      className={cn(
        "transition-opacity duration-150 ease-out motion-reduce:transition-none",
        isReady ? "opacity-100" : "opacity-0"
      )}
    >
      {children}
    </div>
  );
}
