import { Card, CardContent } from './ui/card';
import { EnhancedAnalysisResult } from './EnhancedAnalysisResult';
import type { EnhancedAnalysisResult as EnhancedAnalysisType } from '../types';

interface AnalysisData {
  id: string;
  created_at: string;
  job_title: string | null;
  job_description?: string | null;
  match_score: number | null;
  analysis_result: unknown;
  enhanced_analysis?: EnhancedAnalysisType | null;
}

// Helper function to safely extract array from unknown data
function safeExtractArray(data: unknown, key: string): string[] {
  if (!data || typeof data !== 'object') return [];
  
  const value = (data as Record<string, unknown>)[key];
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string');
  }
  return [];
}

// Legacy analysis result component
function LegacyAnalysisResult({ analysis }: { analysis: AnalysisData }) {
  const analysisResult = analysis.analysis_result;
  
  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let suggestions: string[] = [];
  let summary: string = '';
  let extractedSkills: string[] = [];

  // Handle string JSON
  if (typeof analysisResult === 'string') {
    try {
      const parsed = JSON.parse(analysisResult);
      strengths = safeExtractArray(parsed, 'strengths');
      weaknesses = safeExtractArray(parsed, 'weaknesses') || safeExtractArray(parsed, 'areasForImprovement');
      suggestions = safeExtractArray(parsed, 'suggestions');
      extractedSkills = safeExtractArray(parsed, 'extractedSkills');
      summary = typeof parsed.summary === 'string' ? parsed.summary : '';
    } catch (e) {
      console.error('Failed to parse analysis_result as JSON:', e);
    }
  }
  // Handle object
  else if (analysisResult && typeof analysisResult === 'object') {
    strengths = safeExtractArray(analysisResult, 'strengths');
    weaknesses = safeExtractArray(analysisResult, 'weaknesses') || safeExtractArray(analysisResult, 'areasForImprovement');
    suggestions = safeExtractArray(analysisResult, 'suggestions');
    extractedSkills = safeExtractArray(analysisResult, 'extractedSkills');
    summary = 'summary' in analysisResult && typeof (analysisResult as Record<string, unknown>).summary === 'string' 
      ? (analysisResult as Record<string, unknown>).summary as string
      : '';
  }

  // Get score color based on match score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const matchScore = analysis.match_score || 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Professional Summary</h3>
              <p className="text-muted-foreground">{summary || 'No summary available'}</p>
            </div>
            <div className="md:text-right">
              <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(matchScore)}`}>
                    {matchScore}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Match Score</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-in-out"
              style={{ 
                width: `${matchScore}%`, 
                background: matchScore >= 80 
                  ? 'linear-gradient(90deg, #10b981, #059669)' 
                  : matchScore >= 60 
                  ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                  : 'linear-gradient(90deg, #ef4444, #dc2626)'
              }}
            ></div>
          </div>
        </CardContent>
      </Card>
      
      {/* Strengths Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </span>
            Strengths
          </h3>
          <ul className="space-y-3">
            {strengths.length > 0 ? (
              strengths.map((s, i) => (
                <li key={i} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400 mr-2 mt-1 flex-shrink-0">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  <span>{s}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No strengths identified</li>
            )}
          </ul>
        </CardContent>
      </Card>
      
      {/* Weaknesses Card */}
      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
                <path d="M12 9v4M12 17h.01"/>
                <path d="M3.58 5.96A2 2 0 0 1 5.32 4h13.36a2 2 0 0 1 1.74 1.96l.77 12.42a2 2 0 0 1-2 2.12H4.81a2 2 0 0 1-2-2.12Z"/>
              </svg>
            </span>
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {weaknesses.length > 0 ? (
              weaknesses.map((w, i) => (
                <li key={i} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400 mr-2 mt-1 flex-shrink-0">
                    <path d="M12 9v4M12 17h.01"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  <span>{w}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No areas for improvement identified</li>
            )}
          </ul>
        </CardContent>
      </Card>
      
      {/* Suggestions Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                <circle cx="12" cy="12" r="10"/>
                <path d="m15 9-6 6M9 9l6 6"/>
              </svg>
            </span>
            Recommendations
          </h3>
          <ul className="space-y-3">
            {suggestions.length > 0 ? (
              suggestions.map((s, i) => (
                <li key={i} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 mr-2 mt-1 flex-shrink-0">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  <span>{s}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No recommendations provided</li>
            )}
          </ul>
        </CardContent>
      </Card>
      
      {/* Skills Card */}
      {extractedSkills.length > 0 && (
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </span>
              Extracted Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function AnalysisResult({ analysis }: { analysis: AnalysisData }) {
  // Use enhanced component if enhanced_analysis is available, otherwise fall back to legacy
  if (analysis.enhanced_analysis) {
    return <EnhancedAnalysisResult analysis={analysis} />;
  }
  
  return <LegacyAnalysisResult analysis={analysis} />;
}
