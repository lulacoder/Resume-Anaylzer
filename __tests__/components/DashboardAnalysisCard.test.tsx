import React from 'react'
import { render, screen } from '../test-utils'
import { DashboardAnalysisCard } from '../../components/DashboardAnalysisCard'
import { mockAnalysisRecord, mockLegacyAnalysisRecord } from '../test-utils'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock the UI components
jest.mock('../../components/ui', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="card-content" className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div data-testid="card-header" className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 data-testid="card-title" className={className} {...props}>
      {children}
    </h3>
  ),
  Badge: ({ children, variant, className, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} className={className} {...props}>
      {children}
    </span>
  ),
  Progress: ({ value, className, ...props }: any) => (
    <div data-testid="progress" data-value={value} className={className} {...props} />
  ),
  Button: ({ children, variant, size, className, ...props }: any) => (
    <button data-testid="button" data-variant={variant} data-size={size} className={className} {...props}>
      {children}
    </button>
  )
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Target: ({ className, ...props }: any) => <div data-testid="target-icon" className={className} {...props} />,
  Award: ({ className, ...props }: any) => <div data-testid="award-icon" className={className} {...props} />,
  BookOpen: ({ className, ...props }: any) => <div data-testid="book-icon" className={className} {...props} />,
  TrendingUp: ({ className, ...props }: any) => <div data-testid="trending-up-icon" className={className} {...props} />,
  Clock: ({ className, ...props }: any) => <div data-testid="clock-icon" className={className} {...props} />,
  Star: ({ className, ...props }: any) => <div data-testid="star-icon" className={className} {...props} />
}))

describe('DashboardAnalysisCard', () => {
  describe('Enhanced Analysis Card', () => {
    const defaultProps = {
      analysis: mockAnalysisRecord
    }

    it('renders the card with enhanced analysis data', () => {
      render(<DashboardAnalysisCard {...defaultProps} />)
      
      expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText(/Analyzed on/)).toBeInTheDocument()
      const scores = screen.getAllByText('85%')
      expect(scores.length).toBeGreaterThan(0)
    })

    it('displays the enhanced badge', () => {
      render(<DashboardAnalysisCard {...defaultProps} />)
      
      const enhancedBadge = screen.getByText('Enhanced')
      expect(enhancedBadge).toBeInTheDocument()
      expect(enhancedBadge.closest('[data-testid="badge"]')).toHaveAttribute('data-variant', 'secondary')
    })

    it('shows industry badge when available', () => {
      render(<DashboardAnalysisCard {...defaultProps} />)
      
      expect(screen.getByText('Technology')).toBeInTheDocument()
    })

    it('displays detailed score previews', () => {
      render(<DashboardAnalysisCard {...defaultProps} />)
      
      const skills90s = screen.getAllByText('90%')
      const experience85s = screen.getAllByText('85%')
      expect(skills90s.length).toBeGreaterThan(0)
      expect(experience85s.length).toBeGreaterThan(0)
      expect(screen.getByText('Skills')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
    })

    it('shows key insights with correct counts', () => {
      render(<DashboardAnalysisCard {...defaultProps} />)
      
      expect(screen.getByText('3 skills')).toBeInTheDocument()
      expect(screen.getByText('3 actions')).toBeInTheDocument()
      expect(screen.getByText('92% confidence')).toBeInTheDocument()
    })

    it('has a view details button with enhanced text', () => {
      render(<DashboardAnalysisCard {...defaultProps} />)
      
      const viewButton = screen.getByRole('button', { name: /View Enhanced Details/ })
      expect(viewButton).toBeInTheDocument()
      
      // Check that the button is inside a link to the correct URL
      const link = viewButton.closest('a')
      expect(link).toHaveAttribute('href', `/analysis/${mockAnalysisRecord.id}`)
    })
  })

  describe('Legacy Analysis Card', () => {
    const legacyProps = {
      analysis: mockLegacyAnalysisRecord
    }

    it('renders the card with legacy analysis data', () => {
      render(<DashboardAnalysisCard {...legacyProps} />)
      
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText(/Analyzed on/)).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('does not display the enhanced badge', () => {
      render(<DashboardAnalysisCard {...legacyProps} />)
      
      expect(screen.queryByText('Enhanced')).not.toBeInTheDocument()
    })

    it('does not show enhanced data previews', () => {
      render(<DashboardAnalysisCard {...legacyProps} />)
      
      expect(screen.queryByText('Skills')).not.toBeInTheDocument()
      expect(screen.queryByText('Experience')).not.toBeInTheDocument()
      expect(screen.queryByTestId('target-icon')).not.toBeInTheDocument()
    })

    it('has a view details button without enhanced text', () => {
      render(<DashboardAnalysisCard {...legacyProps} />)
      
      const viewButton = screen.getByRole('button', { name: /View Details/ })
      expect(viewButton).toBeInTheDocument()
      expect(viewButton).not.toHaveTextContent('Enhanced')
      
      // Check that the button is inside a link to the correct URL
      const link = viewButton.closest('a')
      expect(link).toHaveAttribute('href', `/analysis/${mockLegacyAnalysisRecord.id}`)
    })
  })

  describe('Score Visualization', () => {
    it('applies correct color classes for high scores', () => {
      const highScoreProps = {
        analysis: {
          ...mockLegacyAnalysisRecord,
          match_score: 95
        }
      }
       
      render(<DashboardAnalysisCard {...highScoreProps} />)
      
      const scoreElements = screen.getAllByText('95%')
      expect(scoreElements.length).toBeGreaterThan(0)
    })

    it('applies correct color classes for medium scores', () => {
      const mediumScoreProps = {
        analysis: {
          ...mockAnalysisRecord,
          match_score: 65,
          enhanced_analysis: {
            ...mockAnalysisRecord.enhanced_analysis!,
            overall_score: 65
          }
        }
      }
      
      render(<DashboardAnalysisCard {...mediumScoreProps} />)
      
      const scoreElement = screen.getByText('65%')
      expect(scoreElement.className).toContain('text-yellow')
    })

    it('applies correct color classes for low scores', () => {
      const lowScoreProps = {
        analysis: {
          ...mockAnalysisRecord,
          match_score: 45,
          enhanced_analysis: {
            ...mockAnalysisRecord.enhanced_analysis!,
            overall_score: 45
          }
        }
      }
      
      render(<DashboardAnalysisCard {...lowScoreProps} />)
      
      const scoreElement = screen.getByText('45%')
      expect(scoreElement.className).toContain('text-red')
    })
  })

  describe('Edge Cases', () => {
    it('handles null job title', () => {
      const nullTitleProps = {
        analysis: {
          ...mockAnalysisRecord,
          job_title: null
        }
      }
      
      render(<DashboardAnalysisCard {...nullTitleProps} />)
      
      expect(screen.getByText('Untitled Analysis')).toBeInTheDocument()
    })

    it('handles null match score', () => {
      const nullScoreProps = {
        analysis: {
          ...mockLegacyAnalysisRecord,
          match_score: null
        }
      }
      
      render(<DashboardAnalysisCard {...nullScoreProps} />)
      
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })
})