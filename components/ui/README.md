# Modern UI Foundation - shadcn/ui Components

This directory contains the modern UI foundation built with shadcn/ui components, providing a comprehensive design system for the Resume Analyzer application.

## Components Overview

### Core Components

#### Button
Enhanced button component with multiple variants, sizes, and loading states.

```tsx
import { Button } from "@/components/ui"

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With loading state
<Button loading loadingText="Processing...">Submit</Button>
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes:** `sm`, `default`, `lg`, `icon`

#### Card
Flexible card component with multiple variants and padding options.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui"

<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

**Variants:** `default`, `elevated`, `outlined`, `glass`
**Padding:** `none`, `sm`, `default`, `lg`

#### Input
Enhanced input component with validation states and variants.

```tsx
import { Input } from "@/components/ui"

// Basic usage
<Input placeholder="Enter text..." />

// With states
<Input error placeholder="Error state" />
<Input success placeholder="Success state" />
<Input warning placeholder="Warning state" />

// With variants
<Input variant="filled" placeholder="Filled variant" />
<Input variant="ghost" placeholder="Ghost variant" />
```

**Variants:** `default`, `filled`, `ghost`
**Sizes:** `sm`, `default`, `lg`
**States:** `default`, `error`, `success`, `warning`

#### Spinner
Modern loading spinner with multiple sizes and variants.

```tsx
import { Spinner } from "@/components/ui"

<Spinner size="lg" variant="primary" />
```

**Variants:** `default`, `secondary`, `destructive`, `muted`
**Sizes:** `sm`, `default`, `lg`, `xl`

### Additional Components

#### Badge
Compact badge component for labels and status indicators.

```tsx
import { Badge } from "@/components/ui"

<Badge variant="secondary">New</Badge>
<Badge variant="destructive">Error</Badge>
```

#### Progress
Progress bar component for showing completion status.

```tsx
import { Progress } from "@/components/ui"

<Progress value={75} />
```

#### Skeleton
Loading skeleton component for placeholder content.

```tsx
import { Skeleton } from "@/components/ui"

<Skeleton className="h-4 w-full" />
<Skeleton className="h-8 w-32" />
```

## Design System Features

### Theme Support
- Full light/dark mode support
- CSS custom properties for easy theming
- Consistent color palette across all components

### Accessibility
- WCAG 2.1 AA compliant
- Proper focus management
- Screen reader support
- Keyboard navigation

### Performance
- Optimized bundle size
- Tree-shakeable exports
- Minimal runtime overhead

### Developer Experience
- Full TypeScript support
- Comprehensive prop interfaces
- Consistent API patterns
- Excellent IDE autocomplete

## Animation System

The design system includes a comprehensive animation system with predefined keyframes and utilities:

### Available Animations
- `fadeIn` / `fadeOut`
- `slideInFromTop` / `slideInFromBottom`
- `slideInFromLeft` / `slideInFromRight`
- `zoomIn` / `zoomOut`

### Usage
```tsx
<div className="animate-in fade-in-0">Fade in animation</div>
<div className="animate-in slide-in-from-top-2">Slide from top</div>
```

## Customization

### CSS Variables
All components use CSS custom properties that can be customized:

```css
:root {
  --primary: oklch(0.208 0.042 265.755);
  --secondary: oklch(0.968 0.007 247.896);
  --accent: oklch(0.968 0.007 247.896);
  /* ... more variables */
}
```

### Component Variants
Components use Class Variance Authority (CVA) for type-safe variant management:

```tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        custom: "custom-classes"
      }
    }
  }
)
```

## Best Practices

1. **Consistent Spacing**: Use the design system's spacing scale
2. **Color Usage**: Stick to semantic color tokens
3. **Typography**: Use consistent font sizes and weights
4. **Accessibility**: Always include proper ARIA labels
5. **Performance**: Import only the components you need

## Migration Guide

### From Basic Components
The old basic components have been replaced with enhanced shadcn/ui versions:

```tsx
// Old
import { Button } from "@/components/ui/Button"

// New
import { Button } from "@/components/ui"
// or
import { Button } from "@/components/ui/button"
```

### Breaking Changes
- Button now supports `loading` prop instead of manual spinner handling
- Card has new `variant` and `padding` props
- Input has enhanced state management with `error`, `success`, `warning` props

## Contributing

When adding new components:
1. Follow the existing patterns and conventions
2. Include proper TypeScript interfaces
3. Add comprehensive documentation
4. Ensure accessibility compliance
5. Test across different themes and screen sizes