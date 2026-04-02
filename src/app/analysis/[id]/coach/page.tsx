import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bot, CheckCircle2, FileText, Sparkles, WandSparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getAnalysisById } from '@/lib/supabase/queries';
import { AnalysisChatPanel } from '@/components/AnalysisChatPanel';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-amber-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_32%),linear-gradient(180deg,_rgba(255,251,235,0.96),_rgba(255,255,255,1))] dark:border-amber-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.15),_transparent_35%),linear-gradient(180deg,_rgba(69,26,3,0.22),_rgba(10,10,10,0.08))]">
            <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">
                  AI resume coach
                </Badge>
                <Badge variant="outline">Full resume context</Badge>
                <Badge variant="outline">Truth-first rewrites</Badge>
              </div>

              <div className="max-w-3xl">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  <Bot className="h-8 w-8 text-amber-600" />
                  Coach this resume into something exceptional
                </h1>
                <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                  Chat with the assistant about this exact resume, shape the tone and focus together, then generate a complete rewritten version that is ready for the polished PDF export.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={`/analysis/${id}/rewrite`} className="w-full sm:w-auto">
                  <Button className="w-full bg-amber-600 text-white hover:bg-amber-700">
                    <FileText className="h-4 w-4 mr-2" />
                    View Rewrite Workspace
                  </Button>
                </Link>
                <Link href={`/analysis/${id}`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Return to Analysis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <AnalysisChatPanel analysisId={id} />
        </div>

        <div className="space-y-4 xl:sticky xl:top-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Target role
                </div>
                <div className="mt-1 font-medium">{analysis.job_title || 'Untitled analysis'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Match score
                </div>
                <div className="mt-1 font-medium">{analysis.match_score ?? 0}%</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Analyzed
                </div>
                <div className="mt-1 font-medium">{new Date(analysis.created_at).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">What the AI should do here</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>Diagnose the biggest weaknesses in the current resume with role-specific advice.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>Ask for missing context that would make the resume stronger before generating a full draft.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>Generate a complete rewritten resume that stays faithful to the candidate’s real experience.</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recommended flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Bot className="mt-0.5 h-4 w-4 text-amber-600" />
                <span>Ask the coach to rewrite your summary, sharpen bullet points, and list missing keywords.</span>
              </div>
              <div className="flex items-start gap-2">
                <WandSparkles className="mt-0.5 h-4 w-4 text-amber-600" />
                <span>Generate the full resume draft once the tone and focus feel right.</span>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 text-sky-600" />
                <span>Open the rewrite workspace and export the polished PDF.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
