'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationState {
  mobileMenuOpen: boolean;
  userMenuOpen: boolean;
  isTransitioning: boolean;
}

export function useNavigation() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
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
    setState(prev => {
      // Only update if menus are actually open
      if (!prev.mobileMenuOpen && !prev.userMenuOpen) return prev;
      return {
        ...prev,
        mobileMenuOpen: false,
        userMenuOpen: false,
      };
    });
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
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      closeAllMenus();
      previousPathname.current = pathname;
    }
  }, [pathname, closeAllMenus]);

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
  const [isInitialized, setIsInitialized] = useState(false);

  const applyTheme = useCallback((themeValue: 'light' | 'dark' | 'system') => {
    if (typeof window === 'undefined') return;
    
    requestAnimationFrame(() => {
      const root = document.documentElement;
      if (themeValue === 'dark') {
        root.classList.add('dark');
      } else if (themeValue === 'light') {
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
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    
    // Only access localStorage and DOM on client-side
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    }
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Initialize theme from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
      setThemeState(savedTheme);
      applyTheme(savedTheme);
      setIsInitialized(true);
    }
  }, [isInitialized, applyTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}