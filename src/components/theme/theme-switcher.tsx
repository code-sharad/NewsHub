'use client'

import React, { useState } from 'react'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
    Palette,
    Sun,
    Moon,
    Monitor,
    Check,
    Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
}

export function ThemeSwitcher() {
    const { theme, setTheme, availableThemes } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

    const currentTheme = availableThemes.find(t => t.value === theme)
    const CurrentIcon = themeIcons[theme as keyof typeof themeIcons] || Palette

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-10 w-10 rounded-xl transition-all duration-300",
                        "hover:scale-105 hover:bg-accent/50",
                        isOpen && "scale-105 bg-accent/50"
                    )}
                >
                    <CurrentIcon className="h-5 w-5 transition-transform duration-500 rotate-0 hover:rotate-90" />
                    <span className="sr-only">Switch theme</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className={cn(
                    "w-64 p-2 glass-card border-border/50 shadow-xl",
                    "animate-in fade-in zoom-in-95 duration-200"
                )}
            >
                <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Appearance
                </DropdownMenuLabel>

                <div className="grid gap-1">
                    {availableThemes.map((themeOption) => {
                        const Icon = themeIcons[themeOption.value as keyof typeof themeIcons] || Palette
                        const isActive = theme === themeOption.value

                        return (
                            <DropdownMenuItem
                                key={themeOption.value}
                                className={cn(
                                    "group relative cursor-pointer rounded-xl p-3 transition-all duration-200",
                                    "focus:bg-accent/50",
                                    isActive && "bg-accent/30"
                                )}
                                onClick={() => setTheme(themeOption.value)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className={cn(
                                        "flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200",
                                        isActive ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                    )}>
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <span className={cn(
                                        "font-medium flex-1",
                                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        {themeOption.label}
                                    </span>

                                    {isActive && (
                                        <Check className="h-4 w-4 text-primary animate-in fade-in zoom-in duration-200" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        )
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Compact version for mobile
export function ThemeSwitcherCompact() {
    const { theme, setTheme, availableThemes } = useTheme()

    // Ensure we have a valid index with fallback to 0
    const initialIndex = availableThemes.findIndex(t => t.value === theme)
    const [currentIndex, setCurrentIndex] = useState(
        initialIndex >= 0 ? initialIndex : 0
    )

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % availableThemes.length
        setCurrentIndex(nextIndex)
        setTheme(availableThemes[nextIndex].value)
    }

    // Ensure we have a valid theme with fallback
    const currentTheme = availableThemes[currentIndex] || availableThemes[0]
    const CurrentIcon = themeIcons[currentTheme?.value as keyof typeof themeIcons] || Palette

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className={cn(
                "relative h-9 w-9 rounded-xl transition-all duration-300",
                "hover:scale-105 hover:bg-accent/50 active:scale-95"
            )}
        >
            <CurrentIcon className="h-4 w-4 transition-all duration-500 rotate-0 hover:rotate-90" />
            <span className="sr-only">Switch theme</span>
        </Button>
    )
}

// Theme preview component for settings
export function ThemePreview({ themeValue }: { themeValue: string }) {
    const themeData = {
        light: { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900' },
        dark: { bg: 'bg-zinc-950', border: 'border-zinc-800', text: 'text-zinc-50' },
        system: { bg: 'bg-zinc-100', border: 'border-zinc-300', text: 'text-zinc-900' },
    }

    const theme = themeData[themeValue as keyof typeof themeData] || themeData.light

    return (
        <div className={cn(
            "relative h-20 w-32 rounded-lg border-2 overflow-hidden transition-all duration-300",
            theme.bg,
            theme.border,
            "hover:scale-105 cursor-pointer"
        )}>
            {/* Header bar */}
            <div className={cn("h-4 border-b", theme.border)} />

            {/* Content area */}
            <div className="p-2 space-y-1">
                <div className={cn("h-2 w-16 rounded", theme.text, "opacity-60")} />
                <div className={cn("h-1 w-12 rounded", theme.text, "opacity-40")} />
                <div className={cn("h-1 w-20 rounded", theme.text, "opacity-40")} />
            </div>

            {/* Accent dot */}
            <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-current opacity-60" />
        </div>
    )
}