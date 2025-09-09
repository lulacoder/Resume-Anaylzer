import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardAnalysisCard } from '@/components/DashboardAnalysisCard';
import { Button } from '@/components/ui/button';
import { getUserAnalysisHistory } from '@/lib/supabase/queries';

interface DashboardAnalysis {
  id: string;
  created_at: string;
  job_title: string | null;
  match_score: number | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Use the optimized and cached query function
  let analyses: DashboardAnalysis[] = [];
  try {
    analyses = await getUserAnalysisHistory(user.id, 20);
  } catch (error) {
    console.error('Error fetching analyses:', error);
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground mt-1">View and manage your resume analyses</p>
        </div>
        <Link href="/analyze">
          <Button size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            Analyze New Resume
          </Button>
        </Link>
      </div>

      {analyses && analyses.length > 0 ? (
        <div className="space-y-6">
          {analyses.map((analysis: DashboardAnalysis) => (
            <DashboardAnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      ) : (
        <div className="bg-muted/40 rounded-lg p-12 text-center border border-dashed border-muted-foreground/20">
          <h3 className="text-xl font-medium mb-2">No analyses yet</h3>
          <p className="text-muted-foreground mb-6">You haven&apos;t analyzed any resumes yet. Get started by analyzing your first resume.</p>
          <Link href="/analyze">
            <Button>Analyze Your First Resume</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
