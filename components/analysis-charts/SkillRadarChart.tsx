'use client';

import { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

interface SkillData {
  skill: string;
  userLevel: number;
  requiredLevel: number;
  category: string;
}

interface SkillRadarChartProps {
  skills: SkillData[];
  className?: string;
}

export function SkillRadarChart({ skills, className = '' }: SkillRadarChartProps) {
  const chartData = useMemo(() => {
    return skills.map(skill => ({
      skill: skill.skill.length > 12 
        ? `${skill.skill.substring(0, 12)}...` 
        : skill.skill,
      fullSkill: skill.skill,
      userLevel: skill.userLevel,
      requiredLevel: skill.requiredLevel,
      gap: Math.max(0, skill.requiredLevel - skill.userLevel),
      category: skill.category
    }));
  }, [skills]);

  const maxValue = Math.max(
    ...skills.flatMap(s => [s.userLevel, s.requiredLevel]),
    10
  );

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Skills Analysis
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your skills vs job requirements
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
          <PolarGrid className="stroke-gray-300 dark:stroke-gray-600" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-gray-600 dark:text-gray-400"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, maxValue]}
            tick={{ fontSize: 10, fill: 'currentColor' }}
            className="text-gray-500 dark:text-gray-500"
          />
          <Radar
            name="Your Level"
            dataKey="userLevel"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Required Level"
            dataKey="requiredLevel"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              fontSize: '14px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Skill Gaps</h4>
        <div className="grid gap-2 max-h-32 overflow-y-auto">
          {chartData
            .filter(skill => skill.gap > 0)
            .sort((a, b) => b.gap - a.gap)
            .map((skill, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {skill.fullSkill}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ({skill.category})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400">
                    {skill.userLevel}
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-red-600 dark:text-red-400">
                    {skill.requiredLevel}
                  </span>
                  <div className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                    Gap: {skill.gap}
                  </div>
                </div>
              </div>
            ))}
        </div>
        
        {chartData.filter(skill => skill.gap > 0).length === 0 && (
          <p className="text-sm text-green-600 dark:text-green-400 italic">
            Great! You meet or exceed all required skill levels.
          </p>
        )}
      </div>
    </div>
  );
}