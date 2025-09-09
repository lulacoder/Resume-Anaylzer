// Performance monitoring utilities for code splitting and lazy loading

export function measurePerformance<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        console.log(`[Performance] ${name}: ${end - start}ms`);
      });
    } else {
      const end = performance.now();
      console.log(`[Performance] ${name}: ${end - start}ms`);
      return result;
    }
  }
  
  return fn();
}

// Track component loading times
export function trackComponentLoad(componentName: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes(componentName)) {
          console.log(`[Component Load] ${componentName}: ${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    return () => observer.disconnect();
  }
  
  return () => {};
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window !== 'undefined') {
    // Track Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`[Web Vitals] LCP: ${lastEntry.startTime}ms`);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEntry & {
          processingStart?: number;
        };
        if (fidEntry.processingStart) {
          console.log(`[Web Vitals] FID: ${fidEntry.processingStart - entry.startTime}ms`);
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
          clsValue += layoutShiftEntry.value;
        }
      });
      console.log(`[Web Vitals] CLS: ${clsValue}`);
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Bundle size tracking
export function logBundleInfo() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[Bundle Info] Checking for dynamic imports...');
    
    // Track when dynamic imports are loaded
    const originalImport = (window as unknown as Record<string, unknown>).import as ((...args: unknown[]) => Promise<unknown>) || function() { return Promise.resolve(); };
    // @ts-expect-error - Overriding window.import for development tracking
    window.import = function(...args: unknown[]) {
      console.log('[Dynamic Import]', args[0]);
      return originalImport.apply(this, args);
    };
  }
}