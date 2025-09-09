'use client';

import { useMemo } from 'react';

interface ExperienceItem {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  skills: string[];
  relevanceScore: number;
}

interface ExperienceTimelineProps {
  experiences: ExperienceItem[];
  className?: string;
}

export function ExperienceTimeline({ experiences, className = '' }: ExperienceTimelineProps) {
  const sortedExperiences = useMemo(() => {
    return [...experiences].sort((a, b) => {
      const aDate = new Date(a.startDate);
      const bDate = new Date(b.startDate);
      return bDate.getTime() - aDate.getTime();
    });
  }, [experiences]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRelevanceText = (score: number) => {
    if (score >= 80) return 'High Relevance';
    if (score >= 60) return 'Medium Relevance';
    return 'Low Relevance';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Experience Timeline
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your work history with relevance scoring
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
        
        <div className="space-y-8">
          {sortedExperiences.map((experience, index) => (
            <div key={index} className="relative flex items-start">
              {/* Timeline dot */}
              <div className={`absolute left-2 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 ${getRelevanceColor(experience.relevanceScore)}`}></div>
              
              {/* Content */}
              <div className="ml-12 flex-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {experience.title}
                      </h4>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {experience.company}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        experience.relevanceScore >= 80 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : experience.relevanceScore >= 60
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {experience.relevanceScore}% {getRelevanceText(experience.relevanceScore)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {formatDate(experience.startDate)} - {
                      experience.endDate ? formatDate(experience.endDate) : 'Present'
                    }
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                    {experience.description}
                  </p>
                  
                  {experience.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {experience.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {sortedExperiences.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No experience data available
        </div>
      )}
    </div>
  );
}