import { NextResponse } from 'next/server'
import { NEWS_CATEGORIES, type CategoriesResponse } from '@/types/news'

export async function GET(): Promise<NextResponse<CategoriesResponse>> {
  return NextResponse.json({
    categories: NEWS_CATEGORIES,
    count: NEWS_CATEGORIES.length,
    description: "Available news categories for filtering"
  })
}
