/**
 * Modern UI Components Index
 * Centralized exports for all shadcn/ui components
 */

// Core components
export { Button, buttonVariants, type ButtonProps } from "./button"
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardAction, 
  CardDescription, 
  CardContent 
} from "./card"
export { Input, inputVariants, type InputProps } from "./input"
export { Spinner, AnalysisSpinner, FileUploadSpinner, PageLoadingSpinner } from "./spinner"

// Additional components
export { Badge, badgeVariants } from "./badge"
export { Progress } from "./progress"
export { Skeleton, CardSkeleton, AnalysisResultSkeleton, DashboardSkeleton, ProfileSkeleton } from "./skeleton"

// Re-export common utilities
export { cn } from "@/lib/utils"