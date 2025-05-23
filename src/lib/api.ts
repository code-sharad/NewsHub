const BACKEND_URL = process.env.BACKEND_API_URL || 'https://sharad31-newshub-fast-api.hf.space'

export interface NewsArticle {
    news_title: string
    news_publication_date: string
    news_image?: string
    publisher: string
    last_mode: string
    loc: string
}

export interface ApiResponse {
    message?: string
    data?: NewsArticle[]
}

export type NewsSource = 'thehindu' | 'indianexpress' | 'economictimes'

// API fetch functions for React Query
export const newsApi = {
    async fetchNews(source: NewsSource): Promise<NewsArticle[]> {
        const response = await fetch(`${BACKEND_URL}/news/${source}`, {
            next: { revalidate: 300 }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch news from ${source}: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        return Array.isArray(data) ? data : []
    },

    async fetchAllNews(): Promise<{ source: NewsSource; articles: NewsArticle[] }[]> {
        const sources: NewsSource[] = ['thehindu', 'indianexpress', 'economictimes']

        const results = await Promise.allSettled(
            sources.map(async (source) => {
                const articles = await this.fetchNews(source)
                return { source, articles }
            })
        )

        return results
            .filter((result): result is PromiseFulfilledResult<{ source: NewsSource; articles: NewsArticle[] }> =>
                result.status === 'fulfilled'
            )
            .map(result => result.value)
    }
}

// React Query keys
export const queryKeys = {
    news: (source: NewsSource) => ['news', source] as const,
    allNews: () => ['news', 'all'] as const,
    sources: () => ['news', 'sources'] as const,
} 