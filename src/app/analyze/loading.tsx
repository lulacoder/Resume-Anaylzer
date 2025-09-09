import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function AnalyzeLoading() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8 text-center">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
      </div>
      
      <Card className="border-t-4 border-t-primary shadow-lg">
        <div className="p-6 md:p-8">
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
            
            {/* Job Title */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
            
            {/* Job Description */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Features Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center text-center p-4">
            <Skeleton className="h-16 w-16 rounded-full mb-4" />
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}