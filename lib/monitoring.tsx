// Production monitoring utilities
import React from 'react';

export interface ErrorReport {
  message: string;
  stack?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

export class MonitoringService {
  private static instance: MonitoringService;

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  async reportError(error: Error | string, context?: Record<string, unknown>, severity: ErrorReport['severity'] = 'medium') {
    const errorReport: ErrorReport = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      severity,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', errorReport);
      return;
    }

    // In production, you would send this to your error tracking service
    // Examples: Sentry, Bugsnag, LogRocket, etc.
    try {
      // await errorTrackingService.report(errorReport);
      console.error('Production Error:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  async trackPerformance(metric: string, value: number, tags?: Record<string, string>) {
    const performanceData = {
      metric,
      value,
      tags,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metric:', performanceData);
      return;
    }

    // In production, send to your monitoring service
    // Examples: DataDog, New Relic, Grafana, etc.
    try {
      // await metricsService.track(performanceData);
      console.log('Performance Metric:', performanceData);
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }

  async trackUserAction(action: string, userId?: string, properties?: Record<string, unknown>) {
    const eventData = {
      action,
      userId,
      properties,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('User Action:', eventData);
      return;
    }

    // In production, send to your analytics service
    try {
      // await analyticsService.track(eventData);
      console.log('User Action:', eventData);
    } catch (error) {
      console.error('Failed to track user action:', error);
    }
  }
}

export const monitoring = MonitoringService.getInstance();

// React Error Boundary helper
export function withErrorBoundary<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  return function WrappedComponent(props: T) {
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      if (error) {
        monitoring.reportError(error, { component: Component.name }, 'high');
      }
    }, [error]);

    if (error) {
      const FallbackComponent = fallback || DefaultErrorFallback;
      return <FallbackComponent error={error} retry={() => setError(null)} />;
    }

    try {
      return <Component {...props} />;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  };
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}