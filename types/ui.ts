/**
 * UI Component Types and Interfaces
 * Centralized type definitions for the modern UI system
 */

import { type VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"
import { inputVariants } from "@/components/ui/input"
import { badgeVariants } from "@/components/ui/badge"
// import { spinnerVariants } from "@/components/ui/spinner" // No variants exported

// Component variant types
export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"]
export type ButtonSize = VariantProps<typeof buttonVariants>["size"]
export type InputVariant = VariantProps<typeof inputVariants>["variant"]
export type InputSize = VariantProps<typeof inputVariants>["inputSize"]
export type InputState = VariantProps<typeof inputVariants>["state"]
export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]
// Spinner types (no variants - uses simple props)
export type SpinnerSize = "sm" | "md" | "lg"

// Card variants
export type CardVariant = "default" | "elevated" | "outlined" | "glass"
export type CardPadding = "none" | "sm" | "default" | "lg"

// Animation types
export type AnimationType = 
  | "fadeIn" 
  | "fadeOut" 
  | "slideInFromTop" 
  | "slideInFromBottom" 
  | "slideInFromLeft" 
  | "slideInFromRight" 
  | "scaleIn" 
  | "scaleOut"

// Theme types
export type ThemeMode = "light" | "dark" | "system"

// Common component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Loading state interface
export interface LoadingState {
  loading?: boolean
  loadingText?: string
}

// Form field state interface
export interface FieldState {
  error?: boolean
  success?: boolean
  warning?: boolean
  disabled?: boolean
}

// Interactive component interface
export interface InteractiveProps {
  onClick?: () => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
}

// Responsive breakpoint types
export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl"

// Design system token types
export interface DesignTokens {
  colors: {
    primary: string
    secondary: string
    accent: string
    destructive: string
    muted: string
    background: string
    foreground: string
    border: string
    input: string
    ring: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    "2xl": string
    "3xl": string
  }
  typography: {
    sizes: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      "2xl": string
      "3xl": string
      "4xl": string
    }
    weights: {
      normal: string
      medium: string
      semibold: string
      bold: string
    }
  }
  radius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    "2xl": string
    full: string
  }
  shadows: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// Component composition types
export interface ComposableComponent<T = {}> extends BaseComponentProps {
  asChild?: boolean
  variant?: string
  size?: string
}

// Form component types
export interface FormFieldProps extends FieldState {
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
}

// Layout component types
export interface LayoutProps extends BaseComponentProps {
  padding?: CardPadding
  gap?: "none" | "sm" | "md" | "lg" | "xl"
}

// Animation component types
export interface AnimatedProps {
  animation?: AnimationType
  duration?: "fast" | "normal" | "slow" | "slower"
  delay?: number
}

// Accessibility types
export interface AccessibilityProps {
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  role?: string
  tabIndex?: number
}

// Complete component prop types
export interface CompleteButtonProps extends 
  BaseComponentProps, 
  LoadingState, 
  InteractiveProps, 
  AccessibilityProps {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: "button" | "submit" | "reset"
}

export interface CompleteInputProps extends 
  BaseComponentProps, 
  FieldState, 
  FormFieldProps, 
  AccessibilityProps {
  variant?: InputVariant
  size?: InputSize
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface CompleteCardProps extends 
  BaseComponentProps, 
  LayoutProps, 
  AnimatedProps {
  variant?: CardVariant
  interactive?: boolean
  onClick?: () => void
}