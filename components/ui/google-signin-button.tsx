'use client';

import * as React from "react";
import { Button, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

// Google brand colors and styling following Google's brand guidelines
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("h-5 w-5", className)}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface GoogleSignInButtonProps extends Omit<ButtonProps, 'children'> {
  text?: string;
  loadingText?: string;
}

const GoogleSignInButton = React.forwardRef<HTMLButtonElement, GoogleSignInButtonProps>(
  ({ 
    className, 
    text = "Continue with Google", 
    loadingText = "Signing in...",
    loading,
    ...props 
  }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 font-medium",
          "focus-visible:ring-blue-500/20 focus-visible:border-blue-500",
          "dark:bg-white dark:hover:bg-gray-50 dark:text-gray-700 dark:border-gray-300",
          className
        )}
        loading={loading}
        loadingText={loadingText}
        {...props}
      >
        {!loading && <GoogleIcon />}
        {loading ? loadingText : text}
      </Button>
    );
  }
);

GoogleSignInButton.displayName = "GoogleSignInButton";

export { GoogleSignInButton, GoogleIcon };