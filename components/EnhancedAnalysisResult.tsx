"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Target, Award, BookOpen, Lightbulb, Clock, Star } from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Badge,
    Progress,
    cn
} from "./ui"
import type { EnhancedAnalysisResult } from "../types"

interface EnhancedAnalysisResultProps {
    analysis: {
        id: string
        created_at: string
        job_title: string | null
        job_description?: string | null
        match_score: number | null
        enhanced_analysis?: EnhancedAnalysisResult | null
    }
}

// Score visualization component
function ScoreCard({
    title,
    score,
    icon: Icon,
    description,
    variant = "default"
}: {
    title: string
    score: number
    icon: React.ComponentType<{ className?: string }>
    description?: string
    variant?: "default" | "primary" | "success" | "warning" | "danger"
}) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 dark:text-green-400"
        if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
        return "text-red-600 dark:text-red-400"
    }

    const getProgressColor = (score: number) => {
        if (score >= 80) return "bg-green-500"
        if (score >= 60) return "bg-yellow-500"
        return "bg-red-500"
    }

    const getVariantStyles = () => {
        switch (variant) {
            case "primary":
                return "border-blue-200 dark:border-blue-800";
            case "success":
                return "border-green-200 dark:border-green-800";
            case "warning":
                return "border-yellow-200 dark:border-yellow-800";
            case "danger":
                return "border-red-200 dark:border-red-800";
            default:
                return "";
        }
    }

    return (
        <Card variant="outlined" className={`p-4 ${getVariantStyles()}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${variant === "primary" ? "bg-blue-100 dark:bg-blue-900/30" :
                        variant === "success" ? "bg-green-100 dark:bg-green-900/30" :
                            variant === "warning" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                                variant === "danger" ? "bg-red-100 dark:bg-red-900/30" :
                                    "bg-primary/10"
                    }`}>
                    <Icon className={`h-5 w-5 ${variant === "primary" ? "text-blue-600 dark:text-blue-400" :
                            variant === "success" ? "text-green-600 dark:text-green-400" :
                                variant === "warning" ? "text-yellow-600 dark:text-yellow-400" :
                                    variant === "danger" ? "text-red-600 dark:text-red-400" :
                                        "text-primary"
                        }`} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{title}</h4>
                        <span className={cn("font-bold text-lg", getScoreColor(score))}>
                            {score}%
                        </span>
                    </div>
                    <Progress
                        value={score}
                        className="mt-2 h-2"
                        style={{
                            '--progress-bg': getProgressColor(score)
                        } as React.CSSProperties}
                    />
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
            </div>
        </Card>
    )
}

// Expandable section component
function ExpandableSection({
    title,
    children,
    defaultExpanded = false,
    icon: Icon,
    badge
}: {
    title: string
    children: React.ReactNode
    defaultExpanded?: boolean
    icon?: React.ComponentType<{ className?: string }>
    badge?: string | number
}) {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

    return (
        <Card variant="outlined">
            <CardHeader className="pb-3">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
                >
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                        <CardTitle className="text-base">{title}</CardTitle>
                        {badge && (
                            <Badge variant="secondary" className="ml-2">
                                {badge}
                            </Badge>
                        )}
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>
            </CardHeader>
            {isExpanded && (
                <CardContent className="pt-0">
                    {children}
                </CardContent>
            )}
        </Card>
    )
}

// Skills visualization component
function SkillsVisualization({
    presentSkills,
    missingSkills
}: {
    presentSkills: EnhancedAnalysisResult['present_skills']
    missingSkills: EnhancedAnalysisResult['missing_skills']
}) {
    const getCategoryColor = (category: string) => {
        const colors = {
            technical: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
            soft: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
            industry: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
            language: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
            certification: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        }
        return colors[category as keyof typeof colors] || colors.technical
    }

    const getProficiencyIcon = (proficiency?: string) => {
        switch (proficiency) {
            case 'expert': return <Star className="h-3 w-3 fill-current" />
            case 'advanced': return <Star className="h-3 w-3" />
            case 'intermediate': return <Target className="h-3 w-3" />
            case 'beginner': return <BookOpen className="h-3 w-3" />
            default: return null
        }
    }

    return (
        <div className="space-y-6">
            {/* Present Skills */}
            <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Present Skills ({presentSkills.length})
                </h4>
                <div className="grid gap-2">
                    {presentSkills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-2">
                                <Badge className={getCategoryColor(skill.category)}>
                                    {skill.category}
                                </Badge>
                                <span className="font-medium">{skill.name}</span>
                                {skill.proficiency && getProficiencyIcon(skill.proficiency)}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">
                                    Importance: {skill.importance}/10
                                </div>
                                <div className="w-16">
                                    <Progress value={skill.importance * 10} className="h-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Missing Skills */}
            {missingSkills.length > 0 && (
                <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Missing Skills ({missingSkills.length})
                    </h4>
                    <div className="grid gap-2">
                        {missingSkills.map((skill, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2">
                                    <Badge className={getCategoryColor(skill.category)}>
                                        {skill.category}
                                    </Badge>
                                    <span className="font-medium">{skill.name}</span>
                                    <Badge
                                        variant={skill.priority === 'high' ? 'destructive' : skill.priority === 'medium' ? 'default' : 'secondary'}
                                        className="text-xs"
                                    >
                                        {skill.priority}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xs text-muted-foreground">
                                        Importance: {skill.importance}/10
                                    </div>
                                    <div className="w-16">
                                        <Progress value={skill.importance * 10} className="h-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// Priority actions component
function PriorityActions({ actions }: { actions: EnhancedAnalysisResult['priority_actions'] }) {
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'immediate': return <Clock className="h-4 w-4 text-red-600" />
            case 'short_term': return <Target className="h-4 w-4 text-yellow-600" />
            case 'long_term': return <TrendingUp className="h-4 w-4 text-green-600" />
            default: return <Lightbulb className="h-4 w-4" />
        }
    }

    const sortedActions = [...actions].sort((a, b) => b.priority - a.priority)

    return (
        <div className="space-y-3">
            {sortedActions.map((action, index) => (
                <Card key={index} variant="outlined" className="p-4">
                    <div className="flex items-start gap-3">
                        {getCategoryIcon(action.category)}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{action.title}</h4>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                        Priority: {action.priority}/10
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        Impact: {action.estimated_impact}/10
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Time: {action.time_investment}</span>
                                <span>Category: {action.category.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export function EnhancedAnalysisResult({ analysis }: EnhancedAnalysisResultProps) {
    const enhancedData = analysis.enhanced_analysis

    if (!enhancedData) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-muted-foreground">No enhanced analysis data available.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card variant="elevated">
                <CardHeader>
                    <CardTitle className="text-xl">
                        {analysis.job_title || 'Resume Analysis'}
                    </CardTitle>
                    <CardDescription>
                        Analyzed on {new Date(analysis.created_at).toLocaleDateString()} •
                        Confidence: {enhancedData.analysis_metadata.confidence_score}%
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <h3 className="font-medium mb-2">Executive Summary</h3>
                        <p className="text-sm text-muted-foreground">{enhancedData.summary}</p>
                    </div>

                    {/* Overall Score */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">
                                {enhancedData.overall_score}%
                            </div>
                            <div className="text-xs text-muted-foreground">Overall Match</div>
                        </div>
                        <div className="flex-1">
                            <Progress value={enhancedData.overall_score} className="h-3" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ScoreCard
                    title="Skills Match"
                    score={enhancedData.detailed_scores.skills_match}
                    icon={Target}
                    description="Technical & soft skills alignment"
                    variant="primary"
                />
                <ScoreCard
                    title="Experience"
                    score={enhancedData.detailed_scores.experience_relevance}
                    icon={Award}
                    description="Relevant work experience"
                    variant="success"
                />
                <ScoreCard
                    title="Education"
                    score={enhancedData.detailed_scores.education_fit}
                    icon={BookOpen}
                    description="Educational background fit"
                    variant="warning"
                />
                <ScoreCard
                    title="Keywords"
                    score={enhancedData.detailed_scores.keyword_optimization}
                    icon={TrendingUp}
                    description="Resume optimization score"
                    variant={enhancedData.detailed_scores.keyword_optimization >= 70 ? "success" : "danger"}
                />
            </div>

            {/* Skills Analysis */}
            <ExpandableSection
                title="Skills Analysis"
                icon={Target}
                badge={`${enhancedData.present_skills.length} present, ${enhancedData.missing_skills.length} missing`}
                defaultExpanded={true}
            >
                <SkillsVisualization
                    presentSkills={enhancedData.present_skills}
                    missingSkills={enhancedData.missing_skills}
                />
            </ExpandableSection>

            {/* Experience Analysis */}
            <ExpandableSection
                title="Experience Analysis"
                icon={Award}
                badge={`${enhancedData.experience_analysis.relevant_years || 0} relevant years`}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 rounded-lg bg-muted">
                            <div className="text-lg font-bold">{enhancedData.experience_analysis.total_years || 0}</div>
                            <div className="text-xs text-muted-foreground">Total Years</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                            <div className="text-lg font-bold">{enhancedData.experience_analysis.relevant_years || 0}</div>
                            <div className="text-xs text-muted-foreground">Relevant Years</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                            <div className="text-lg font-bold">{enhancedData.experience_analysis.role_alignment}%</div>
                            <div className="text-xs text-muted-foreground">Role Alignment</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                            <Badge variant={
                                enhancedData.experience_analysis.career_progression === 'excellent' ? 'default' :
                                    enhancedData.experience_analysis.career_progression === 'good' ? 'secondary' :
                                        'outline'
                            }>
                                {enhancedData.experience_analysis.career_progression}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">Progression</div>
                        </div>
                    </div>

                    {enhancedData.experience_analysis.achievements.length > 0 && (
                        <div>
                            <h4 className="font-medium text-sm mb-2">Key Achievements</h4>
                            <ul className="space-y-1">
                                {enhancedData.experience_analysis.achievements.map((achievement, index) => (
                                    <li key={index} className="text-sm flex items-start gap-2">
                                        <Award className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                        {achievement}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {enhancedData.experience_analysis.gaps.length > 0 && (
                        <div>
                            <h4 className="font-medium text-sm mb-2">Experience Gaps</h4>
                            <ul className="space-y-1">
                                {enhancedData.experience_analysis.gaps.map((gap, index) => (
                                    <li key={index} className="text-sm flex items-start gap-2">
                                        <TrendingDown className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                                        {gap}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </ExpandableSection>

            {/* Priority Actions */}
            <ExpandableSection
                title="Priority Actions"
                icon={Lightbulb}
                badge={enhancedData.priority_actions.length}
                defaultExpanded={true}
            >
                <PriorityActions actions={enhancedData.priority_actions} />
            </ExpandableSection>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpandableSection
                    title="Strengths"
                    icon={TrendingUp}
                    badge={enhancedData.strengths.length}
                >
                    <div className="space-y-3">
                        {enhancedData.strengths.map((strength, index) => (
                            <Card key={index} variant="outlined" className="p-3 border-green-200 dark:border-green-800">
                                <div className="flex items-start gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{strength.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{strength.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {strength.category}
                                            </Badge>
                                            <Badge
                                                variant={strength.impact === 'high' ? 'default' : strength.impact === 'medium' ? 'secondary' : 'outline'}
                                                className="text-xs"
                                            >
                                                {strength.impact} impact
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </ExpandableSection>

                <ExpandableSection
                    title="Areas for Improvement"
                    icon={TrendingDown}
                    badge={enhancedData.improvements.length}
                >
                    <div className="space-y-3">
                        {enhancedData.improvements.map((improvement, index) => (
                            <Card key={index} variant="outlined" className="p-3 border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{improvement.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{improvement.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {improvement.category}
                                            </Badge>
                                            <Badge
                                                variant={improvement.difficulty === 'easy' ? 'secondary' : improvement.difficulty === 'medium' ? 'default' : 'destructive'}
                                                className="text-xs"
                                            >
                                                {improvement.difficulty}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                Priority: {improvement.priority}/10
                                            </Badge>
                                        </div>
                                        {improvement.specific_actions.length > 0 && (
                                            <div className="mt-2">
                                                <h5 className="text-xs font-medium mb-1">Specific Actions:</h5>
                                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                                    {improvement.specific_actions.map((action, actionIndex) => (
                                                        <li key={actionIndex} className="flex items-start gap-1">
                                                            <span className="text-primary">•</span>
                                                            {action}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </ExpandableSection>
            </div>

            {/* Industry Insights */}
            <ExpandableSection
                title="Industry Insights"
                icon={TrendingUp}
            >
                <div className="space-y-4">
                    {enhancedData.industry_insights.market_trends.length > 0 && (
                        <div>
                            <h4 className="font-medium text-sm mb-2">Market Trends</h4>
                            <ul className="space-y-1">
                                {enhancedData.industry_insights.market_trends.map((trend, index) => (
                                    <li key={index} className="text-sm flex items-start gap-2">
                                        <TrendingUp className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                        {trend}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {enhancedData.industry_insights.growth_opportunities.length > 0 && (
                        <div>
                            <h4 className="font-medium text-sm mb-2">Growth Opportunities</h4>
                            <ul className="space-y-1">
                                {enhancedData.industry_insights.growth_opportunities.map((opportunity, index) => (
                                    <li key={index} className="text-sm flex items-start gap-2">
                                        <Star className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                        {opportunity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {enhancedData.industry_insights.competitive_analysis && (
                        <div>
                            <h4 className="font-medium text-sm mb-2">Competitive Analysis</h4>
                            <p className="text-sm text-muted-foreground">
                                {enhancedData.industry_insights.competitive_analysis}
                            </p>
                        </div>
                    )}

                    {enhancedData.industry_insights.salary_expectations && (
                        <div>
                            <h4 className="font-medium text-sm mb-2">Salary Expectations</h4>
                            <p className="text-sm text-muted-foreground">
                                {enhancedData.industry_insights.salary_expectations}
                            </p>
                        </div>
                    )}
                </div>
            </ExpandableSection>
        </div>
    )
}