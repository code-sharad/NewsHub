import { useQuery } from '@tanstack/react-query'
import { NEWS_CATEGORIES, type NewsCategory, type NewsByCategoryResponse } from '@/types/news'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://sharad31-newshub-fast-api.hf.space'

// Fetch news by category
const fetchNewsByCategory = async (category: NewsCategory): Promise<NewsByCategoryResponse> => {
  const response = await fetch(`/api/news/by-category/${category}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch news for category: ${category}`)
  }
  return response.json()
}

// Hook to fetch news by category
export const useNewsByCategory = (category: NewsCategory | null) => {
  return useQuery({
    queryKey: ['news', 'category', category],
    queryFn: () => fetchNewsByCategory(category!),
    enabled: category !== null && NEWS_CATEGORIES.includes(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to get category counts (mock data for now, you can implement actual API later)
export const useCategoryCounts = () => {
  // This could be replaced with actual API call to get counts per category
  const mockCounts = {
    politics: 45,
    technology: 32,
    business: 28,
    sports: 19,
    health: 15,
    science: 12,
    world: 25,
    india: 38,
    entertainment: 22,
    opinion: 16
  }

  return {
    data: mockCounts,
    isLoading: false,
    error: null
  }
}
