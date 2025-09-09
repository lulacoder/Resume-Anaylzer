'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Start transition
    setIsTransitioning(true);
    
    // Update children after a brief delay to allow fade out
    const updateTimer = setTimeout(() => {
      setDisplayChildren(children);
    }, 150);

    // End transition
    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => {
      clearTimeout(updateTimer);
      clearTimeout(endTimer);
    };
  }, [pathname, children]);

  return (
    <div
      className={cn(
        "transition-opacity duration-300 ease-in-out",
        isTransitioning ? "opacity-0" : "opacity-100"
      )}
    >
      {displayChildren}
    </div>
  );
}

// Alternative slide transition for specific use cases
export function SlidePageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsTransitioning(true);
    
    const updateTimer = setTimeout(() => {
      setDisplayChildren(children);
    }, 200);

    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400);

    return () => {
      clearTimeout(updateTimer);
      clearTimeout(endTimer);
    };
  }, [pathname, children]);

  return (
    <div
      className={cn(
        "transition-all duration-400 ease-in-out",
        isTransitioning 
          ? "opacity-0 transform translate-y-4" 
          : "opacity-100 transform translate-y-0"
      )}
    >
      {displayChildren}
    </div>
  );
}

// Performance-optimized transition with reduced motion support
export function OptimizedPageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Skip animation for users who prefer reduced motion
      setDisplayChildren(children);
      return;
    }

    setIsTransitioning(true);
    
    const updateTimer = setTimeout(() => {
      setDisplayChildren(children);
    }, 100);

    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 200);

    return () => {
      clearTimeout(updateTimer);
      clearTimeout(endTimer);
    };
  }, [pathname, children]);

  return (
    <div
      className={cn(
        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
        isTransitioning ? "opacity-0" : "opacity-100"
      )}
    >
      {displayChildren}
    </div>
  );
}