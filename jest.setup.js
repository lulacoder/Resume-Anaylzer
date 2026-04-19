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

// Mock Lucide React icons with a resilient fallback so new icons don't break tests.
jest.mock('lucide-react', () => {
  const React = require('react')

  const toTestId = (name) =>
    String(name)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/_/g, '-')
      .toLowerCase()

  return new Proxy(
    {},
    {
      get: (_, iconName) => ({ className, ...props }) =>
        React.createElement('span', {
          'data-testid': toTestId(iconName),
          className,
          ...props,
        }),
    }
  )
})

// Mock CSS modules and styles
jest.mock('*.module.css', () => ({}))
jest.mock('*.css', () => ({}))
