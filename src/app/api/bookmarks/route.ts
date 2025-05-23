import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(bookmarks)
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
        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_articleUrl: {
                    userId: session.user.id,
                    articleUrl: articleUrl
                }
            }
        })

        if (existingBookmark) {
            return NextResponse.json({ error: 'Article already bookmarked' }, { status: 409 })
        }

        const bookmark = await prisma.bookmark.create({
            data: {
                userId: session.user.id,
                articleUrl,
                title,
                description,
                imageUrl,
                publisher,
                tags: tags ? JSON.stringify(tags) : null
            }
        })

        return NextResponse.json(bookmark, { status: 201 })
    } catch (error) {
        console.error('Error creating bookmark:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 