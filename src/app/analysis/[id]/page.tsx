import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { AnalysisResult } from '@/components/AnalysisResult';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params in Next.js 15
  const { id } = await params;
  const supabase = await createClient();
  
  // Get the analysis by ID - removing enhanced_analysis column since it doesn't exist
  const { data: analysis, error } = await supabase
    .from('analyses')
    .select(`
      id,
      created_at,
      job_title,
      job_description,
      match_score,
      analysis_result,
      resume_id
    `)
    .eq('id', id)
    .single();

  if (error || !analysis) {
    console.error('Error fetching analysis:', error);
    notFound();
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
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
          
          <Link href="/analyze">
            <Button>Analyze New Resume</Button>
          </Link>
        </div>
      </div>
      
      <AnalysisResult analysis={analysis} />
    </div>
  );
}