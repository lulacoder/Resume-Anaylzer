import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import type { EnhancedAnalysisResult } from '../types'

// Mock enhanced analysis data for testing
export const mockEnhancedAnalysisResult: EnhancedAnalysisResult = {
    overall_score: 85,
    summary: "Strong candidate with excellent technical skills and relevant experience in software development.",
    detailed_scores: {
        skills_match: 90,
        experience_relevance: 85,
        education_fit: 80,
        keyword_optimization: 75
    },
    present_skills: [
        {
            name: "JavaScript",
            category: "technical",
            proficiency: "advanced",
            importance: 9,
            evidence: "5+ years of experience with React and Node.js"
        },
        {
            name: "Problem Solving",
            category: "soft",
            proficiency: "expert",
            importance: 8,
            evidence: "Led multiple complex technical projects"
        },
        {
            name: "React",
            category: "technical",
            proficiency: "advanced",
            importance: 10,
            evidence: "Built 15+ production React applications"
        }
    ],
    missing_skills: [
        {
            name: "TypeScript",
            category: "technical",
            importance: 8,
            priority: "high",
            learning_resources: "Complete TypeScript course and practice with existing projects"
        },
        {
            name: "Docker",
            category: "technical",
            importance: 6,
            priority: "medium",
            learning_resources: "Docker fundamentals course and containerize existing applications"
        }
    ],
    experience_analysis: {
        total_years: 6,
        relevant_years: 5,
        career_progression: "excellent",
        role_alignment: 88,
        achievements: [
            "Led development of microservices architecture serving 1M+ users",
            "Reduced application load time by 40% through optimization",
            "Mentored 5 junior developers"
        ],
        gaps: [
            "Limited experience with cloud platforms",
            "No formal leadership training"
        ]
    },
    strengths: [
        {
            category: "skills",
            title: "Strong Technical Foundation",
            description: "Excellent proficiency in modern JavaScript frameworks and libraries",
            impact: "high",
            examples: ["React", "Node.js", "Express.js"]
        },
        {
            category: "experience",
            title: "Proven Track Record",
            description: "Successfully delivered multiple high-impact projects",
            impact: "high",
            examples: ["E-commerce platform", "Real-time chat application"]
        }
    ],
    improvements: [
        {
            category: "skills",
            title: "Cloud Platform Knowledge",
            description: "Gain experience with AWS or Azure for better scalability understanding",
            priority: 8,
            impact: "high",
            difficulty: "medium",
            specific_actions: [
                "Complete AWS Solutions Architect course",
                "Deploy personal projects to cloud platforms",
                "Obtain AWS certification"
            ]
        },
        {
            category: "education",
            title: "Formal Leadership Training",
            description: "Develop structured leadership and management skills",
            priority: 6,
            impact: "medium",
            difficulty: "easy",
            specific_actions: [
                "Enroll in leadership development program",
                "Seek mentorship from senior leaders",
                "Practice delegation and team management"
            ]
        }
    ],
    industry_insights: {
        market_trends: [
            "Increased demand for full-stack developers",
            "Growing importance of cloud-native development",
            "Rising adoption of TypeScript in enterprise applications"
        ],
        salary_expectations: "$95,000 - $130,000 based on experience and location",
        growth_opportunities: [
            "Technical lead positions",
            "Solution architect roles",
            "Product management transition"
        ],
        competitive_analysis: "Candidate is well-positioned for senior developer roles with strong technical skills and proven experience."
    },
    priority_actions: [
        {
            title: "Learn TypeScript",
            description: "Add TypeScript to skill set to match job requirements",
            priority: 9,
            estimated_impact: 8,
            time_investment: "medium",
            category: "short_term"
        },
        {
            title: "Gain Cloud Experience",
            description: "Learn AWS or Azure to improve infrastructure knowledge",
            priority: 7,
            estimated_impact: 7,
            time_investment: "high",
            category: "long_term"
        },
        {
            title: "Update Resume Keywords",
            description: "Include more industry-specific keywords and technologies",
            priority: 6,
            estimated_impact: 5,
            time_investment: "low",
            category: "immediate"
        }
    ],
    analysis_metadata: {
        confidence_score: 92,
        processing_notes: ["High-quality resume with clear structure", "Strong technical background evident"],
        industry_detected: "Technology",
        job_level_detected: "senior"
    }
}

export const mockAnalysisRecord = {
    id: "test-analysis-123",
    created_at: "2024-01-15T10:30:00Z",
    job_title: "Senior Frontend Developer",
    job_description: "We are looking for a senior frontend developer with React experience...",
    match_score: 85,
    enhanced_analysis: mockEnhancedAnalysisResult
}

export const mockLegacyAnalysisRecord = {
    id: "test-legacy-123",
    created_at: "2024-01-15T10:30:00Z",
    job_title: "Frontend Developer",
    match_score: 75,
    enhanced_analysis: null
}

// Custom render function that includes any providers
const customRender = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, options)

export * from '@testing-library/react'
export { customRender as render }