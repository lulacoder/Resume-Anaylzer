'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IndustryData {
    industry: string;
    averageScore: number;
    userScore: number;
    count: number;
}

interface IndustryComparisonChartProps {
    data: IndustryData[];
    userScore: number;
    className?: string;
}

export function IndustryComparisonChart({
    data,
    userScore,
    className = ''
}: IndustryComparisonChartProps) {
    const chartData = useMemo(() => {
        return data.map(item => ({
            ...item,
            industry: item.industry.length > 15
                ? `${item.industry.substring(0, 15)}...`
                : item.industry,
            isUserAboveAverage: userScore > item.averageScore
        }));
    }, [data, userScore]);

    const getBarColor = (averageScore: number) => {
        if (userScore > averageScore) return '#10b981'; // green-500
        if (userScore === averageScore) return '#f59e0b'; // amber-500
        return '#ef4444'; // red-500
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Industry Comparison
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your score vs industry averages
                </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                        dataKey="industry"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                        className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis
                        domain={[0, 100]}
                        fontSize={12}
                        className="text-gray-600 dark:text-gray-400"
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {data.industry}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Average Score: {data.averageScore.toFixed(1)}%
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Your Score: {userScore}%
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Sample Size: {data.count} resumes
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="averageScore" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getBarColor(entry.averageScore)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Above Average</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">At Average</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Below Average</span>
                </div>
            </div>
        </div>
    );
}