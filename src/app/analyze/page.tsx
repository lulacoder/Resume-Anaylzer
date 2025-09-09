'use client';

import { useActionState } from 'react';
import { analyzeResumeAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DynamicAnalysisResult } from '@/lib/dynamic-imports';
import { useState, Suspense } from 'react';
import { AnalysisSpinner } from '@/components/ui/spinner';
import { SlideUpTransition } from '@/components/ui/Transition';

const initialState = {
  message: '',
  error: undefined,
  analysis: null,
};

export default function AnalyzePage() {
  const [state, formAction] = useActionState(analyzeResumeAction, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
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

        // Update the file input
        const fileInput = document.getElementById('resume') as HTMLInputElement;
        if (fileInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
        }
      }
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setFileError(null);
    try {
      await formAction(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatError = (error: string | Record<string, string[] | undefined> | undefined) => {
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
      return Object.values(error).flat().filter(Boolean).join(', ');
    }
    return 'An unexpected error occurred';
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Resume Analyzer
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload your resume and job description to get AI-powered insights and improve your chances of landing your dream job.
        </p>
      </div>

      <Card className="border-t-4 border-t-primary shadow-lg">
        <div className="p-6 md:p-8">
          <form action={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-2">
              <label htmlFor="resume" className="block text-base font-medium">
                Upload Resume
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600'
                  } ${fileError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
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
                  <div className="p-3 rounded-full bg-primary/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M12 18v-6" />
                      <path d="m9 15 3-3 3 3" />
                    </svg>
                  </div>

                  {fileName ? (
                    <div className="text-center">
                      <p className="font-medium text-primary">{fileName}</p>
                      <p className="text-sm text-muted-foreground mt-1">File selected</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-medium">Drag & drop your PDF resume here</p>
                      <p className="text-sm text-muted-foreground mt-1">or</p>
                      <label htmlFor="resume" className="mt-2 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 cursor-pointer">
                        Browse Files
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">PDF format, max 5MB</p>
                    </div>
                  )}
                </div>
              </div>
              {fileError && (
                <div className="flex items-center text-red-600 text-sm mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {fileError}
                </div>
              )}
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <label htmlFor="jobTitle" className="block text-base font-medium">
                Job Title <span className="text-sm text-muted-foreground">(Optional)</span>
              </label>
              <Input
                id="jobTitle"
                name="jobTitle"
                type="text"
                placeholder="e.g. Software Engineer, Product Manager"
                disabled={isSubmitting}
                className="h-12"
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label htmlFor="jobDescription" className="block text-base font-medium">
                Job Description
              </label>
              <div className="relative">
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  rows={8}
                  placeholder="Paste the job description here..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                ></textarea>
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                    <path d="M9 9l1 0" />
                    <path d="M9 13l6 0" />
                    <path d="M9 17l6 0" />
                  </svg>
                  Required
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !!fileError}
                className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
                    <span>Analyzing Resume...</span>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0" />
                      <path d="M12 2v10l5 5" />
                    </svg>
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Features Section */}
      {!state.analysis && !isSubmitting && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                <path d="M20 22h-2" />
                <path d="M20 15v2h-2" />
                <path d="M4 15v2h2" />
                <path d="M4 22h2" />
                <path d="M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8Z" />
                <path d="M9 22v-4h6v4" />
                <path d="M12 6v4" />
                <path d="M10 10h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-muted-foreground text-sm">Our advanced AI analyzes your resume against job requirements to provide detailed insights.</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Match Scoring</h3>
            <p className="text-muted-foreground text-sm">Get precise match scores showing how well your resume aligns with job requirements.</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M5 8V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2h-5" />
                <path d="M5 10a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Actionable Feedback</h3>
            <p className="text-muted-foreground text-sm">Receive specific recommendations to improve your resume and boost your chances.</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      <SlideUpTransition show={!!state.message}>
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">{state.message}</p>
            </div>
          </div>
        </div>
      </SlideUpTransition>

      {/* Error Message */}
      <SlideUpTransition show={!!state.error}>
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Analysis Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{formatError(state.error)}</p>
              </div>
            </div>
          </div>
        </div>
      </SlideUpTransition>

      {/* Analysis Results */}
      <SlideUpTransition show={!!state.analysis}>
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Analysis Results
            </h2>
            <Button
              variant="outline"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              size="sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
              Back to Top
            </Button>
          </div>

          <div className="relative">
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-16">
                <AnalysisSpinner />
                <p className="mt-4 text-muted-foreground">Preparing your analysis results...</p>
              </div>
            }>
              {state.analysis && <DynamicAnalysisResult analysis={state.analysis} />}
            </Suspense>
          </div>
        </div>
      </SlideUpTransition>
    </div>
  );
}
