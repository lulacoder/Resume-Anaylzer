'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';
import { Progress } from '../ui';
import type { EnhancedAnalysisResult } from '../../types';

interface ScoreComparisonChartProps {
  detailedScores: EnhancedAnalysisResult['detailed_scores'];
  overallScore: number;
  className?: string;
}

interface ScoreData {
  category: string;
  score: number;
  benchmark: number;
  color: string;
}

export function ScoreComparisonChart({ detailedScores, overallScore, className }: ScoreComparisonChartProps) {
  const chartData = useMemo(() => {
    // Industry benchmarks (these could be dynamic based on actual data)
    const benchmarks = {
      skills_match: 75,
      experience_relevance: 70,
      education_fit: 65,
      keyword_optimization: 80,
    };

    const data: ScoreData[] = [
      {
        category: 'Skills Match',
        score: detailedScores.skills_match,
        benchmark: benchmarks.skills_match,
        color: detailedScores.skills_match >= benchmarks.skills_match ? '#10b981' : '#ef4444'
      },
      {
        category: 'Experience',
        score: detailedScores.experience_relevance,
        benchmark: benchmarks.experience_relevance,
        color: detailedScores.experience_relevance >= benchmarks.experience_relevance ? '#10b981' : '#ef4444'
      },
      {
        category: 'Education',
        score: detailedScores.education_fit,
        benchmark: benchmarks.education_fit,
        color: detailedScores.education_fit >= benchmarks.education_fit ? '#10b981' : '#ef4444'
      },
      {
        category: 'Keywords',
        score: detailedScores.keyword_optimization,
        benchmark: benchmarks.keyword_optimization,
        color: detailedScores.keyword_optimization >= benchmarks.keyword_optimization ? '#10b981' : '#ef4444'
      }
    ];

    return data;
  }, [detailedScores]);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
      payload: ScoreData;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Your Score: {data.score}%
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
              Industry Average: {data.benchmark}%
            </p>
            <p className="text-sm font-medium">
              {data.score >= data.benchmark ?
                `+${data.score - data.benchmark}% above average` :
                `${data.benchmark - data.score}% below average`
              }
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Score Breakdown & Comparison</CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Your performance vs industry benchmarks
          </p>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <div className="text-xs text-muted-foreground">
              {getScoreLabel(overallScore)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Score Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Match Score</span>
            <span className={`text-sm font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
          </div>
          <Progress value={overallScore} className="h-3" />
        </div>

        {/* Detailed Scores Chart */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="category"
                fontSize={12}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 100]}
                fontSize={12}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Benchmark bars (background) */}
              <Bar dataKey="benchmark" fill="#e5e7eb" name="benchmark" />

              {/* Score bars (foreground) */}
              <Bar dataKey="score" name="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {chartData.map((item, index) => {
            const difference = item.score - item.benchmark;
            const isAbove = difference >= 0;

            return (
              <div key={index} className="text-center p-3 rounded-lg bg-muted">
                <div className="text-sm font-medium text-foreground mb-1">
                  {item.category}
                </div>
                <div className={`text-xl font-bold ${getScoreColor(item.score)}`}>
                  {item.score}%
                </div>
                <div className={`text-xs ${isAbove ? 'text-green-600' : 'text-red-600'}`}>
                  {isAbove ? '+' : ''}{difference}% vs avg
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Insights */}
        <div className="mt-6 p-4 rounded-lg bg-muted">
          <h4 className="font-medium mb-2">Performance Insights</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {chartData.map((item, index) => {
              const difference = item.score - item.benchmark;
              const isAbove = difference >= 0;

              if (Math.abs(difference) < 5) return null; // Skip items close to benchmark

              return (
                <p key={index}>
                  <span className="font-medium text-foreground">{item.category}:</span>{' '}
                  {isAbove ? (
                    <>Strong performance, {difference}% above industry average</>
                  ) : (
                    <>Opportunity for improvement, {Math.abs(difference)}% below average</>
                  )}
                </p>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>• Colored bars show your scores in each category</p>
          <p>• Gray bars represent industry benchmark averages</p>
          <p>• Green indicates above-average performance, red indicates below-average</p>
        </div>
      </CardContent>
    </Card>
  );
}