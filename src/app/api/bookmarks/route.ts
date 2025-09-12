import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, bookmarks } from '@/lib/drizzle'
import { eq, desc, and } from 'drizzle-orm'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        console.log("Session in bookmarks route", session)
        // The session.user.id is coming from the JWT token via auth callbacks
        // Make sure the user object has the correct type that includes id
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 })
        }
        
        // Type assertion since we know id exists from auth callbacks
        const userId = session.user.id as string
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized - No user ID' }, { status: 401 }) 
        }

        const userBookmarks = await db.select().from(bookmarks)
            .where(eq(bookmarks.userId, session.user.id))
            .orderBy(desc(bookmarks.createdAt))

        return NextResponse.json(userBookmarks)
    } catch (error) {
        console.error('Error fetching bookmarks:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { articleUrl, title, description, imageUrl, publisher, tags } = await request.json()

        if (!articleUrl || !title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check if bookmark already exists
        const existingBookmark = await db.select().from(bookmarks)
            .where(and(
                eq(bookmarks.userId, session.user.id),
                eq(bookmarks.articleUrl, articleUrl)
            ))
            .limit(1)

        if (existingBookmark.length > 0) {
            return NextResponse.json({ error: 'Article already bookmarked' }, { status: 409 })
        }

        const newBookmark = await db.insert(bookmarks).values({
            userId: session.user.id,
            articleUrl,
            title,
            description,
            imageUrl,
            publisher,
            tags: tags ? JSON.stringify(tags) : null
        }).returning()

        return NextResponse.json(newBookmark[0], { status: 201 })
    } catch (error) {
        console.error('Error creating bookmark:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 