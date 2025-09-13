// News categories
export const NEWS_CATEGORIES = [
  "politics",
  "business",
  "technology",
  "sports",
  "entertainment",
  "health",
  "science",
  "world",
  "india",
  "opinion",
] as const

export type NewsCategory = typeof NEWS_CATEGORIES[number]

// News item interface
export interface NewsItem {
  news_title: string
  news_publication_date: string
  news_image: string | null
  publisher: string
  last_mode: string | null
  loc: string
  category: NewsCategory
}

// API response interface
export interface NewsByCategoryResponse {
  category: NewsCategory
  count: number
  items: NewsItem[]
}

// Categories list response
export interface CategoriesResponse {
  categories: readonly NewsCategory[]
  count: number
  description: string
}
