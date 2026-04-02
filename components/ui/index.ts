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
export { Textarea } from "./textarea"
export { Spinner, AnalysisSpinner, FileUploadSpinner, PageLoadingSpinner } from "./spinner"

// Additional components
export { Badge, badgeVariants } from "./badge"
export { Progress } from "./progress"
export { Skeleton, CardSkeleton, AnalysisResultSkeleton, DashboardSkeleton, ProfileSkeleton } from "./skeleton"

// New shadcn components
export { Alert, AlertTitle, AlertDescription } from "./alert"
export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "./avatar"
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible"
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu"
export { Label } from "./label"
export { Separator } from "./separator"
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./sheet"
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "./carousel"

// Re-export common utilities
export { cn } from "@/lib/utils"
