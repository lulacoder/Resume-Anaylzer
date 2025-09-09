import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from './ui';
import Link from 'next/link';
import { Target, Award, TrendingUp, Clock, Star } from 'lucide-react';
import type { EnhancedAnalysisResult } from '../types';

interface DashboardAnalysis {
  id: string;
  created_at: string;
  job_title: string | null;
  match_score: number | null;
  enhanced_analysis?: EnhancedAnalysisResult | null;
}

export function DashboardAnalysisCard({ analysis }: { analysis: DashboardAnalysis }) {
  const formattedDate = new Date(analysis.created_at).toLocaleDateString();
  const enhancedData = analysis.enhanced_analysis;

  // Use enhanced data if available, otherwise fall back to legacy data
  const overallScore = enhancedData?.overall_score ?? analysis.match_score ?? 0;
  const hasEnhancedData = !!enhancedData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-300 border-l-4 overflow-hidden" 
         style={{ borderLeftColor: overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444' }}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold">
              {analysis.job_title || 'Untitled Analysis'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1 inline" />
              Analyzed on {formattedDate}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {hasEnhancedData && enhancedData.analysis_metadata.industry_detected && (
                <Badge variant="outline" className="text-xs">
                  {enhancedData.analysis_metadata.industry_detected}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`} style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {overallScore}%
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <Badge variant={getScoreBadgeVariant(overallScore)} className="text-xs">
                {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
              {hasEnhancedData && (
                <Badge variant="secondary" className="text-xs">
                  Enhanced
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-in-out"
              style={{ 
                width: `${overallScore}%`, 
                background: overallScore >= 80 
                  ? 'linear-gradient(90deg, #10b981, #059669)' 
                  : overallScore >= 60 
                  ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                  : 'linear-gradient(90deg, #ef4444, #dc2626)'
              }}
            ></div>
          </div>
        </div>

        {/* Enhanced Data Preview */}
        {hasEnhancedData && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xs">
                <div className="font-medium text-sm">{enhancedData.detailed_scores.skills_match}%</div>
                <div className="text-muted-foreground">Skills Match</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-xs">
                <div className="font-medium text-sm">{enhancedData.detailed_scores.experience_relevance}%</div>
                <div className="text-muted-foreground">Experience</div>
              </div>
            </div>
          </div>
        )}

        {/* Key Insights */}
        {hasEnhancedData && (
          <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-muted">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="p-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Star className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span>{enhancedData.present_skills.length} skills</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <span>{enhancedData.priority_actions.length} actions</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span>{enhancedData.analysis_metadata.confidence_score}% confidence</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <Link href={`/analysis/${analysis.id}`} className="w-full md:w-auto">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full md:w-auto shadow-sm hover:shadow-md transition-all"
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}