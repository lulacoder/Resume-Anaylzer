import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { AnalysisResult } from '@/components/AnalysisResult';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Bot, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { getAnalysisById } from '@/lib/supabase/queries';

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params in Next.js 15
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
    console.error('Error fetching analysis:', error);
    notFound();
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{analysis.job_title || 'Untitled Analysis'}</h1>
            <p className="text-muted-foreground">
              Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link href={`/analysis/${id}/coach`}>
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950">
                <Bot className="h-4 w-4 mr-2" />
                Open AI Coach
              </Button>
            </Link>
            {analysis.improved_sections ? (
              <Link href={`/analysis/${id}/rewrite`}>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  View Improved Resume
                </Button>
              </Link>
            ) : (
              <Link href={`/analysis/${id}/rewrite`}>
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve Resume
                </Button>
              </Link>
            )}
            <Link href="/analyze">
              <Button>Analyze New Resume</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <div className="min-w-0">
          <AnalysisResult analysis={analysis} />
        </div>
        <div className="space-y-4 xl:sticky xl:top-6">
          <Card className="overflow-hidden border-amber-200 bg-gradient-to-b from-amber-50 via-background to-background dark:border-amber-800 dark:from-amber-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 dark:bg-amber-900/40">
                  <Bot className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Resume Coach</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Chat about this exact resume, then generate a polished, downloadable version.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>Uses the uploaded resume text, job description, and analysis context together.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>Lets you steer tone, focus, and seniority before generating a full rewrite.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>Keeps the coaching grounded in truthful content instead of inventing experience.</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link href={`/analysis/${id}/coach`}>
                  <Button className="w-full bg-amber-600 text-white hover:bg-amber-700">
                    <Bot className="h-4 w-4 mr-2" />
                    Open Full Coach Page
                  </Button>
                </Link>
                <Link href={`/analysis/${id}/rewrite`}>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    {analysis.improved_sections ? 'View Polished Resume' : 'Open Rewrite Workspace'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
