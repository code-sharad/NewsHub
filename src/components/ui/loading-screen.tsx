'use client'

import React from 'react'
import { useTheme } from '@/contexts/theme-context'
import { Zap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
    message?: string
    showLogo?: boolean
    variant?: 'fullscreen' | 'overlay'
}

export function LoadingScreen({
    message = "Loading amazing content...",
    showLogo = true,
    variant = 'fullscreen'
}: LoadingScreenProps) {
    const { actualTheme } = useTheme()

    const getThemeGradient = () => {
        return actualTheme === 'dark'
            ? 'from-zinc-900 via-zinc-800 to-zinc-950'
            : 'from-white via-zinc-50 to-zinc-100'
    }

    return (
        <div className={cn(
            variant === 'fullscreen' ? "fixed inset-0 z-50" : "absolute inset-0 z-10",
            "flex items-center justify-center",
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
                            <Zap className={cn(
                                "h-10 w-10",
                                actualTheme === 'dark' ? "text-white" : "text-zinc-900"
                            )} />
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
                        actualTheme === 'dark'
                            ? "from-white to-zinc-400"
                            : "from-zinc-900 to-zinc-600"
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

// Theme-aware skeleton loader for light mode visibility
function ThemedSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md",
                "bg-zinc-200 dark:bg-muted",
                className
            )}
            {...props}
        />
    )
}

// Skeleton loading component for full article page
export function ArticleSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-20 animate-pulse">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-40 w-full h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
                    <ThemedSkeleton className="h-9 w-20 rounded-lg" />
                    <div className="flex gap-2">
                        <ThemedSkeleton className="h-9 w-9 rounded-lg" />
                        <ThemedSkeleton className="h-9 w-9 rounded-lg" />
                        <ThemedSkeleton className="h-9 w-24 rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Content Skeleton */}
            <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
                <div className="space-y-8">
                    {/* Article Header */}
                    <div className="space-y-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <ThemedSkeleton className="h-6 w-24 rounded-full" />
                            <ThemedSkeleton className="h-4 w-32" />
                        </div>

                        <div className="space-y-3">
                            <ThemedSkeleton className="h-12 w-full max-w-2xl mx-auto" />
                            <ThemedSkeleton className="h-12 w-3/4 mx-auto" />
                        </div>

                        <div className="space-y-2 pt-2">
                            <ThemedSkeleton className="h-6 w-full max-w-xl mx-auto" />
                            <ThemedSkeleton className="h-6 w-2/3 mx-auto" />
                        </div>

                        <div className="flex items-center justify-center pt-2">
                            <ThemedSkeleton className="h-8 w-8 rounded-full mr-3" />
                            <ThemedSkeleton className="h-4 w-32" />
                        </div>
                    </div>

                    {/* Article Image */}
                    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden my-12 bg-zinc-200 dark:bg-muted">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ThemedSkeleton className="h-16 w-16 opacity-30 dark:opacity-20" />
                        </div>
                    </div>

                    <div className="max-w-xs mx-auto">
                        <ThemedSkeleton className="h-px w-full" />
                    </div>

                    {/* Article Body */}
                    <div className="space-y-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <ThemedSkeleton className="h-4 w-full" />
                                <ThemedSkeleton className="h-4 w-full" />
                                <ThemedSkeleton className="h-4 w-[90%]" />
                                {i % 3 === 0 && <ThemedSkeleton className="h-4 w-[80%]" />}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}