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
            case 'neon':
                return 'from-purple-600 via-blue-600 to-cyan-400'
            case 'cyberpunk':
                return 'from-pink-500 via-purple-600 to-yellow-400'
            case 'retro':
                return 'from-orange-400 via-pink-500 to-purple-600'
            case 'nature':
                return 'from-green-400 via-emerald-500 to-teal-600'
            case 'dark':
                return 'from-blue-600 via-purple-600 to-blue-800'
            default:
                return 'from-blue-500 via-purple-500 to-blue-600'
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
        <div className="news-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <SkeletonLoader className="h-6 w-20" />
                    <SkeletonLoader className="h-4 w-24" />
                </div>
                <SkeletonLoader className="h-4 w-4" />
            </div>

            <div className="space-y-3">
                <SkeletonLoader className="h-6 w-full" />
                <SkeletonLoader className="h-6 w-4/5" />
                <SkeletonLoader className="h-6 w-3/5" />
            </div>

            <div className="flex items-center justify-between">
                <SkeletonLoader className="h-4 w-32" />
                <div className="flex gap-2">
                    <SkeletonLoader className="h-8 w-8 rounded-lg" />
                    <SkeletonLoader className="h-8 w-8 rounded-lg" />
                    <SkeletonLoader className="h-8 w-8 rounded-lg" />
                </div>
            </div>
        </div>
    )
} 