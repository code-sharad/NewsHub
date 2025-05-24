'use client'

import * as React from 'react'
import { Monitor, Moon, Sun, ChevronDown } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
    const { theme, setTheme, actualTheme, isLoading } = useTheme()

    const themeOptions = [
        {
            value: 'light' as const,
            label: 'Light',
            icon: Sun,
            description: 'Light mode'
        },
        {
            value: 'ocean' as const,
            label: 'Ocean',
            icon: Moon,
            description: 'Ocean mode'
        },
        {
            value: 'sunset' as const,
            label: 'Sunset',
            icon: Moon,
            description: 'Sunset mode'
        },
        {
            value: 'coffee' as const,
            label: 'Coffee',
            icon: Moon,
            description: 'Coffee mode'
        },
        {
            value: 'monochrome' as const,
            label: 'Monochrome',
            icon: Moon,
            description: 'Monochrome mode'
        },
        {
            value: 'dark-oled' as const,
            label: 'Dark OLED',
            icon: Moon,
            description: 'Dark OLED mode'
        },
        {
            value: 'dark-formal' as const,
            label: 'Dark Formal',
            icon: Moon,
            description: 'Dark Formal mode'
        },
        {
            value: 'system' as const,
            label: 'System',
            icon: Monitor,
            description: 'Follow system'
        }
    ]

    const currentThemeOption = themeOptions.find(option => option.value === theme)
    const CurrentIcon = currentThemeOption?.icon || Monitor

    if (isLoading) {
        return (
            <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 rounded-lg"
                disabled
            >
                <div className="w-4 h-4 bg-muted-foreground/20 rounded animate-pulse" />
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-auto h-9 px-3 rounded-lg hover:bg-accent/80 transition-all duration-200 group"
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <CurrentIcon className="w-4 h-4 transition-all duration-300 group-hover:scale-110" />
                            {theme === 'system' && (
                                <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full transition-colors duration-300 ${actualTheme === 'dark-formal' ? 'bg-stone-500' : 'bg-amber-500'
                                    }`} />
                            )}
                        </div>
                        <span className="hidden sm:inline-block text-sm font-medium">
                            {currentThemeOption?.label}
                        </span>
                        <ChevronDown className="w-3 h-3 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-52 p-2 shadow-xl border bg-popover/95 backdrop-blur-sm"
            >
                <div className="mb-2">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                        Appearance
                    </div>
                </div>

                {themeOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = theme === option.value

                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`cursor-pointer rounded-md p-2 transition-all duration-200 ${isSelected
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'hover:bg-accent/80'
                                }`}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div className={`p-1.5 rounded-md transition-colors duration-200 ${isSelected
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-muted/50 text-muted-foreground'
                                    }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {option.label}
                                        </span>
                                        {isSelected && (
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {option.description}
                                        {option.value === 'system' && ` (${actualTheme})`}
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuItem>
                    )
                })}

                <div className="mt-2 pt-2 border-t">
                    <div className="text-xs text-muted-foreground px-2 py-1">
                        Current: <span className="font-medium capitalize">{actualTheme}</span> theme
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function ThemeIndicator() {
    const { actualTheme, isLoading } = useTheme()
    const isDark = actualTheme === 'dark-oled' || actualTheme === 'dark-formal'

    if (isLoading) return null

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-amber-500'}`} />
            <span className="text-xs font-medium text-muted-foreground">
                {isDark ? 'Dark' : 'Light'}
            </span>
        </div>
    )
} 