import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

        const bookmark = await prisma.bookmark.findUnique({
            where: { id }
        })

        if (!bookmark) {
            return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
        }

        if (bookmark.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await prisma.bookmark.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Bookmark deleted successfully' })
    } catch (error) {
        console.error('Error deleting bookmark:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 