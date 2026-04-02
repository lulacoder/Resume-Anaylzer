'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui/button';
import type {
  AnalysisApplicationPackage,
  AnalysisChatMessage,
  AnalysisCoachProfileInput,
  AnalysisRewriteVersion,
} from '@/types/index';
import {
  Bot,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

type CoachResponse = {
  messages?: AnalysisChatMessage[];
  versions?: AnalysisRewriteVersion[];
  packageVersions?: AnalysisApplicationPackage[];
  latestPackage?: AnalysisApplicationPackage | null;
  coachProfile?: {
    target_role: string | null;
    target_seniority: string | null;
    tone: string | null;
    focus_area: string | null;
    target_companies: string[];
    must_keep: string[];
    top_achievements: string[];
    career_story: string | null;
    constraints: string | null;
    job_search_priorities: string[];
    missing_details: string[];
    intake_status: 'draft' | 'ready';
  } | null;
  intakeChecklist?: string[];
  error?: string;
};

type CoachFormState = {
  targetRole: string;
  targetSeniority: string;
  tone: string;
  focusArea: string;
  targetCompanies: string;
  mustKeep: string;
  topAchievements: string;
  careerStory: string;
  constraints: string;
  jobSearchPriorities: string;
  missingDetails: string;
  intakeStatus: 'draft' | 'ready';
};

const QUICK_PROMPTS = [
  'Interview me to uncover stronger achievements for this role.',
  'Find the weakest bullets in my resume and rewrite them more credibly.',
  'Tell me what a recruiter would still doubt after reading this resume.',
  'What would make this look more senior without exaggerating anything?',
];

const ARTIFACT_OPTIONS = [
  { key: 'positioning_summary', label: 'Positioning' },
  { key: 'recruiter_pitch', label: 'Recruiter Pitch' },
  { key: 'cover_letter', label: 'Cover Letter' },
  { key: 'linkedin_about', label: 'LinkedIn About' },
  { key: 'interview_story', label: 'Interview Story' },
] as const;

const defaultForm: CoachFormState = {
  targetRole: '',
  targetSeniority: 'Mid-level',
  tone: 'Professional and concise',
  focusArea: 'Impactful bullet points and quantified achievements',
  targetCompanies: '',
  mustKeep: '',
  topAchievements: '',
  careerStory: '',
  constraints: '',
  jobSearchPriorities: '',
  missingDetails: '',
  intakeStatus: 'draft',
};

function listToTextarea(values?: string[]) {
  return (values || []).join('\n');
}

function textareaToList(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapProfileToForm(profile: CoachResponse['coachProfile']): CoachFormState {
  if (!profile) {
    return defaultForm;
  }

  return {
    targetRole: profile.target_role || '',
    targetSeniority: profile.target_seniority || 'Mid-level',
    tone: profile.tone || 'Professional and concise',
    focusArea: profile.focus_area || 'Impactful bullet points and quantified achievements',
    targetCompanies: listToTextarea(profile.target_companies),
    mustKeep: listToTextarea(profile.must_keep),
    topAchievements: listToTextarea(profile.top_achievements),
    careerStory: profile.career_story || '',
    constraints: profile.constraints || '',
    jobSearchPriorities: listToTextarea(profile.job_search_priorities),
    missingDetails: listToTextarea(profile.missing_details),
    intakeStatus: profile.intake_status || 'draft',
  };
}

export function AnalysisCoachWorkspace({
  analysisId,
  initialJobTitle,
}: {
  analysisId: string;
  initialJobTitle: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState<CoachFormState>({
    ...defaultForm,
    targetRole: initialJobTitle || '',
  });
  const [messages, setMessages] = useState<AnalysisChatMessage[]>([]);
  const [versions, setVersions] = useState<AnalysisRewriteVersion[]>([]);
  const [packageVersions, setPackageVersions] = useState<AnalysisApplicationPackage[]>([]);
  const [latestPackage, setLatestPackage] = useState<AnalysisApplicationPackage | null>(null);
  const [intakeChecklist, setIntakeChecklist] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [selectedArtifact, setSelectedArtifact] = useState<(typeof ARTIFACT_OPTIONS)[number]['key']>('positioning_summary');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback((payload: CoachResponse) => {
    setMessages(payload.messages || []);
    setVersions(payload.versions || []);
    setPackageVersions(payload.packageVersions || []);
    setLatestPackage(payload.latestPackage || null);
    setIntakeChecklist(payload.intakeChecklist || []);

    if (payload.coachProfile) {
      setForm(mapProfileToForm(payload.coachProfile));
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat?analysisId=${encodeURIComponent(analysisId)}`);
      const payload: CoachResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load coach workspace');
      }

      hydrate(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load coach workspace');
    } finally {
      setIsLoading(false);
    }
  }, [analysisId, hydrate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const profilePayload = useMemo<AnalysisCoachProfileInput>(() => ({
    targetRole: form.targetRole,
    targetSeniority: form.targetSeniority,
    tone: form.tone,
    focusArea: form.focusArea,
    targetCompanies: textareaToList(form.targetCompanies),
    mustKeep: textareaToList(form.mustKeep),
    topAchievements: textareaToList(form.topAchievements),
    careerStory: form.careerStory,
    constraints: form.constraints,
    jobSearchPriorities: textareaToList(form.jobSearchPriorities),
    missingDetails: textareaToList(form.missingDetails),
    intakeStatus: form.intakeStatus,
  }), [form]);

  const updateField = <K extends keyof CoachFormState>(key: K, value: CoachFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = useCallback(async (intakeStatus?: 'draft' | 'ready') => {
    setIsSavingProfile(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          action: 'save_profile',
          profile: {
            ...profilePayload,
            intakeStatus: intakeStatus || form.intakeStatus,
          },
        }),
      });

      const payload: CoachResponse = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to save intake');
      }

      hydrate(payload);
      if (intakeStatus) {
        updateField('intakeStatus', intakeStatus);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save intake');
    } finally {
      setIsSavingProfile(false);
    }
  }, [analysisId, form.intakeStatus, hydrate, profilePayload]);

  const sendMessage = useCallback(async (action: 'chat' | 'generate_package' | 'regenerate') => {
    if (action === 'chat' && !input.trim()) {
      return;
    }

    if (action === 'chat') setIsSending(true);
    if (action === 'generate_package') setIsGeneratingPackage(true);
    if (action === 'regenerate') setIsGeneratingResume(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          action,
          message: input.trim() || undefined,
          profile: profilePayload,
          preferences: {
            tone: form.tone,
            focusArea: form.focusArea,
            seniority: form.targetSeniority,
          },
        }),
      });

      const payload: CoachResponse = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Request failed');
      }

      hydrate(payload);
      setInput('');

      if (action === 'regenerate') {
        router.push(`/analysis/${analysisId}/rewrite`);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Request failed');
    } finally {
      setIsSending(false);
      setIsGeneratingPackage(false);
      setIsGeneratingResume(false);
    }
  }, [analysisId, form.focusArea, form.targetSeniority, form.tone, hydrate, input, profilePayload, router]);

  const artifactContent = latestPackage?.content?.[selectedArtifact] || '';

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
      <div className="space-y-6">
        <Card className="overflow-hidden border-amber-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_36%),linear-gradient(180deg,_rgba(255,251,235,0.96),_rgba(255,255,255,1))] dark:border-amber-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.15),_transparent_35%),linear-gradient(180deg,_rgba(69,26,3,0.22),_rgba(10,10,10,0.08))]">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">
                    Resume copilot
                  </Badge>
                  <Badge variant="outline">{form.intakeStatus === 'ready' ? 'Ready to generate' : 'Intake in progress'}</Badge>
                </div>
                <CardTitle className="text-2xl sm:text-3xl">Coach Workspace</CardTitle>
                <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                  Capture the best facts about the candidate, coach the resume with context, then generate a full application kit and targeted resume draft from one place.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => saveProfile('ready')}
                  loading={isSavingProfile}
                  loadingText="Saving intake..."
                  className="w-full sm:w-auto"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Intake
                </Button>
                <Button
                  onClick={() => sendMessage('generate_package')}
                  loading={isGeneratingPackage}
                  loadingText="Building kit..."
                  className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Application Kit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Target role</label>
                  <input
                    value={form.targetRole}
                    onChange={(event) => updateField('targetRole', event.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Seniority</label>
                  <input
                    value={form.targetSeniority}
                    onChange={(event) => updateField('targetSeniority', event.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tone</label>
                  <input
                    value={form.tone}
                    onChange={(event) => updateField('tone', event.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Focus area</label>
                  <input
                    value={form.focusArea}
                    onChange={(event) => updateField('focusArea', event.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Top achievements to surface</label>
                <textarea
                  rows={5}
                  value={form.topAchievements}
                  onChange={(event) => updateField('topAchievements', event.target.value)}
                  placeholder="One achievement per line"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Career story</label>
                <textarea
                  rows={5}
                  value={form.careerStory}
                  onChange={(event) => updateField('careerStory', event.target.value)}
                  placeholder="What narrative should the resume communicate about growth, specialization, and direction?"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Target companies</label>
                <textarea
                  rows={3}
                  value={form.targetCompanies}
                  onChange={(event) => updateField('targetCompanies', event.target.value)}
                  placeholder="One company type or company name per line"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Must keep</label>
                <textarea
                  rows={3}
                  value={form.mustKeep}
                  onChange={(event) => updateField('mustKeep', event.target.value)}
                  placeholder="Technologies, industries, or facts that should remain prominent"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Job search priorities</label>
                <textarea
                  rows={3}
                  value={form.jobSearchPriorities}
                  onChange={(event) => updateField('jobSearchPriorities', event.target.value)}
                  placeholder="Remote, high-growth startups, better compensation, leadership, etc."
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Constraints or truth guardrails</label>
                <textarea
                  rows={3}
                  value={form.constraints}
                  onChange={(event) => updateField('constraints', event.target.value)}
                  placeholder="Anything the coach should avoid, soften, or be careful with"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Missing details to ask about</label>
                <textarea
                  rows={3}
                  value={form.missingDetails}
                  onChange={(event) => updateField('missingDetails', event.target.value)}
                  placeholder="Metrics, ownership, scope, outcomes, or timeline gaps"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                  Coach Conversation
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ask the AI to interrogate weak bullets, uncover stronger achievements, and challenge the resume like a recruiter would.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => sendMessage('regenerate')}
                  loading={isGeneratingResume}
                  loadingText="Generating draft..."
                  className="w-full sm:w-auto"
                >
                  <WandSparkles className="h-4 w-4 mr-2" />
                  Generate Resume Draft
                </Button>
                <Link href={`/analysis/${analysisId}/rewrite`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    Open Rewrite Page
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading coach workspace...
              </div>
            ) : (
              <>
                <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl border bg-muted/20 p-3">
                  {messages.length === 0 && (
                    <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                      Start with a high-value prompt or ask the coach to interview you for missing facts.
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl p-4 text-sm ${message.role === 'user'
                        ? 'border border-primary/20 bg-primary/10'
                        : 'border border-border bg-background'
                        }`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {message.role === 'user' ? <Send className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                        {message.role}
                      </div>
                      <p className="whitespace-pre-wrap leading-7">{message.content}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={5}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask the coach to interview you, pressure-test bullets, or sharpen the story this resume tells."
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                />

                {error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => sendMessage('chat')} loading={isSending} loadingText="Sending...">
                    <Send className="h-4 w-4 mr-2" />
                    Ask Coach
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 xl:sticky xl:top-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Readiness checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {intakeChecklist.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300">
                The intake looks strong enough to generate a high-quality targeted package.
              </div>
            ) : (
              intakeChecklist.map((item) => (
                <div key={item} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-600" />
                  <span>{item}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Latest application kit</CardTitle>
              {latestPackage && <Badge variant="secondary">v{latestPackage.version_number}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!latestPackage ? (
              <p className="text-sm text-muted-foreground">
                Generate an application kit to get recruiter messaging, LinkedIn copy, and an interview story built from this resume.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {ARTIFACT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSelectedArtifact(option.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedArtifact === option.key
                          ? 'bg-amber-600 text-white'
                          : 'border border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border bg-background p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {ARTIFACT_OPTIONS.find((option) => option.key === selectedArtifact)?.label}
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-7">{artifactContent}</div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    ATS keyword themes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {latestPackage.content.ats_keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Evidence map
                  </div>
                  <div className="space-y-2">
                    {latestPackage.content.evidence_map.slice(0, 6).map((entry, index) => (
                      <div key={`${entry.claim}-${index}`} className="rounded-xl border bg-background px-3 py-3 text-sm">
                        <div>{entry.claim}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{entry.source}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generation history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {packageVersions.length === 0 ? (
              <p className="text-muted-foreground">No application kit versions yet.</p>
            ) : (
              packageVersions.slice(0, 5).map((version) => (
                <div key={version.id} className="rounded-2xl border bg-muted/20 px-4 py-3">
                  <div className="font-medium">{version.package_name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Version {version.version_number} • {new Date(version.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}

            {versions.length > 0 && (
              <div className="rounded-2xl border bg-background px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Latest resume draft
                </div>
                <div className="mt-1 font-medium">Version {versions[0].version_number}</div>
                <div className="mt-1 text-xs text-muted-foreground">{new Date(versions[0].created_at).toLocaleString()}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
