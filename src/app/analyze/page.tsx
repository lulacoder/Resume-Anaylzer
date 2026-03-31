'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DynamicAnalysisResult } from '@/lib/dynamic-imports';
import { useRef, useState, Suspense } from 'react';
import { AnalysisSpinner } from '@/components/ui/spinner';
import { SlideUpTransition } from '@/components/ui/Transition';
import { parsePdf } from '@/lib/parsePdf';
import type { EnhancedAnalysisResult } from '@/types/index';
import { FileText, Upload, Sparkles, Target, Shield, X, CheckCircle, AlertCircle, ArrowUp } from 'lucide-react';

type AnalysisRecord = {
  id: string;
  created_at: string;
  job_title: string | null;
  match_score: number | null;
  analysis_result: unknown;
  enhanced_analysis?: EnhancedAnalysisResult | null;
};

type StreamEvent =
  | { type: 'stage'; stage: 'validating' | 'uploading' | 'saving' | 'analyzing' | 'finalizing' }
  | { type: 'partial'; data: Partial<EnhancedAnalysisResult> }
  | { type: 'complete'; analysis: AnalysisRecord }
  | { type: 'error'; error: string };

const STAGE_LABELS: Record<string, string> = {
  validating: 'Validating and extracting resume text...',
  uploading: 'Uploading resume...',
  saving: 'Saving resume details...',
  analyzing: 'Running AI analysis...',
  finalizing: 'Finalizing analysis report...',
};

export default function AnalyzePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [stage, setStage] = useState<string>('');
  const [partialAnalysis, setPartialAnalysis] = useState<Partial<EnhancedAnalysisResult> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError('File size must be less than 5MB');
        setFileName(null);
        e.target.value = '';
      } else if (file.type !== 'application/pdf') {
        setFileError('Please upload a PDF file');
        setFileName(null);
        e.target.value = '';
      } else {
        setFileError(null);
        setFileName(file.name);
      }
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setFileError('File size must be less than 5MB');
        setFileName(null);
      } else if (file.type !== 'application/pdf') {
        setFileError('Please upload a PDF file');
        setFileName(null);
      } else {
        setFileError(null);
        setFileName(file.name);

        const fileInput = document.getElementById('resume') as HTMLInputElement;
        if (fileInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
        }
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setMessage('');
    setAnalysis(null);
    setPartialAnalysis(null);
    setFileError(null);

    const formData = new FormData(event.currentTarget);
    const resumeFile = formData.get('resume');

    if (!(resumeFile instanceof File)) {
      setError('Resume file is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      setStage('validating');

      const fileBuffer = await resumeFile.arrayBuffer();
      const extractedText = await parsePdf(fileBuffer);
      if (!extractedText || extractedText.length < 10) {
        setError('Could not extract meaningful text from PDF. Please ensure the file contains selectable text.');
        return;
      }

      formData.set('resumeText', extractedText);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = 'Analysis request failed.';

        try {
          const parsed = JSON.parse(responseText) as { error?: string };
          errorMessage = parsed.error || errorMessage;
        } catch {
          if (responseText) {
            errorMessage = responseText;
          }
        }

        setError(errorMessage);
        return;
      }

      if (!response.body) {
        setError('Streaming response was not available. Please try again.');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffered = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffered += decoder.decode(value, { stream: true });
        const lines = buffered.split('\n');
        buffered = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const payload = JSON.parse(line) as StreamEvent;

          if (payload.type === 'stage') {
            setStage(payload.stage);
          }

          if (payload.type === 'partial') {
            setPartialAnalysis(payload.data || null);
          }

          if (payload.type === 'complete') {
            setAnalysis(payload.analysis);
            setMessage('Analysis complete');
            setStage('');
          }

          if (payload.type === 'error') {
            setError(payload.error);
            setStage('');
          }
        }
      }
    } catch (submissionError) {
      if (submissionError instanceof DOMException && submissionError.name === 'AbortError') {
        return;
      }

      console.error('Analyze submission error:', submissionError);
      const message = submissionError instanceof Error
        ? submissionError.message
        : 'Failed to process the uploaded PDF. Please try another file.';

      setStage('');
      setError(message || 'Failed to process the uploaded PDF. Please try another file.');
    } finally {
      abortControllerRef.current = null;
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsSubmitting(false);
    setStage('');
    setError('Analysis cancelled.');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header section */}
      <div className="border-b border-border bg-muted/30">
        <div className="section-container py-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Resume Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your resume and job description to get AI-powered insights and improve your chances of landing your dream job.
          </p>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Main form card */}
        <Card className="max-w-3xl mx-auto">
          <div className="p-6 sm:p-8">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div className="space-y-2">
                <label htmlFor="resume" className="form-label">
                  Upload Resume
                </label>
                <div
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                    ${dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }
                    ${fileError ? 'border-destructive bg-destructive/5' : ''}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('resume')?.click()}
                >
                  <input
                    id="resume"
                    name="resume"
                    type="file"
                    accept=".pdf"
                    required
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className={`p-3 rounded-full ${fileName ? 'bg-primary/10' : 'bg-muted'}`}>
                      {fileName ? (
                        <FileText className="w-8 h-8 text-primary" />
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>

                    {fileName ? (
                      <div className="text-center">
                        <p className="font-medium text-foreground">{fileName}</p>
                        <p className="text-sm text-muted-foreground mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="font-medium text-foreground">Drag & drop your PDF resume here</p>
                        <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-2">PDF format, max 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {fileError && (
                  <div className="flex items-center text-destructive text-sm mt-2">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {fileError}
                  </div>
                )}
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <label htmlFor="jobTitle" className="form-label">
                  Job Title
                </label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  placeholder="e.g. Software Engineer, Product Manager"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <label htmlFor="jobDescription" className="form-label">
                  Job Description
                </label>
                <div className="relative">
                  <textarea
                    id="jobDescription"
                    name="jobDescription"
                    rows={8}
                    placeholder="Paste the job description here..."
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !!fileError}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      <span>{STAGE_LABELS[stage] || 'Analyzing...'}</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze Resume
                    </>
                  )}
                </Button>
                
                {isSubmitting && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Analysis
                  </Button>
                )}
              </div>
            </form>
          </div>
        </Card>

        {/* Features Section */}
        {!analysis && !isSubmitting && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="feature-card text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI-Powered Analysis</h3>
              <p className="text-muted-foreground text-sm">Advanced AI analyzes your resume against job requirements</p>
            </div>

            <div className="feature-card text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Match Scoring</h3>
              <p className="text-muted-foreground text-sm">See how well your resume matches the job</p>
            </div>

            <div className="feature-card text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Actionable Feedback</h3>
              <p className="text-muted-foreground text-sm">Get specific recommendations to improve</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        <SlideUpTransition show={!!message}>
          <div className="mt-6 max-w-3xl mx-auto alert-success flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        </SlideUpTransition>

        {/* Error Message */}
        <SlideUpTransition show={!!error}>
          <div className="mt-6 max-w-3xl mx-auto alert-error flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-medium">Analysis Error</span>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          </div>
        </SlideUpTransition>

        {/* Partial Analysis Preview */}
        <SlideUpTransition show={isSubmitting && !!partialAnalysis}>
          <div className="mt-6 max-w-3xl mx-auto">
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-3">Live Analysis Preview</h3>
              <div className="space-y-2 text-sm">
                {typeof partialAnalysis?.overall_score === 'number' && (
                  <p className="text-muted-foreground">
                    Current Match Score: <span className="font-semibold text-primary">{partialAnalysis.overall_score}%</span>
                  </p>
                )}
                {partialAnalysis?.summary && <p className="text-muted-foreground">{partialAnalysis.summary}</p>}
                {partialAnalysis?.analysis_metadata?.confidence_score !== undefined && (
                  <p className="text-muted-foreground">
                    Confidence: {partialAnalysis.analysis_metadata.confidence_score}%
                  </p>
                )}
              </div>
            </Card>
          </div>
        </SlideUpTransition>

        {/* Analysis Results */}
        <SlideUpTransition show={!!analysis}>
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
              <Button
                variant="outline"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                size="sm"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Back to Top
              </Button>
            </div>

            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-16">
                <AnalysisSpinner />
                <p className="mt-4 text-muted-foreground">Preparing your analysis results...</p>
              </div>
            }>
              {analysis && <DynamicAnalysisResult analysis={analysis} />}
            </Suspense>
          </div>
        </SlideUpTransition>
      </div>
    </div>
  );
}
