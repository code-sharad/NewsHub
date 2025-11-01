import { NextRequest, NextResponse } from 'next/server'
import { NEWS_CATEGORIES, type NewsCategory, type NewsByCategoryResponse } from '@/types/news'

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://sharad31-newshub-fast-api.hf.space'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category: categoryParam } = await params
    const category = categoryParam.toLowerCase()

    // Validate category
    if (!NEWS_CATEGORIES.includes(category as NewsCategory)) {
      return NextResponse.json(
        {
          error: "Invalid category",
          validCategories: NEWS_CATEGORIES
        },
        { status: 400 }
      )
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Fetch news from backend API
    const response = await fetch(
      `${BACKEND_URL}/news/by-category/${category}?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data to match the expected output format
    const transformedData = {
      category: category,
      count: data.items?.length || 0,
      items: data.items?.map((item: any) => ({
        news_title: item.news_title,
        news_publication_date: item.news_publication_date,
        news_image: item.news_image,
        publisher: item.publisher,
        last_mode: item.last_mode,
        loc: item.loc,
        category: category
      })) || []
    }

    return NextResponse.json(transformedData)

  } catch (error) {
    console.error('Error fetching news by category:', error)
    return NextResponse.json(
      {
        error: "Failed to fetch news",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Export the list of valid categories
export async function OPTIONS() {
  return NextResponse.json({
    categories: NEWS_CATEGORIES,
    description: "Available news categories"
  })
}
