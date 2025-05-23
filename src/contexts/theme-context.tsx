'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react'

type Theme = 'light' | 'dark' | 'neon' | 'cyberpunk' | 'retro' | 'nature' | 'ocean' | 'sunset' | 'aurora' | 'monochrome' | 'coffee' | 'forest' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    actualTheme: Theme
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
        label: 'Pure Light',
        description: 'Clean, minimal, and bright',
        preview: 'bg-gradient-to-br from-white to-gray-50',
        gradient: 'from-white to-gray-100'
    },
    {
        value: 'dark' as Theme,
        label: 'Midnight',
        description: 'Rich, dark, and modern',
        preview: 'bg-gradient-to-br from-gray-900 to-black',
        gradient: 'from-gray-900 to-black'
    },
    {
        value: 'neon' as Theme,
        label: 'Neon Nights',
        description: 'Electric blues and vibrant purples',
        preview: 'bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-400',
        gradient: 'from-purple-600 via-blue-600 to-cyan-400'
    },
    {
        value: 'cyberpunk' as Theme,
        label: 'Cyberpunk',
        description: 'Futuristic with neon accents',
        preview: 'bg-gradient-to-br from-pink-500 via-purple-600 to-yellow-400',
        gradient: 'from-pink-500 via-purple-600 to-yellow-400'
    },
    {
        value: 'retro' as Theme,
        label: 'Retro Wave',
        description: '80s inspired synthwave vibes',
        preview: 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600',
        gradient: 'from-orange-400 via-pink-500 to-purple-600'
    },
    {
        value: 'nature' as Theme,
        label: 'Nature',
        description: 'Earth tones and organic feel',
        preview: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600',
        gradient: 'from-green-400 via-emerald-500 to-teal-600'
    },
    {
        value: 'ocean' as Theme,
        label: 'Ocean Depths',
        description: 'Deep blues and aqua tones',
        preview: 'bg-gradient-to-br from-blue-600 via-teal-500 to-cyan-400',
        gradient: 'from-blue-600 via-teal-500 to-cyan-400'
    },
    {
        value: 'sunset' as Theme,
        label: 'Golden Sunset',
        description: 'Warm oranges and golden hues',
        preview: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
        gradient: 'from-yellow-400 via-orange-500 to-red-500'
    },
    {
        value: 'aurora' as Theme,
        label: 'Aurora Borealis',
        description: 'Mystical greens and purples',
        preview: 'bg-gradient-to-br from-green-400 via-purple-500 to-blue-600',
        gradient: 'from-green-400 via-purple-500 to-blue-600'
    },
    {
        value: 'monochrome' as Theme,
        label: 'Monochrome',
        description: 'Classic black and white',
        preview: 'bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600',
        gradient: 'from-gray-200 via-gray-400 to-gray-600'
    },
    {
        value: 'coffee' as Theme,
        label: 'Coffee Shop',
        description: 'Warm browns and cream tones',
        preview: 'bg-gradient-to-br from-amber-200 via-orange-300 to-brown-500',
        gradient: 'from-amber-200 via-orange-300 to-brown-500'
    },
    {
        value: 'forest' as Theme,
        label: 'Deep Forest',
        description: 'Rich greens and earth tones',
        preview: 'bg-gradient-to-br from-green-800 via-green-600 to-emerald-400',
        gradient: 'from-green-800 via-green-600 to-emerald-400'
    },
    {
        value: 'system' as Theme,
        label: 'System',
        description: 'Follow device preference',
        preview: 'bg-gradient-to-br from-gray-400 to-gray-600',
        gradient: 'from-gray-400 to-gray-600'
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

// Enhanced theme application with smooth transitions
const applyThemeToDOM = (theme: Theme): void => {
    const root = document.documentElement

    requestAnimationFrame(() => {
        // Add transition class for smooth theme switching
        root.classList.add('theme-transitioning')

        // Remove all theme classes
        const themeClasses = ['light', 'dark', 'neon', 'cyberpunk', 'retro', 'nature']
        themeClasses.forEach(cls => root.classList.remove(cls))

        // Apply new theme
        root.setAttribute('data-theme', theme)
        root.classList.add(theme)

        // Set color scheme for browser elements
        if (theme === 'dark' || theme === 'cyberpunk' || theme === 'neon') {
            root.style.colorScheme = 'dark'
        } else {
            root.style.colorScheme = 'light'
        }

        // Remove transition class after animation
        setTimeout(() => {
            root.classList.remove('theme-transitioning')
        }, 300)
    })
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
    const [actualTheme, setActualTheme] = useState<Theme>('light')
    const [isLoading, setIsLoading] = useState(true)

    const mediaQueryRef = useRef<MediaQueryList | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isInitializedRef = useRef(false)

    // Debounced theme application
    const debouncedApplyTheme = useMemo(() => {
        return (newTheme: Theme) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(() => {
                applyThemeToDOM(newTheme)
                setActualTheme(newTheme)
            }, 16)
        }
    }, [])

    // Resolve theme
    const resolveTheme = useMemo(() => {
        return (themeToResolve: Theme): Theme => {
            if (themeToResolve === 'system') {
                return getSystemTheme()
            }
            return themeToResolve
        }
    }, [])

    // Enhanced setTheme function
    const setTheme = useMemo(() => {
        return (newTheme: Theme) => {
            setThemeState(newTheme)
            setStoredTheme(newTheme)

            const resolved = resolveTheme(newTheme)
            debouncedApplyTheme(resolved)
        }
    }, [resolveTheme, debouncedApplyTheme])

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
                if (storedTheme === 'system') {
                    mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)')

                    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
                        if (theme === 'system') {
                            const newTheme = e.matches ? 'dark' : 'light'
                            debouncedApplyTheme(newTheme)
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
                requestAnimationFrame(() => {
                    setIsLoading(false)
                })
            }
        }

        const initTimeout = setTimeout(initialize, 0)

        return () => {
            clearTimeout(initTimeout)
            if (cleanup) cleanup()
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    // Update system theme listener
    useEffect(() => {
        if (!isInitializedRef.current) return

        if (theme === 'system') {
            if (!mediaQueryRef.current) {
                mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)')

                const handleSystemThemeChange = (e: MediaQueryListEvent) => {
                    if (theme === 'system') {
                        const newTheme = e.matches ? 'dark' : 'light'
                        debouncedApplyTheme(newTheme)
                    }
                }

                mediaQueryRef.current.addEventListener('change', handleSystemThemeChange)
            }
        }
    }, [theme, debouncedApplyTheme])

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