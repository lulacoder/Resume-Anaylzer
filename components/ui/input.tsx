import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent text-base shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:shadow-md",
  {
    variants: {
      variant: {
        default: "border-input bg-background hover:border-input/80 focus-visible:border-ring dark:bg-input/30",
        filled: "bg-muted border-transparent hover:bg-muted/80 focus-visible:bg-background",
        ghost: "border-transparent bg-transparent hover:bg-muted/50 focus-visible:bg-muted/30",
        file: "border-2 border-dashed border-input hover:border-primary/50 focus-visible:border-primary cursor-pointer min-h-[120px] items-center justify-center text-center p-6",
      },
      inputSize: {
        sm: "h-8 px-3 py-1 text-sm",
        default: "h-9 px-3 py-1",
        lg: "h-10 px-4 py-2 text-base",
      },
      state: {
        default: "",
        error: "border-destructive ring-destructive/20 dark:ring-destructive/40 focus-visible:border-destructive",
        success: "border-green-500 ring-green-500/20 focus-visible:border-green-500",
        warning: "border-yellow-500 ring-yellow-500/20 focus-visible:border-yellow-500",
        loading: "animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default", 
      state: "default",
    },
  }
)

interface InputProps extends React.ComponentProps<"input">, VariantProps<typeof inputVariants> {
  error?: boolean
  success?: boolean
  warning?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, state, error, success, warning, ...props }, ref) => {
    // Determine state based on props
    const currentState = error ? "error" : success ? "success" : warning ? "warning" : state

    return (
      <input
        type={type}
        data-slot="input"
        className={cn(inputVariants({ variant, inputSize, state: currentState }), className)}
        ref={ref}
        aria-invalid={error}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

// File Input with drag and drop functionality
interface FileInputProps extends Omit<React.ComponentProps<"input">, "type">, VariantProps<typeof inputVariants> {
  onFileSelect?: (files: FileList | null) => void
  acceptedFileTypes?: string
  maxFileSize?: number
  error?: boolean
  success?: boolean
  warning?: boolean
  loading?: boolean
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ 
    className, 
    variant = "file", 
    inputSize, 
    state, 
    error, 
    success, 
    warning, 
    loading,
    onFileSelect,
    acceptedFileTypes = ".pdf",
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    children,
    ...props 
  }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    
    // Determine state based on props
    const currentState = loading ? "loading" : error ? "error" : success ? "success" : warning ? "warning" : state

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      
      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        // Validate file size
        const file = files[0]
        if (file.size > maxFileSize) {
          console.error(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`)
          return
        }
        
        onFileSelect?.(files)
        
        // Update the input element
        if (inputRef.current) {
          const dt = new DataTransfer()
          dt.items.add(file)
          inputRef.current.files = dt.files
        }
      }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onFileSelect?.(e.target.files)
      props.onChange?.(e)
    }

    const handleClick = () => {
      inputRef.current?.click()
    }

    React.useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div
        className={cn(
          inputVariants({ variant, inputSize, state: currentState }),
          isDragOver && "border-primary bg-primary/5",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="sr-only"
          aria-describedby="file-input-description"
          {...props}
        />
        {children || (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="h-8 w-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-muted-foreground">
              {acceptedFileTypes} up to {Math.round(maxFileSize / (1024 * 1024))}MB
            </div>
          </div>
        )}
      </div>
    )
  }
)

FileInput.displayName = "FileInput"

export { Input, FileInput, inputVariants, type InputProps, type FileInputProps }