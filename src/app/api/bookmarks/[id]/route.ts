import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, bookmarks } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const bookmark = await db.select().from(bookmarks)
            .where(eq(bookmarks.id, id))
            .limit(1)

        if (bookmark.length === 0) {
            return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
        }

        if (bookmark[0].userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await db.delete(bookmarks)
            .where(eq(bookmarks.id, id))

        return NextResponse.json({ message: 'Bookmark deleted successfully' })
    } catch (error) {
        console.error('Error deleting bookmark:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 