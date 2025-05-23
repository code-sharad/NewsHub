import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://sharad31-newshub-fast-api.hf.space'

export interface ArticleContent {
    title?: string
    content?: string
    author?: string
    publishedDate?: string
    summary?: string
    image?: string
    tags?: string[]
}

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json()

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        const response = await fetch(`${BACKEND_URL}/news-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
            },
            body: JSON.stringify({ url })
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch article content: ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching article content:', error)
        return NextResponse.json(
            { error: 'Failed to fetch article content' },
            { status: 500 }
        )
    }
} 