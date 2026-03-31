import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardAnalysisCard } from '@/components/DashboardAnalysisCard';
import { Button } from '@/components/ui/button';
import { getUserAnalysisHistory } from '@/lib/supabase/queries';
import type { EnhancedAnalysisResult } from '@/types/index';
import { Plus, FileText, Sparkles } from 'lucide-react';

interface DashboardAnalysis {
  id: string;
  created_at: string;
  job_title: string | null;
  match_score: number | null;
  enhanced_analysis?: EnhancedAnalysisResult | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  let analyses: DashboardAnalysis[] = [];
  try {
    analyses = await getUserAnalysisHistory(user.id, 20);
  } catch (error) {
    console.error('Error fetching analyses:', error);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-muted/30">
        <div className="section-container py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">View and manage your resume analyses</p>
            </div>
            
            <Link href="/analyze">
              <Button size="lg" className="group">
                <Plus className="w-5 h-5 mr-2" />
                Analyze New Resume
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="section-container py-8">
        {analyses && analyses.length > 0 ? (
          <div className="space-y-4">
            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
            </p>
            
            {/* Analysis cards */}
            {analyses.map((analysis: DashboardAnalysis) => (
              <DashboardAnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-card border border-border border-dashed rounded-xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-foreground mb-2">No analyses yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven&apos;t analyzed any resumes yet. Get started by analyzing your first resume.
            </p>
            
            <Link href="/analyze">
              <Button>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Your First Resume
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
