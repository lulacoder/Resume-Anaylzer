'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationState {
  mobileMenuOpen: boolean;
  userMenuOpen: boolean;
  isTransitioning: boolean;
}

export function useNavigation() {
  const pathname = usePathname();
  const [state, setState] = useState<NavigationState>({
    mobileMenuOpen: false,
    userMenuOpen: false,
    isTransitioning: false,
  });

  // Memoized handlers to prevent unnecessary re-renders
  const toggleMobileMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      mobileMenuOpen: !prev.mobileMenuOpen,
      userMenuOpen: false, // Close user menu when opening mobile menu
    }));
  }, []);

  const toggleUserMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      userMenuOpen: !prev.userMenuOpen,
      mobileMenuOpen: false, // Close mobile menu when opening user menu
    }));
  }, []);

  const closeAllMenus = useCallback(() => {
    setState(prev => ({
      ...prev,
      mobileMenuOpen: false,
      userMenuOpen: false,
    }));
  }, []);

  const setTransitioning = useCallback((isTransitioning: boolean) => {
    setState(prev => ({
      ...prev,
      isTransitioning,
    }));
  }, []);

  // Memoized navigation helpers
  const navigationHelpers = useMemo(() => ({
    isHomePage: pathname === '/',
    isDashboard: pathname === '/dashboard',
    isProfile: pathname === '/profile',
    isAuth: pathname.startsWith('/auth'),
    isAnalyze: pathname === '/analyze',
  }), [pathname]);

  // Close menus when pathname changes (navigation occurs)
  useState(() => {
    closeAllMenus();
  });

  return {
    ...state,
    toggleMobileMenu,
    toggleUserMenu,
    closeAllMenus,
    setTransitioning,
    ...navigationHelpers,
  };
}

// Hook for optimized theme management
export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');

  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    
    // Only access localStorage and DOM on client-side
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      
      // Apply theme to document with performance optimization
      requestAnimationFrame(() => {
        const root = document.documentElement;
        if (newTheme === 'dark') {
          root.classList.add('dark');
        } else if (newTheme === 'light') {
          root.classList.remove('dark');
        } else {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      });
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Initialize theme from localStorage (client-side only)
  useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
      setThemeState(savedTheme);
    }
  });

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}