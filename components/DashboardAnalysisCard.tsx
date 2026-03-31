import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from './ui';
import Link from 'next/link';
import { Target, Award, TrendingUp, Clock, Star, ArrowRight, Sparkles } from 'lucide-react';
import type { EnhancedAnalysisResult } from '../types';

interface DashboardAnalysis {
  id: string;
  created_at: string;
  job_title: string | null;
  match_score: number | null;
  enhanced_analysis?: EnhancedAnalysisResult | null;
}

export function DashboardAnalysisCard({ analysis }: { analysis: DashboardAnalysis }) {
  const formattedDate = new Date(analysis.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const enhancedData = analysis.enhanced_analysis;

  const overallScore = enhancedData?.overall_score ?? analysis.match_score ?? 0;
  const hasEnhancedData = !!enhancedData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return "score-excellent";
    if (score >= 60) return "score-good";
    return "score-needs-work";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  return (
    <Card className="card-interactive">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground truncate">
              {analysis.job_title || 'Untitled Analysis'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {formattedDate}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {hasEnhancedData && enhancedData.analysis_metadata.industry_detected && (
                <Badge variant="secondary" className="text-xs">
                  {enhancedData.analysis_metadata.industry_detected}
                </Badge>
              )}
              {hasEnhancedData && (
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enhanced
                </Badge>
              )}
            </div>
          </div>
          
          {/* Score display */}
          <div className="text-right flex-shrink-0">
            <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <Badge className={`mt-1 ${getScoreBadgeClass(overallScore)}`}>
              {getScoreLabel(overallScore)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getScoreBg(overallScore)}`}
              style={{ width: `${overallScore}%` }}
            ></div>
          </div>
        </div>

        {/* Enhanced Data Preview */}
        {hasEnhancedData && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{enhancedData.detailed_scores.skills_match}%</div>
                <div className="text-muted-foreground text-xs">Skills Match</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{enhancedData.detailed_scores.experience_relevance}%</div>
                <div className="text-muted-foreground text-xs">Experience</div>
              </div>
            </div>
          </div>
        )}

        {/* Key Insights */}
        {hasEnhancedData && (
          <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-primary" />
                <span><span className="text-foreground font-medium">{enhancedData.present_skills.length}</span> skills found</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span><span className="text-foreground font-medium">{enhancedData.priority_actions.length}</span> actions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span><span className="text-foreground font-medium">{enhancedData.analysis_metadata.confidence_score}%</span> confidence</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <Link href={`/analysis/${analysis.id}`}>
            <Button variant="outline" size="sm" className="group">
              View Details
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
