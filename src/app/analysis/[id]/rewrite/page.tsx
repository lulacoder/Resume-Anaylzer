'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ArrowLeft, Bot, Download, Sparkles, WandSparkles } from 'lucide-react';
import { generateResumePdf } from '@/lib/pdfGenerator';
import type { AnalysisRewriteVersion } from '@/types/index';

interface RewriteSection {
  title: string;
  original: string;
  improved: string;
}

export default function RewritePage({ params }: { params: Promise<{ id: string }> }) {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [sections, setSections] = useState<RewriteSection[]>([]);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [versions, setVersions] = useState<AnalysisRewriteVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<number | null>(null);

  useEffect(() => {
    params.then(({ id }) => setAnalysisId(id));
  }, [params]);

  useEffect(() => {
    if (!analysisId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const metaRes = await fetch(`/api/analysis/${analysisId}`);
        if (metaRes.ok) {
          const meta = await metaRes.json();
          setJobTitle(meta.job_title ?? null);
        }

        const res = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Rewrite request failed');
        }

        const data = await res.json();
        setSections(data.sections ?? []);
        setActiveVersion(typeof data.version_number === 'number' ? data.version_number : null);

        const chatRes = await fetch(`/api/chat?analysisId=${analysisId}`);
        if (chatRes.ok) {
          const chatPayload = await chatRes.json();
          setVersions(chatPayload.versions ?? []);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [analysisId]);

  const handleDownload = useCallback(async () => {
    if (sections.length === 0) return;
    setIsDownloading(true);

    try {
      const pdfBytes = await generateResumePdf(sections, jobTitle);
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `improved-resume${jobTitle ? `-${jobTitle.replace(/\s+/g, '-')}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [sections, jobTitle]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <Link href={`/analysis/${analysisId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
        </Link>

        <Card className="overflow-hidden border-amber-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_38%),linear-gradient(180deg,_rgba(255,251,235,0.95),_rgba(255,255,255,1))] dark:border-amber-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.15),_transparent_35%),linear-gradient(180deg,_rgba(69,26,3,0.22),_rgba(10,10,10,0.08))]">
          <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">
                Polished resume workspace
              </Badge>
              {activeVersion && <Badge variant="outline">Version {activeVersion}</Badge>}
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  <Sparkles className="h-8 w-8 text-amber-500" />
                  Resume Rewriter
                </h1>
                <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                  Review the improved content, compare it against the original, and export a cleaner ATS-safe PDF that feels ready to send.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href={`/analysis/${analysisId}/coach`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950">
                    <Bot className="h-4 w-4 mr-2" />
                    Refine With AI Coach
                  </Button>
                </Link>
                {sections.length > 0 && (
                  <Button onClick={handleDownload} disabled={isDownloading} className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Building polished PDF...' : 'Download Polished PDF'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <h3 className="mb-1 text-lg font-medium">Preparing your polished resume...</h3>
            <p className="text-sm text-muted-foreground">
              Loading the latest rewrite version and formatting it for a stronger review and download experience.
            </p>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-8 text-center">
            <h3 className="mb-2 text-lg font-medium text-red-700 dark:text-red-300">Rewrite Failed</h3>
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && sections.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index} className="overflow-hidden border-border/80 shadow-sm">
                <CardContent className="p-0">
                  <div className="border-b bg-muted/40 px-5 py-4 sm:px-6">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
                    <div className="order-2 bg-background p-5 sm:p-6 md:order-1">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                          Original
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                        {section.original}
                      </div>
                    </div>

                    <div className="order-1 bg-gradient-to-br from-emerald-50 to-white p-5 dark:from-emerald-950/20 dark:to-background sm:p-6 md:order-2">
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                          Improved
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-7">
                        {section.improved}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center pb-8 pt-2">
              <Button
                size="lg"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full max-w-md bg-amber-600 text-white hover:bg-amber-700"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Building polished PDF...' : 'Download Improved Resume as PDF'}
              </Button>
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-6">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Rewrite version</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Current</span>
                  <span className="text-muted-foreground">
                    {activeVersion ? `Version ${activeVersion}` : 'Legacy version'}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  This view is optimized for review, and the download now uses a more polished ATS-friendly resume layout.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Best workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <WandSparkles className="mt-0.5 h-4 w-4 text-amber-600" />
                  <span>Use the AI Coach page to refine tone, focus area, and seniority.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>Review the improved wording section by section before downloading.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Download className="mt-0.5 h-4 w-4 text-sky-600" />
                  <span>Export the polished PDF once the rewrite matches the role you want.</span>
                </div>
              </CardContent>
            </Card>

            {versions.length > 1 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Version history</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {versions.slice(0, 5).map((version) => (
                    <div key={version.id} className="rounded-xl border bg-muted/30 px-3 py-3 text-xs">
                      <div className="font-medium">Version {version.version_number}</div>
                      <div className="mt-1 text-muted-foreground">{new Date(version.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
