'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import type { AnalysisChatMessage, AnalysisRewriteVersion } from '@/types/index';
import { MessageSquare, Send, Sparkles, RefreshCcw, Bot, User, Loader2 } from 'lucide-react';

type ChatResponse = {
  messages?: AnalysisChatMessage[];
  versions?: AnalysisRewriteVersion[];
  error?: string;
  requiresClarification?: boolean;
};

const DEFAULT_PROMPT = 'Help me improve this resume for better ATS performance.';
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
    <Card className="border-amber-200 dark:border-amber-800 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-600" />
            Resume Coach Chat
          </CardTitle>
          <Badge variant="secondary">Persistent</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="py-8 flex items-center justify-center text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading conversation...
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {messages.length === 0 && (
                <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  Start by asking for targeted improvements, then regenerate a tailored full resume version.
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg p-3 text-sm ${message.role === 'user'
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted border border-border'
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
              rows={4}
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
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
            />

            {showPromptChoices && (
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPT_CHOICES.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => handleChoiceClick(choice)}
                    className="text-left text-xs px-2.5 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors"
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

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => submitMessage('chat')}
                disabled={!canSend}
                className="sm:flex-1 min-w-0"
              >
                {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send Message
              </Button>

              <Button
                variant="outline"
                onClick={() => submitMessage('regenerate')}
                disabled={isSending}
                className="sm:flex-1 min-w-0 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
              >
                {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                Regenerate Resume
              </Button>
            </div>

            <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
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
                    <div key={version.id} className="flex items-center justify-between text-xs rounded border bg-background px-2.5 py-2">
                      <span>Version {version.version_number}</span>
                      <span className="text-muted-foreground">{new Date(version.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <Link href={`/analysis/${analysisId}/rewrite`}>
                <Button variant="outline" size="sm" className="w-full mt-1">
                  View Rewrite Page
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
