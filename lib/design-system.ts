/**
 * Design System Configuration
 * Centralized configuration for the modern UI foundation
 */

export const designTokens = {
  // Animation durations
  animation: {
    fast: "150ms",
    normal: "200ms", 
    slow: "300ms",
    slower: "500ms",
  },
  
  // Easing functions
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  
  // Spacing scale
  spacing: {
    xs: "0.25rem",   // 4px
    sm: "0.5rem",    // 8px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "3rem",   // 48px
    "3xl": "4rem",   // 64px
  },
  
  // Typography scale
  typography: {
    sizes: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      base: "1rem",     // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
    weights: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeights: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  
  // Shadow scale
  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  
  // Border radius scale
  radius: {
    none: "0",
    sm: "0.125rem",   // 2px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "2xl": "1rem",    // 16px
    full: "9999px",
  },
} as const

/**
 * Component variant configurations
 */
export const componentVariants = {
  button: {
    intent: {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", 
      destructive: "bg-destructive text-white hover:bg-destructive/90",
      outline: "border bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-9 px-4 text-sm", 
      lg: "h-10 px-6 text-base",
      icon: "h-9 w-9",
    },
  },
  
  card: {
    variant: {
      default: "bg-card border shadow-sm",
      elevated: "bg-card border shadow-md",
      outlined: "bg-card border-2",
      glass: "bg-card/80 backdrop-blur-sm border",
    },
    padding: {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  
  input: {
    variant: {
      default: "border bg-background",
      filled: "bg-muted border-transparent",
      ghost: "border-transparent bg-transparent",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-9 px-3 text-sm",
      lg: "h-10 px-4 text-base",
    },
  },
} as const

/**
 * Animation presets for common UI interactions
 */
export const animations = {
  fadeIn: "animate-in fade-in-0",
  fadeOut: "animate-out fade-out-0", 
  slideInFromTop: "animate-in slide-in-from-top-2",
  slideInFromBottom: "animate-in slide-in-from-bottom-2",
  slideInFromLeft: "animate-in slide-in-from-left-2",
  slideInFromRight: "animate-in slide-in-from-right-2",
  scaleIn: "animate-in zoom-in-95",
  scaleOut: "animate-out zoom-out-95",
} as const

/**
 * Responsive breakpoints
 */
export const breakpoints = {
  sm: "640px",
  md: "768px", 
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const