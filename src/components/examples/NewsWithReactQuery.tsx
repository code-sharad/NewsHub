'use client'

import React from 'react'
import { useNews, useAllNews, useNewsAggregated } from '@/lib/hooks/useNews'
import { NewsSource } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Example 1: Single source news
export function SingleSourceNews({ source }: { source: NewsSource }) {
    const { data: articles, isLoading, isError, error, refetch } = useNews(source)

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center gap-2 p-4 border rounded-lg bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                    Error loading {source}: {error?.message}
                </span>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetch()}
                    className="ml-auto"
                >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                    <Badge variant="secondary">{articles?.length || 0} articles</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {articles?.slice(0, 5).map((article, index) => (
                        <div key={index} className="p-2 border rounded">
                            <h4 className="font-medium text-sm">{article.news_title}</h4>
                            <p className="text-xs text-muted-foreground">
                                {article.publisher} • {article.news_publication_date}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Example 2: All sources with individual loading states
export function AggregatedNews() {
    const {
        data,
        allArticles,
        isLoading,
        isError,
        hasPartialData,
        totalArticles,
        sources
    } = useNewsAggregated()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">News from All Sources</h2>
                <div className="flex gap-2">
                    <Badge variant="outline">
                        {sources.length} sources loaded
                    </Badge>
                    <Badge variant="secondary">
                        {totalArticles} total articles
                    </Badge>
                </div>
            </div>

            {isLoading && !hasPartialData && (
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-[120px]" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {[1, 2, 3].map(j => (
                                        <Skeleton key={j} className="h-16 w-full" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {hasPartialData && (
                <div className="grid gap-4 md:grid-cols-3">
                    {data.map(({ source, articles, isLoading, isError }) => (
                        <Card key={source} className={isError ? 'border-destructive' : ''}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {source.charAt(0).toUpperCase() + source.slice(1)}
                                    {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                                    {isError && <AlertCircle className="h-4 w-4 text-destructive" />}
                                    <Badge variant="secondary">{articles.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {articles.slice(0, 3).map((article, index) => (
                                        <div key={index} className="p-2 border rounded text-sm">
                                            <h4 className="font-medium line-clamp-2">
                                                {article.news_title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {article.publisher}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {isError && !hasPartialData && (
                <div className="text-center p-8">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Failed to load news</h3>
                    <p className="text-muted-foreground">
                        Unable to fetch news from any source. Please try again later.
                    </p>
                </div>
            )}
        </div>
    )
}

// Example 3: Simple usage with useAllNews hook
export function SimpleAllNews() {
    const { data, isLoading, isError, error, refetch } = useAllNews()

    if (isLoading) {
        return <div className="flex items-center gap-2 p-4">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading news from all sources...
        </div>
    }

    if (isError) {
        return (
            <div className="flex items-center gap-2 p-4 border rounded-lg bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                    Error: {error?.message}
                </span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">All News Sources</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data?.map(({ source, articles }) => (
                    <Card key={source}>
                        <CardHeader>
                            <CardTitle>
                                {source.charAt(0).toUpperCase() + source.slice(1)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {articles.length} articles available
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
} 