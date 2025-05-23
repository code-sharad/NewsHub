'use client'

import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query'
import { newsApi, queryKeys, NewsSource, NewsArticle } from '../api'

// Hook for fetching news from a single source
export function useNews(source: NewsSource) {
    return useQuery({
        queryKey: queryKeys.news(source),
        queryFn: () => newsApi.fetchNews(source),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    })
}

// Hook for fetching news from all sources
export function useAllNews() {
    return useQuery({
        queryKey: queryKeys.allNews(),
        queryFn: () => newsApi.fetchAllNews(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    })
}

// Hook for fetching multiple sources in parallel with individual error handling
export function useMultipleNews(sources: NewsSource[]) {
    return useQueries({
        queries: sources.map((source) => ({
            queryKey: queryKeys.news(source),
            queryFn: () => newsApi.fetchNews(source),
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 3,
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        })),
    })
}

// Combined hook that provides aggregated data and loading states
export function useNewsAggregated() {
    const sources: NewsSource[] = ['thehindu', 'indianexpress', 'economictimes']
    const queries = useMultipleNews(sources)

    const isLoading = queries.some(query => query.isLoading)
    const isError = queries.every(query => query.isError)
    const hasPartialData = queries.some(query => query.isSuccess)

    const data = queries
        .map((query, index) => ({
            source: sources[index],
            articles: query.data || [],
            isLoading: query.isLoading,
            isError: query.isError,
            error: query.error,
        }))
        .filter(item => item.articles.length > 0)

    const allArticles = data.flatMap(item =>
        item.articles.map(article => ({
            ...article,
            source: item.source
        }))
    )

    return {
        data,
        allArticles,
        isLoading,
        isError,
        hasPartialData,
        sources: data.map(item => item.source),
        totalArticles: allArticles.length,
        // Individual query results for fine-grained control
        queries,
    }
}

// Helper hook for prefetching
export function usePrefetchNews() {
    const queryClient = useQueryClient()

    const prefetchSource = (source: NewsSource) => {
        return queryClient.prefetchQuery({
            queryKey: queryKeys.news(source),
            queryFn: () => newsApi.fetchNews(source),
            staleTime: 5 * 60 * 1000,
        })
    }

    const prefetchAllSources = () => {
        const sources: NewsSource[] = ['thehindu', 'indianexpress', 'economictimes']
        return Promise.all(sources.map(prefetchSource))
    }

    return {
        prefetchSource,
        prefetchAllSources,
    }
} 