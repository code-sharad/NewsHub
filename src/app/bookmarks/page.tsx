'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import {
    BookmarkIcon,
    Trash2,
    ExternalLink,
    ArrowLeft,
    Clock,
    Search,
    Filter,
    Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface Bookmark {
    id: string
    articleUrl: string
    title: string
    description?: string
    imageUrl?: string
    publisher?: string
    createdAt: string
    tags?: string
}

export default function BookmarksPage() {
    const { data: session, status } = useSession()
    const { toast } = useToast()
    const router = useRouter()

    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deletingBookmarks, setDeletingBookmarks] = useState<Set<string>>(new Set())

    const fetchBookmarks = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/bookmarks')

            if (response.ok) {
                const data = await response.json()
                setBookmarks(data)
            } else {
                throw new Error('Failed to fetch bookmarks')
            }
        } catch (err) {
            console.error('Error fetching bookmarks:', err)
            toast({
                title: "Error",
                description: "Failed to load bookmarks. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        if (status === 'loading') return

        if (!session) {
            router.push('/')
            return
        }

        fetchBookmarks()
    }, [session, status, router, fetchBookmarks])

    const handleDeleteBookmark = async (bookmarkId: string) => {
        setDeletingBookmarks(prev => new Set([...prev, bookmarkId]))

        try {
            const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
                toast({
                    title: "Removed",
                    description: "Bookmark removed successfully.",
                })
            } else {
                throw new Error('Failed to delete bookmark')
            }
        } catch (err) {
            console.error('Error deleting bookmark:', err)
            toast({
                title: "Error",
                description: "Failed to remove bookmark. Please try again.",
                variant: "destructive",
            })
        } finally {
            setDeletingBookmarks(prev => {
                const newSet = new Set(prev)
                newSet.delete(bookmarkId)
                return newSet
            })
        }
    }

    const handleArticleClick = (bookmark: Bookmark) => {
        const parsedTags = bookmark.tags ? JSON.parse(bookmark.tags) : []
        const source = Array.isArray(parsedTags) ? parsedTags[0] : ''

        const params = new URLSearchParams({
            url: bookmark.articleUrl,
            title: bookmark.title,
            publisher: bookmark.publisher || 'Unknown',
            date: bookmark.createdAt,
            source: source,
        })

        if (bookmark.imageUrl) {
            params.append('image', bookmark.imageUrl)
        }

        router.push(`/article?${params.toString()}`)
    }

    const filteredBookmarks = bookmarks.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.publisher?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen relative">
                {/* Dynamic themed background */}
                <div className="fixed inset-0" style={{ background: 'var(--raycast-bg)' }} />

                <div className="relative flex items-center justify-center h-screen">
                    <div className="text-center raycast-glass-lg p-12 rounded-3xl raycast-fade-in">
                        <div className="w-16 h-16 raycast-btn rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <BookmarkIcon className="w-8 h-8 text-white" />
                        </div>
                        <div className="raycast-shimmer h-2 w-32 mx-auto rounded-full mb-4" style={{ background: 'hsl(var(--primary) / 0.2)' }}></div>
                        <p className="text-muted-foreground">Loading your saved articles...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen relative">
            {/* Dynamic themed background */}
            <div className="fixed inset-0" style={{ background: 'var(--raycast-bg)' }} />
            <div className="fixed inset-0 bg-grid-small-black/[0.02] dark:bg-grid-small-white/[0.02] pointer-events-none" />
            <div className="fixed inset-0 pointer-events-none" style={{ background: 'linear-gradient(45deg, hsl(var(--primary) / 0.05) 0%, transparent 25%, transparent 75%, hsl(var(--accent) / 0.05) 100%)' }} />

            {/* Header */}
            <div className="relative z-10 raycast-glass-lg border-b border-primary/10 px-4 py-6 sticky top-0 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="flex items-center raycast-glass hover:bg-primary/10 transition-all duration-300 rounded-xl px-4 py-2 h-11"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 text-primary" />
                            <span className="font-medium">Back</span>
                        </Button>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 raycast-btn rounded-2xl flex items-center justify-center shadow-lg">
                                <BookmarkIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold font-poppins raycast-gradient-text">
                                    My Bookmarks
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Your curated collection
                                </p>
                            </div>
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-3 py-1 rounded-lg font-semibold">
                                {bookmarks.length}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 w-4 h-4" />
                            <Input
                                placeholder="Search bookmarks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 w-64 raycast-glass border-primary/20 bg-background/60 backdrop-blur-sm placeholder:text-muted-foreground/60 raycast-focus transition-all duration-300 rounded-xl h-11 hover:bg-background/80 focus:bg-background/90"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
                {filteredBookmarks.length === 0 ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center raycast-glass-lg p-12 rounded-3xl raycast-fade-in">
                            <div className="w-20 h-20 raycast-btn rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                                <BookmarkIcon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold font-poppins raycast-gradient-text mb-4">
                                {searchQuery ? 'No matching bookmarks' : 'No bookmarks yet'}
                            </h3>
                            <p className="text-muted-foreground text-base leading-relaxed mb-6">
                                {searchQuery
                                    ? `No bookmarks match "${searchQuery}"`
                                    : 'Start saving articles you want to read later'}
                            </p>
                            {!searchQuery && (
                                <Button
                                    onClick={() => router.push('/')}
                                    className="raycast-btn raycast-btn-interactive text-white font-medium px-6 py-3 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Discover News
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredBookmarks.map((bookmark, index) => (
                            <Card
                                key={bookmark.id}
                                className="group raycast-glass border border-primary/20 cursor-pointer overflow-hidden rounded-3xl raycast-fade-in hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2"
                                onClick={() => handleArticleClick(bookmark)}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <CardHeader className="p-8">
                                    <div className="flex items-start justify-between gap-8">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className="flex items-center text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg">
                                                    <Clock className="w-3 h-3 mr-1.5" />
                                                    <span className="text-xs">
                                                        Saved {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                {bookmark.publisher && (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-primary/10 text-primary border-primary/25 hover:bg-primary/20 font-medium px-3 py-1 rounded-lg text-xs"
                                                    >
                                                        {bookmark.publisher}
                                                    </Badge>
                                                )}
                                            </div>

                                            <h3 className="text-xl sm:text-2xl font-bold font-poppins leading-tight line-clamp-3 group-hover:text-primary transition-colors duration-300">
                                                {bookmark.title}
                                            </h3>

                                            {bookmark.description && (
                                                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                                                    {bookmark.description}
                                                </p>
                                            )}
                                        </div>

                                        {bookmark.imageUrl && (
                                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 rounded-2xl overflow-hidden bg-muted shadow-lg">
                                                <Image
                                                    src={bookmark.imageUrl}
                                                    alt={bookmark.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    sizes="(max-width: 640px) 128px, 160px"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0 pb-8 px-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    window.open(bookmark.articleUrl, '_blank')
                                                }}
                                                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 font-semibold px-4 py-2 rounded-xl h-auto text-sm hover:scale-105"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Open Article
                                            </Button>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteBookmark(bookmark.id)
                                            }}
                                            disabled={deletingBookmarks.has(bookmark.id)}
                                            className="text-destructive hover:text-destructive/70 hover:bg-destructive/10 transition-all duration-300 font-semibold px-4 py-2 rounded-xl h-auto text-sm hover:scale-105"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {deletingBookmarks.has(bookmark.id) ? 'Removing...' : 'Remove'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 