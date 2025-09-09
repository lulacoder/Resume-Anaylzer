import React from 'react'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import { EnhancedAnalysisResult } from '../../components/EnhancedAnalysisResult'
import { mockAnalysisRecord, mockEnhancedAnalysisResult } from '../test-utils'
import '@testing-library/jest-dom'

// Mock the UI components
interface MockComponentProps {
  children?: React.ReactNode;
  variant?: string;
  className?: string;
  value?: number;
  size?: string;
  [key: string]: any;
}

jest.mock('../../components/ui', () => ({
  Card: ({ children, variant, className, ...props }: MockComponentProps) => (
    <div data-testid="card" data-variant={variant} className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: MockComponentProps) => (
    <div data-testid="card-content" className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: MockComponentProps) => (
    <div data-testid="card-header" className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: MockComponentProps) => (
    <h3 data-testid="card-title" className={className} {...props}>
      {children}
    </h3>
  ),
  CardDescription: ({ children, className, ...props }: MockComponentProps) => (
    <p data-testid="card-description" className={className} {...props}>
      {children}
    </p>
  ),
  Badge: ({ children, variant, className, ...props }: MockComponentProps) => (
    <span data-testid="badge" data-variant={variant} className={className} {...props}>
      {children}
    </span>
  ),
  Progress: ({ value, className, ...props }: MockComponentProps) => (
    <div data-testid="progress" data-value={value} className={className} {...props} />
  ),
  Button: ({ children, variant, size, className, ...props }: MockComponentProps) => (
    <button data-testid="button" data-variant={variant} data-size={size} className={className} {...props}>
      {children}
    </button>
  ),
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ')
}))

describe('EnhancedAnalysisResult', () => {
  const defaultProps = {
    analysis: mockAnalysisRecord
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the component with enhanced analysis data', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText(/Analyzed on/)).toBeInTheDocument()
      expect(screen.getByText(/Confidence: 92%/)).toBeInTheDocument()
    })

    it('displays the overall score correctly', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      const overallScore = screen.getAllByText('85%')[0] // Get the first occurrence
      expect(overallScore).toBeInTheDocument()
      expect(screen.getByText('Overall Match')).toBeInTheDocument()
    })

    it('shows executive summary', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      expect(screen.getByText('Executive Summary')).toBeInTheDocument()
      expect(screen.getByText(mockEnhancedAnalysisResult.summary)).toBeInTheDocument()
    })

    it('displays detailed scores', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      expect(screen.getByText('Skills Match')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.getByText('Education')).toBeInTheDocument()
      expect(screen.getByText('Keywords')).toBeInTheDocument()
      
      const all90s = screen.getAllByText('90%')
      const all85s = screen.getAllByText('85%')
      const all80s = screen.getAllByText('80%')
      const all75s = screen.getAllByText('75%')
      
      expect(all90s.length).toBeGreaterThan(0) // Skills match score
      expect(all85s.length).toBeGreaterThan(0) // Experience score
      expect(all80s.length).toBeGreaterThan(0) // Education score
      expect(all75s.length).toBeGreaterThan(0) // Keywords score
    })

    it('renders without enhanced analysis data', () => {
      const propsWithoutEnhanced = {
        analysis: {
          ...mockAnalysisRecord,
          enhanced_analysis: null
        }
      }
      
      render(<EnhancedAnalysisResult {...propsWithoutEnhanced} />)
      
      expect(screen.getByText('No enhanced analysis data available.')).toBeInTheDocument()
    })
  })

  describe('Skills Analysis - Default Expanded', () => {
    it('displays present skills correctly', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      expect(screen.getByText('Present Skills (3)')).toBeInTheDocument()
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('Problem Solving')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
    })

    it('displays missing skills correctly', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      expect(screen.getByText('Missing Skills (2)')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Docker')).toBeInTheDocument()
    })

    it('shows skill categories and priorities', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      // Check for skill categories
      expect(screen.getAllByText('technical')).toHaveLength(4) // 3 present + 2 missing technical skills
      expect(screen.getByText('soft')).toBeInTheDocument()
      
      // Check for priorities on missing skills
      expect(screen.getByText('high')).toBeInTheDocument() // TypeScript priority
      expect(screen.getByText('medium')).toBeInTheDocument() // Docker priority
    })
  })

  describe('Priority Actions - Default Expanded', () => {
    it('displays priority actions sorted by priority', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      expect(screen.getByText('Learn TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Gain Cloud Experience')).toBeInTheDocument()
      expect(screen.getByText('Update Resume Keywords')).toBeInTheDocument()
      
      // Check priority badges
      expect(screen.getByText('Priority: 9/10')).toBeInTheDocument()
      expect(screen.getByText('Priority: 7/10')).toBeInTheDocument()
      expect(screen.getByText('Priority: 6/10')).toBeInTheDocument()
    })

    it('shows action categories and time investment', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      expect(screen.getByText('Time: medium')).toBeInTheDocument()
      expect(screen.getByText('Time: high')).toBeInTheDocument()
      expect(screen.getByText('Time: low')).toBeInTheDocument()
      
      expect(screen.getByText('Category: short term')).toBeInTheDocument()
      expect(screen.getByText('Category: long term')).toBeInTheDocument()
      expect(screen.getByText('Category: immediate')).toBeInTheDocument()
    })
  })

  describe('Expandable Sections', () => {
    it('toggles expandable sections on click', async () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      // Find an expandable section that's not expanded by default (Experience Analysis)
      const experienceButton = screen.getByRole('button', { name: /Experience Analysis/ })
      
      // Initially we should have at least one chevron down (collapsed section)
      expect(screen.getAllByTestId('chevron-down').length).toBeGreaterThan(0)
      
      // Click to expand
      fireEvent.click(experienceButton)
      
      await waitFor(() => {
        expect(screen.getAllByTestId('chevron-up').length).toBeGreaterThan(0)
      })
    })

    it('shows correct badges for expandable sections', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      expect(screen.getByText('3 present, 2 missing')).toBeInTheDocument() // Skills analysis badge
      expect(screen.getByText('5 relevant years')).toBeInTheDocument() // Experience analysis badge
      expect(screen.getByText('3')).toBeInTheDocument() // Priority actions count
    })

    it('displays experience metrics when expanded', async () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      // Find and click the experience analysis button to expand it
      const experienceButton = screen.getByRole('button', { name: /Experience Analysis/ })
      fireEvent.click(experienceButton)
      
      await waitFor(() => {
        expect(screen.getByText('6')).toBeInTheDocument() // Total years
        expect(screen.getByText('5')).toBeInTheDocument() // Relevant years
        expect(screen.getByText('88%')).toBeInTheDocument() // Role alignment
        expect(screen.getByText('excellent')).toBeInTheDocument() // Career progression
      })
    })
  })

  describe('Strengths and Improvements - Collapsed by Default', () => {
    it('shows section headers but not content when collapsed', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      expect(screen.getByText('Strengths')).toBeInTheDocument()
      expect(screen.getByText('Areas for Improvement')).toBeInTheDocument()
      
      // Content should not be visible when collapsed
      expect(screen.queryByText('Strong Technical Foundation')).not.toBeInTheDocument()
      expect(screen.queryByText('Cloud Platform Knowledge')).not.toBeInTheDocument()
    })

    it('displays strengths when expanded', async () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      const strengthsButton = screen.getByRole('button', { name: /Strengths/ })
      fireEvent.click(strengthsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Strong Technical Foundation')).toBeInTheDocument()
        expect(screen.getByText('Proven Track Record')).toBeInTheDocument()
        expect(screen.getAllByText('high impact')).toHaveLength(2)
      })
    })

    it('displays improvements when expanded', async () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      const improvementsButton = screen.getByRole('button', { name: /Areas for Improvement/ })
      fireEvent.click(improvementsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Cloud Platform Knowledge')).toBeInTheDocument()
        expect(screen.getByText('Formal Leadership Training')).toBeInTheDocument()
        expect(screen.getByText('Complete AWS Solutions Architect course')).toBeInTheDocument()
      })
    })
  })

  describe('Industry Insights - Collapsed by Default', () => {
    it('displays industry insights when expanded', async () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      const industryButton = screen.getByRole('button', { name: /Industry Insights/ })
      fireEvent.click(industryButton)
      
      await waitFor(() => {
        expect(screen.getByText('Market Trends')).toBeInTheDocument()
        expect(screen.getByText(/Increased demand for full-stack developers/)).toBeInTheDocument()
        
        expect(screen.getByText('Growth Opportunities')).toBeInTheDocument()
        expect(screen.getByText(/Technical lead positions/)).toBeInTheDocument()
        
        expect(screen.getByText('Competitive Analysis')).toBeInTheDocument()
        expect(screen.getByText(/Candidate is well-positioned/)).toBeInTheDocument()
        
        expect(screen.getByText('Salary Expectations')).toBeInTheDocument()
        expect(screen.getByText(/\$95,000 - \$130,000/)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('has proper button roles for expandable sections', () => {
      render(<EnhancedAnalysisResult {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Check that buttons are clickable (they don't need explicit type="button" in React)
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty arrays gracefully', () => {
      const propsWithEmptyArrays = {
        analysis: {
          ...mockAnalysisRecord,
          enhanced_analysis: {
            ...mockEnhancedAnalysisResult,
            present_skills: [],
            missing_skills: [],
            priority_actions: [],
            strengths: [],
            improvements: [],
            industry_insights: {
              ...mockEnhancedAnalysisResult.industry_insights,
              market_trends: [],
              growth_opportunities: []
            }
          }
        }
      }
      
      render(<EnhancedAnalysisResult {...propsWithEmptyArrays} />)
      
      expect(screen.getByText('Present Skills (0)')).toBeInTheDocument()
      // Check for "0" in Priority Actions badge
      const priorityActionsButton = screen.getByRole('button', { name: /Priority Actions/ });
      expect(priorityActionsButton).toHaveTextContent('0');
    })

    it('handles missing optional fields', () => {
      const propsWithMissingFields = {
        analysis: {
          ...mockAnalysisRecord,
          job_title: null,
          enhanced_analysis: {
            ...mockEnhancedAnalysisResult,
            experience_analysis: {
              ...mockEnhancedAnalysisResult.experience_analysis,
              total_years: undefined,
              relevant_years: undefined
            },
            industry_insights: {
              ...mockEnhancedAnalysisResult.industry_insights,
              salary_expectations: undefined
            }
          }
        }
      }
      
      render(<EnhancedAnalysisResult {...propsWithMissingFields} />)
      
      expect(screen.getByText('Resume Analysis')).toBeInTheDocument() // Fallback title
    })
  })
})