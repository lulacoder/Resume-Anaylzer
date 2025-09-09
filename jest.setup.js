import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ChevronDown: ({ className, ...props }) => <div data-testid="chevron-down" className={className} {...props} />,
  ChevronUp: ({ className, ...props }) => <div data-testid="chevron-up" className={className} {...props} />,
  TrendingUp: ({ className, ...props }) => <div data-testid="trending-up" className={className} {...props} />,
  TrendingDown: ({ className, ...props }) => <div data-testid="trending-down" className={className} {...props} />,
  Target: ({ className, ...props }) => <div data-testid="target" className={className} {...props} />,
  Award: ({ className, ...props }) => <div data-testid="award" className={className} {...props} />,
  BookOpen: ({ className, ...props }) => <div data-testid="book-open" className={className} {...props} />,
  Lightbulb: ({ className, ...props }) => <div data-testid="lightbulb" className={className} {...props} />,
  Clock: ({ className, ...props }) => <div data-testid="clock" className={className} {...props} />,
  Star: ({ className, ...props }) => <div data-testid="star" className={className} {...props} />,
}))

// Mock CSS modules and styles
jest.mock('*.module.css', () => ({}))
jest.mock('*.css', () => ({}))