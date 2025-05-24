'use client'

import React from 'react'
import { useTheme } from '@/contexts/theme-context'
import { Zap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
    message?: string
    showLogo?: boolean
}

export function LoadingScreen({
    message = "Loading amazing content...",
    showLogo = true
}: LoadingScreenProps) {
    const { actualTheme } = useTheme()

    const getThemeGradient = () => {
        switch (actualTheme) {
            case 'nature':
                return 'from-green-400 via-emerald-500 to-teal-600'
            case 'ocean':
                return 'from-blue-600 via-teal-500 to-cyan-400'
            case 'sunset':
                return 'from-yellow-400 via-orange-500 to-red-500'
            case 'coffee':
                return 'from-amber-200 via-orange-300 to-brown-500'
            case 'monochrome':
                return 'from-gray-200 via-gray-400 to-gray-600'
            case 'dark-oled':
                return 'from-black via-gray-900 to-blue-900'
            case 'light':
            case 'system':
            case 'dark-formal':
                return 'from-stone-800 via-stone-700 to-amber-600'
            default:
                return 'from-stone-500 via-stone-500 to-stone-600'
        }
    }

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "bg-background/95 backdrop-blur-sm"
        )}>
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={cn(
                    "absolute -top-1/2 -left-1/2 w-full h-full rounded-full",
                    "bg-gradient-to-r opacity-20 animate-spin",
                    getThemeGradient()
                )} style={{ animationDuration: '20s' }} />
                <div className={cn(
                    "absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full",
                    "bg-gradient-to-l opacity-10 animate-spin",
                    getThemeGradient()
                )} style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            </div>

            {/* Main content */}
            <div className="relative z-10 text-center space-y-8">
                {showLogo && (
                    <div className="relative">
                        {/* Logo with glow effect */}
                        <div className={cn(
                            "mx-auto w-20 h-20 rounded-2xl flex items-center justify-center relative",
                            "bg-gradient-to-br shadow-2xl animate-float",
                            getThemeGradient()
                        )}>
                            <Zap className="h-10 w-10 text-white" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
                        </div>

                        {/* Floating particles */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <Sparkles
                                    key={i}
                                    className={cn(
                                        "absolute w-4 h-4 text-primary animate-pulse",
                                        "opacity-60"
                                    )}
                                    style={{
                                        left: `${20 + i * 10}%`,
                                        top: `${30 + (i % 2) * 40}%`,
                                        animationDelay: `${i * 0.5}s`,
                                        animationDuration: '2s'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Brand text */}
                <div className="space-y-2">
                    <h1 className={cn(
                        "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                        getThemeGradient()
                    )}>
                        NewsHub
                    </h1>
                    <p className="text-muted-foreground">Your shortcut to news</p>
                </div>

                {/* Loading indicator */}
                <div className="space-y-4">
                    {/* Animated dots */}
                    <div className="flex justify-center space-x-1">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-2 h-2 rounded-full bg-gradient-to-r animate-pulse",
                                    getThemeGradient()
                                )}
                                style={{
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: '1.5s'
                                }}
                            />
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className="w-64 h-1 bg-muted rounded-full overflow-hidden mx-auto">
                        <div className={cn(
                            "h-full bg-gradient-to-r rounded-full",
                            "animate-shimmer bg-[length:200%_100%]",
                            getThemeGradient()
                        )} />
                    </div>

                    {/* Loading message */}
                    <p className="text-sm text-muted-foreground animate-pulse">
                        {message}
                    </p>
                </div>
            </div>

            {/* CSS for shimmer animation */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .animate-shimmer {
                    animation: shimmer 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}

// Skeleton loading component for individual elements
export function SkeletonLoader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted",
                className
            )}
            {...props}
        />
    )
}

// Loading cards for news feed
export function NewsCardSkeleton() {
    return (
        <div className="bg-card/80 backdrop-blur-sm border border-border/60 rounded-2xl p-0 h-[420px] overflow-hidden animate-pulse border-b-0">
            {/* Image skeleton - Top */}
            <div className="relative h-52 bg-gradient-to-br from-muted/40 to-muted/60 rounded-t-2xl">
                {/* Source indicator skeleton */}
                <div className="absolute top-3 left-3">
                    <SkeletonLoader className="h-6 w-20 rounded-lg" />
                </div>

                {/* Action buttons skeleton */}
                <div className="absolute top-3 right-3 flex gap-2">
                    <SkeletonLoader className="h-9 w-9 rounded-xl" />
                    <SkeletonLoader className="h-9 w-9 rounded-xl" />
                </div>
            </div>

            {/* Content skeleton - Bottom */}
            <div className="p-5 flex flex-col justify-between h-[212px]">
                <div className="space-y-3">
                    {/* Meta info skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SkeletonLoader className="h-1.5 w-1.5 rounded-full" />
                            <SkeletonLoader className="h-3 w-16" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <SkeletonLoader className="h-3 w-3 rounded" />
                            <SkeletonLoader className="h-3 w-20" />
                        </div>
                    </div>

                    {/* Title skeleton */}
                    <div className="space-y-2">
                        <SkeletonLoader className="h-5 w-full" />
                        <SkeletonLoader className="h-5 w-4/5" />
                        <SkeletonLoader className="h-5 w-3/5" />
                    </div>
                </div>

                {/* Actions skeleton */}
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <SkeletonLoader className="h-8 w-16 rounded-lg" />
                    <SkeletonLoader className="h-8 w-20 rounded-lg" />
                </div>
            </div>
        </div>
    )
} 