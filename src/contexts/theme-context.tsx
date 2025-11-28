'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    actualTheme: 'light' | 'dark'
    isLoading: boolean
    availableThemes: Array<{
        value: Theme
        label: string
        description: string
        preview: string
        gradient: string
    }>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Available themes with metadata
const AVAILABLE_THEMES = [
    {
        value: 'light' as Theme,
        label: 'Light',
        description: 'Clean and bright',
        preview: 'bg-white',
        gradient: 'from-white to-zinc-100'
    },
    {
        value: 'dark' as Theme,
        label: 'Dark',
        description: 'Easy on the eyes',
        preview: 'bg-zinc-950',
        gradient: 'from-zinc-900 to-zinc-950'
    },
    {
        value: 'system' as Theme,
        label: 'System',
        description: 'Follow device preference',
        preview: 'bg-zinc-500',
        gradient: 'from-zinc-400 to-zinc-600'
    }
]

// Utility functions
const getStoredTheme = (): Theme => {
    if (typeof window === 'undefined') return 'system'
    try {
        return (localStorage.getItem('theme') as Theme) || 'system'
    } catch {
        return 'system'
    }
}

const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const setStoredTheme = (theme: Theme): void => {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem('theme', theme)
    } catch {
        // Fail silently
    }
}

// Instant theme application
const applyThemeToDOM = (theme: 'light' | 'dark'): void => {
    const root = document.documentElement

    // Remove dark class
    root.classList.remove('dark')

    // Apply new theme
    if (theme === 'dark') {
        root.classList.add('dark')
    }

    // Set color scheme for browser elements
    root.style.colorScheme = theme
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system')
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')
    const [isLoading, setIsLoading] = useState(true)

    const mediaQueryRef = useRef<MediaQueryList | null>(null)
    const isInitializedRef = useRef(false)

    // Resolve theme
    const resolveTheme = useMemo(() => {
        return (themeToResolve: Theme): 'light' | 'dark' => {
            if (themeToResolve === 'system') {
                return getSystemTheme()
            }
            return themeToResolve
        }
    }, [])

    // Instant setTheme function
    const setTheme = useMemo(() => {
        return (newTheme: Theme) => {
            setThemeState(newTheme)
            setStoredTheme(newTheme)

            const resolved = resolveTheme(newTheme)
            applyThemeToDOM(resolved)
            setActualTheme(resolved)
        }
    }, [resolveTheme])

    // Initialize theme system
    useEffect(() => {
        let cleanup: (() => void) | null = null

        const initialize = () => {
            if (isInitializedRef.current) return
            isInitializedRef.current = true

            try {
                const storedTheme = getStoredTheme()
                const resolved = resolveTheme(storedTheme)

                setThemeState(storedTheme)
                applyThemeToDOM(resolved)
                setActualTheme(resolved)

                // Set up system theme listener
                if (typeof window !== 'undefined') {
                    mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)')

                    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
                        if (theme === 'system') {
                            const newTheme = e.matches ? 'dark' : 'light'
                            applyThemeToDOM(newTheme)
                            setActualTheme(newTheme)
                        }
                    }

                    mediaQueryRef.current.addEventListener('change', handleSystemThemeChange)

                    cleanup = () => {
                        if (mediaQueryRef.current) {
                            mediaQueryRef.current.removeEventListener('change', handleSystemThemeChange)
                        }
                    }
                }
            } catch (error) {
                console.warn('Theme initialization failed:', error)
                applyThemeToDOM('light')
                setActualTheme('light')
            } finally {
                setIsLoading(false)
            }
        }

        initialize()

        return () => {
            if (cleanup) cleanup()
        }
    }, [resolveTheme, theme])

    // Update system theme listener when theme changes
    useEffect(() => {
        if (!isInitializedRef.current) return

        if (theme === 'system') {
            if (!mediaQueryRef.current && typeof window !== 'undefined') {
                mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)')
            }

            if (mediaQueryRef.current) {
                const handleSystemThemeChange = (e: MediaQueryListEvent) => {
                    if (theme === 'system') {
                        const newTheme = e.matches ? 'dark' : 'light'
                        applyThemeToDOM(newTheme)
                        setActualTheme(newTheme)
                    }
                }

                // Remove existing listener if any (simplified for this context)
                mediaQueryRef.current.onchange = handleSystemThemeChange
            }
        } else {
             if (mediaQueryRef.current) {
                mediaQueryRef.current.onchange = null
            }
        }
    }, [theme])

    const contextValue = useMemo(() => ({
        theme,
        setTheme,
        actualTheme,
        isLoading,
        availableThemes: AVAILABLE_THEMES
    }), [theme, setTheme, actualTheme, isLoading])

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    )
}