import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bot, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getAnalysisById } from '@/lib/supabase/queries';
import { AnalysisCoachWorkspace } from '@/components/AnalysisCoachWorkspace';
import { Badge, Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/button';

export default async function AnalysisCoachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  let analysis;
  try {
    analysis = await getAnalysisById(id, user.id);
  } catch (error) {
    console.error('Error fetching analysis for coach page:', error);
    notFound();
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link href={`/analysis/${id}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analysis
        </Button>
      </Link>

      <Card className="mb-6 overflow-hidden border-amber-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_32%),linear-gradient(180deg,_rgba(255,251,235,0.96),_rgba(255,255,255,1))] dark:border-amber-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.15),_transparent_35%),linear-gradient(180deg,_rgba(69,26,3,0.22),_rgba(10,10,10,0.08))]">
        <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">
              AI resume copilot
            </Badge>
            <Badge variant="outline">Interview + rewrite + application kit</Badge>
          </div>

          <div className="max-w-4xl">
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
              <Bot className="h-8 w-8 text-amber-600" />
              Turn this analysis into a full application engine
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              The coach now interviews for missing facts, preserves truth, generates a targeted resume draft, and produces the rest of the application package around it.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Role: {analysis.job_title || 'Untitled analysis'}
            </span>
            <span>Match score: {analysis.match_score ?? 0}%</span>
            <span>Analyzed on {new Date(analysis.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <AnalysisCoachWorkspace analysisId={id} initialJobTitle={analysis.job_title} />
    </div>
  );
}
