'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import type { AnalysisChatMessage, AnalysisRewriteVersion } from '@/types/index';
import { MessageSquare, Send, Sparkles, RefreshCcw, Bot, User, Loader2, FileText, WandSparkles } from 'lucide-react';

type ChatResponse = {
  messages?: AnalysisChatMessage[];
  versions?: AnalysisRewriteVersion[];
  error?: string;
  requiresClarification?: boolean;
};

const DEFAULT_PROMPT = 'Help me turn this into a stronger, truthful resume for this role.';
const QUICK_PROMPT_CHOICES = [
  'Give me the top 3 improvements with the highest impact on this specific resume.',
  'Rewrite my professional summary to match this role while staying truthful.',
  'What ATS keywords are missing from my current resume based on this analysis?',
  'Prepare this resume to sound more senior while keeping my actual experience intact.',
];

export function AnalysisChatPanel({ analysisId }: { analysisId: string }) {
  const [messages, setMessages] = useState<AnalysisChatMessage[]>([]);
  const [versions, setVersions] = useState<AnalysisRewriteVersion[]>([]);
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('Professional and concise');
  const [focusArea, setFocusArea] = useState('Impactful bullet points and quantified achievements');
  const [seniority, setSeniority] = useState('Mid-level');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPromptChoices, setShowPromptChoices] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const latestVersion = versions[0] || null;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat?analysisId=${encodeURIComponent(analysisId)}`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load chat data');
      }

      setMessages(payload.messages || []);
      setVersions(payload.versions || []);
      setShowPromptChoices((payload.messages || []).length === 0);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load chat data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  const submitMessage = useCallback(async (action: 'chat' | 'regenerate') => {
    const outgoingMessage = input.trim();

    if (action === 'chat' && !outgoingMessage) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          action,
          message: outgoingMessage || undefined,
          preferences: {
            tone,
            focusArea,
            seniority,
          },
        }),
      });

      const payload: ChatResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Request failed');
      }

      if (payload.messages) {
        setMessages(payload.messages);
      }

      if (payload.versions) {
        setVersions(payload.versions);
      }

      setInput('');
      setSelectedChoice(null);
      setShowPromptChoices(false);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Request failed';
      setError(message);
    } finally {
      setIsSending(false);
    }
  }, [analysisId, focusArea, input, seniority, tone]);

  const handleChoiceClick = (choice: string) => {
    setInput(choice);
    setSelectedChoice(choice);
    setShowPromptChoices(true);
  };

  return (
    <Card className="overflow-hidden border-amber-200 bg-gradient-to-b from-amber-50/90 via-background to-background dark:border-amber-800 dark:from-amber-950/20">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">
                AI workspace
              </Badge>
              <Badge variant="outline">Persistent context</Badge>
            </div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-amber-600" />
              Resume Coach Chat
            </CardTitle>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Every reply uses your resume text, the job description, and the analysis context. When you are happy with the guidance, generate a full rewritten version.
            </p>
          </div>
          <Link href={`/analysis/${analysisId}/rewrite`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950">
              <FileText className="h-4 w-4 mr-2" />
              Open Rewrite Page
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading conversation...
          </div>
        ) : (
          <>
            <div className="grid gap-3 rounded-2xl border border-amber-200/70 bg-background/80 p-3 dark:border-amber-900/60">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border bg-card px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Tone
                  </div>
                  <div className="mt-1 text-sm font-medium">{tone}</div>
                </div>
                <div className="rounded-2xl border bg-card px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Focus
                  </div>
                  <div className="mt-1 text-sm font-medium">{focusArea}</div>
                </div>
                <div className="rounded-2xl border bg-card px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Seniority
                  </div>
                  <div className="mt-1 text-sm font-medium">{seniority}</div>
                </div>
              </div>

              <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                  Start by asking for targeted improvements, then generate a tailored full resume draft once the coaching direction feels right.
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-2xl p-4 text-sm shadow-sm ${message.role === 'user'
                    ? 'border border-primary/20 bg-primary/10'
                    : 'border border-border bg-muted/70'
                    }`}
                >
                  <div className="font-medium mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                    {message.role === 'user' ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                    {message.role}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              ))}
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Tone</label>
                <input
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Focus</label>
                <input
                  value={focusArea}
                  onChange={(event) => setFocusArea(event.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Seniority</label>
                <input
                  value={seniority}
                  onChange={(event) => setSeniority(event.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <textarea
              rows={5}
              value={input}
              onChange={(event) => {
                const nextValue = event.target.value;
                setInput(nextValue);

                if (!selectedChoice && nextValue.trim().length > 0) {
                  setShowPromptChoices(false);
                }

                if (selectedChoice && nextValue !== selectedChoice) {
                  setSelectedChoice(null);
                }
              }}
              placeholder={DEFAULT_PROMPT}
              className="min-h-[144px] w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm"
            />

            {showPromptChoices && (
              <div className="grid gap-2 md:grid-cols-2">
                {QUICK_PROMPT_CHOICES.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => handleChoiceClick(choice)}
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="text-sm rounded-md border border-destructive/20 bg-destructive/10 text-destructive p-2.5">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => submitMessage('chat')}
                disabled={!canSend}
                className="min-w-0 sm:flex-1"
              >
                {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Ask Coach
              </Button>

              <Button
                variant="outline"
                onClick={() => submitMessage('regenerate')}
                disabled={isSending}
                className="min-w-0 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950 sm:flex-1"
              >
                {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <WandSparkles className="h-4 w-4 mr-2" />}
                Generate Full Resume
              </Button>
            </div>

            <div className="space-y-3 rounded-2xl border bg-muted/40 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Rewrite Versions
                </div>
                {latestVersion && (
                  <Badge variant="secondary">Latest v{latestVersion.version_number}</Badge>
                )}
              </div>

              {versions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No regenerated versions yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {versions.slice(0, 5).map((version) => (
                    <div key={version.id} className="flex flex-col gap-1 rounded-xl border bg-background px-3 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium">Version {version.version_number}</span>
                      <span className="text-muted-foreground">{new Date(version.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <Link href={`/analysis/${analysisId}/rewrite`}>
                <Button variant="outline" size="sm" className="mt-1 w-full">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  View Latest Rewrite
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
