import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TransitionProps {
  children: ReactNode;
  show: boolean;
  className?: string;
  duration?: number;
}

export function FadeTransition({ 
  children, 
  show, 
  className, 
  duration = 300 
}: TransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "transition-opacity duration-300 ease-in-out",
        show ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SlideUpTransition({ 
  children, 
  show, 
  className, 
  duration = 300 
}: TransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        show 
          ? "opacity-100 transform translate-y-0" 
          : "opacity-0 transform translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ScaleTransition({ 
  children, 
  show, 
  className, 
  duration = 300 
}: TransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        show 
          ? "opacity-100 transform scale-100" 
          : "opacity-0 transform scale-95",
        className
      )}
    >
      {children}
    </div>
  );
}