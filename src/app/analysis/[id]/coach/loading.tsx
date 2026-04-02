import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function AnalysisCoachLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Card className="border-amber-200 dark:border-amber-800">
        <CardContent className="flex flex-col items-center justify-center p-14 text-center">
          <div className="mb-5 rounded-full bg-amber-100 p-4 dark:bg-amber-900/40">
            <Bot className="h-7 w-7 text-amber-600 dark:text-amber-300" />
          </div>
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <h2 className="text-xl font-semibold">Opening your AI coach...</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Loading the conversation, analysis context, and rewrite workspace around this resume.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
