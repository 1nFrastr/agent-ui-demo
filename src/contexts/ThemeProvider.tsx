import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from './ThemeContext'
import type { Theme, ThemeContextValue } from './ThemeContext'

const STORAGE_KEY = 'theme-preference'

interface ThemeProviderProps {
  children: ReactNode
}

// Helper function to get initial theme from localStorage
const getInitialTheme = (): Theme => {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      return storedTheme
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error)
  }
  return 'system'
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  
  // Track localStorage availability to avoid repeated failed attempts
  const localStorageAvailable = useRef<boolean>(true)
  
  // In-memory fallback for theme when localStorage is unavailable
  const inMemoryTheme = useRef<Theme>(getInitialTheme())

  // Persist theme changes to localStorage
  useEffect(() => {
    // Always update in-memory fallback
    inMemoryTheme.current = theme
    
    // Only attempt localStorage if it's available
    if (!localStorageAvailable.current) {
      return
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
      console.warn('Theme preferences will not persist across sessions')
      localStorageAvailable.current = false
      // App continues functioning with in-memory state
    }
  }, [theme])

  // Resolve theme and apply 'dark' class to document.documentElement
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const resolveTheme = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return mediaQuery.matches ? 'dark' : 'light'
      }
      return theme
    }

    const applyTheme = () => {
      const resolved = resolveTheme()
      setResolvedTheme(resolved)
      
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    // Apply theme immediately
    applyTheme()

    // Add media query listener to respond to system preference changes when theme is 'system'
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const value: ThemeContextValue = {
    theme,
    setTheme,
    resolvedTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
