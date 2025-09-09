import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Spinner({ size = 'md', className, text }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-primary",
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Specialized spinners for different contexts
export function FileUploadSpinner({ progress }: { progress?: number }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-4">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">Uploading file...</p>
        <p className="text-xs text-gray-500">Please wait while we process your resume</p>
      </div>
    </div>
  );
}

export function AnalysisSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-8">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900">Analyzing your resume...</p>
        <p className="text-sm text-gray-500">This may take a few moments</p>
        <div className="mt-2 flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
        <p className="text-lg font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
}