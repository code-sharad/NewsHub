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
    Zap,
    Cpu,
    Radio,
    Leaf,
    Monitor,
    Check,
    Sparkles,
    Waves,
    Sunrise,
    Eye,
    Coffee,
    Trees
} from 'lucide-react'
import { cn } from '@/lib/utils'

const themeIcons = {
    light: Sun,
    nature: Leaf,
    ocean: Waves,
    sunset: Sunrise,
    monochrome: Monitor,
    coffee: Coffee,
    'dark-oled': Moon,
    'dark-formal': Eye,
    system: Monitor,
}

export function ThemeSwitcher() {
    const { theme, setTheme, availableThemes, actualTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

    const currentTheme = availableThemes.find(t => t.value === theme)
    const CurrentIcon = themeIcons[theme] || Palette

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-10 w-10 rounded-xl transition-all duration-300",
                        "hover:scale-105 hover:shadow-glow",
                        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isOpen && "scale-105 shadow-glow"
                    )}
                >
                    <CurrentIcon className="h-5 w-5 transition-transform duration-300" />
                    <span className="sr-only">Switch theme</span>

                    {/* Floating indicator for active theme */}
                    <div className={cn(
                        "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background transition-all duration-300",
                        "bg-gradient-to-r",
                        currentTheme?.gradient || "from-primary to-accent"
                    )} />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className={cn(
                    "w-80 p-2 glass-card border-2 max-h-[80vh] overflow-y-auto",
                    "animate-scale-in"
                )}
            >
                <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Choose Your Style</span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-2" />

                <div className="grid gap-1 max-h-[60vh] overflow-y-auto">
                    {availableThemes.map((themeOption) => {
                        const Icon = themeIcons[themeOption.value] || Palette
                        const isActive = theme === themeOption.value

                        return (
                            <DropdownMenuItem
                                key={themeOption.value}
                                className={cn(
                                    "group relative cursor-pointer rounded-xl p-3 transition-all duration-300",
                                    "hover:bg-transparent focus:bg-transparent",
                                    "border border-transparent hover:border-primary/20",
                                    isActive && "border-primary/40 bg-primary/5"
                                )}
                                onClick={() => setTheme(themeOption.value)}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Theme preview circle */}
                                    <div className={cn(
                                        "relative h-8 w-8 rounded-full border-2 border-border/50 overflow-hidden",
                                        "group-hover:scale-110 transition-transform duration-300",
                                        isActive && "border-primary scale-110"
                                    )}>
                                        <div className={cn(
                                            "h-full w-full bg-gradient-to-br transition-opacity duration-300",
                                            themeOption.gradient,
                                            "group-hover:opacity-80"
                                        )} />

                                        {/* Icon overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Icon className={cn(
                                                "h-4 w-4 transition-all duration-300",
                                                themeOption.value === 'light' || themeOption.value === 'sunset' || themeOption.value === 'coffee' ? "text-gray-700" : "text-white",
                                                "group-hover:scale-110"
                                            )} />
                                        </div>

                                        {/* Active indicator */}
                                        {isActive && (
                                            <div className="absolute -top-1 -right-1">
                                                <div className="h-3 w-3 rounded-full bg-primary border-2 border-background">
                                                    <Check className="h-2 w-2 text-primary-foreground absolute top-0.5 left-0.5" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Theme info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "font-medium transition-colors duration-300",
                                                isActive && "text-primary"
                                            )}>
                                                {themeOption.label}
                                            </span>
                                            {isActive && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {themeOption.description}
                                        </p>
                                    </div>

                                    {/* Hover effect overlay */}
                                    <div className={cn(
                                        "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
                                        "bg-gradient-to-r from-primary/5 to-accent/5",
                                        "group-hover:opacity-100"
                                    )} />
                                </div>
                            </DropdownMenuItem>
                        )
                    })}
                </div>

                <DropdownMenuSeparator className="my-2" />

                {/* Current theme display */}
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Current theme:</span>
                        <span className="font-medium text-primary">
                            {currentTheme?.label}
                        </span>
                    </div>
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
    const CurrentIcon = themeIcons[currentTheme?.value] || Palette

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className={cn(
                "relative h-9 w-9 rounded-lg transition-all duration-300",
                "hover:scale-105 active:scale-95"
            )}
        >
            <CurrentIcon className="h-4 w-4" />
            <span className="sr-only">Switch theme</span>

            {/* Theme indicator */}
            <div className={cn(
                "absolute -bottom-1 left-1/2 transform -translate-x-1/2",
                "h-1 w-4 rounded-full bg-gradient-to-r transition-all duration-300",
                currentTheme?.gradient || "from-primary to-accent"
            )} />
        </Button>
    )
}

// Theme preview component for settings
export function ThemePreview({ themeValue }: { themeValue: string }) {
    const themeData = {
        light: { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900' },
        nature: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-900' },
        ocean: { bg: 'bg-blue-900', border: 'border-blue-500', text: 'text-blue-100' },
        sunset: { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-900' },
        monochrome: { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-gray-900' },
        coffee: { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-900' },
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