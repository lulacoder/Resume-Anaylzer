'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Sparkles } from 'lucide-react';
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
        // Fetch analysis metadata for the title
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
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <Link href={`/analysis/${analysisId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-amber-500" />
              Resume Rewriter
            </h1>
            <p className="text-muted-foreground mt-1">
              Side-by-side comparison of your original resume vs. the AI-improved version
            </p>
          </div>

          {sections.length > 0 && (
            <Button onClick={handleDownload} disabled={isDownloading}>
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <h3 className="text-lg font-medium mb-1">Loading your improved resume...</h3>
            <p className="text-muted-foreground text-sm">
              Fetching your latest improved version. If none exists yet, one will be generated automatically.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">Rewrite Failed</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Side-by-side comparison */}
      {!isLoading && !error && sections.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Rewrite version</span>
                <span className="text-muted-foreground">
                  {activeVersion ? `Version ${activeVersion}` : 'Legacy version'}
                </span>
              </div>
              {versions.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  {versions.length} total versions available from chat-driven regeneration.
                </p>
              )}
            </CardContent>
          </Card>

          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="p-0">
                <div className="bg-muted/50 px-6 py-3 border-b">
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                  {/* Original */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Original
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {section.original}
                    </div>
                  </div>

                  {/* Improved */}
                  <div className="p-6 bg-green-50/50 dark:bg-green-950/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-medium uppercase tracking-wider text-green-700 dark:text-green-400">
                        Improved
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {section.improved}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Bottom download button */}
          <div className="flex justify-center pt-4 pb-8">
            <Button size="lg" onClick={handleDownload} disabled={isDownloading}>
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Generating PDF...' : 'Download Improved Resume as PDF'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
