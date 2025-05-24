'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import {
    BookmarkIcon,
    Trash2,
    ExternalLink,
    ArrowLeft,
    Clock,
    Search,
    Filter,
    Sparkles,
    Grid3X3,
    List,
    Calendar,
    SortAsc,
    SortDesc,
    MoreHorizontal,
    Share2,
    Edit3,
    Archive,
    Star,
    Bookmark,
    Eye,
    ChevronDown,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { cn } from '@/lib/utils'

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

type ViewMode = 'grid' | 'list'
type SortBy = 'date' | 'title' | 'publisher'
type SortOrder = 'asc' | 'desc'

export default function BookmarksPage() {
    const { data: session, status } = useSession()
    const { toast } = useToast()
    const router = useRouter()

    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deletingBookmarks, setDeletingBookmarks] = useState<Set<string>>(new Set())
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [sortBy, setSortBy] = useState<SortBy>('date')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
    const [selectedPublisher, setSelectedPublisher] = useState<string>('')

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

    // Get unique publishers for filtering
    const publishers = useMemo(() => {
        const publisherSet = new Set(
            bookmarks
                .map(b => b.publisher)
                .filter((publisher): publisher is string => Boolean(publisher))
        )
        return Array.from(publisherSet).sort()
    }, [bookmarks])

    // Filter and sort bookmarks
    const filteredAndSortedBookmarks = useMemo(() => {
        const filtered = bookmarks.filter(bookmark => {
            const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bookmark.publisher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesPublisher = !selectedPublisher || bookmark.publisher === selectedPublisher

            return matchesSearch && matchesPublisher
        })

        // Sort bookmarks
        filtered.sort((a, b) => {
            let comparison = 0

            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    break
                case 'title':
                    comparison = a.title.localeCompare(b.title)
                    break
                case 'publisher':
                    comparison = (a.publisher || '').localeCompare(b.publisher || '')
                    break
            }

            return sortOrder === 'asc' ? comparison : -comparison
        })

        return filtered
    }, [bookmarks, searchQuery, selectedPublisher, sortBy, sortOrder])

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

    const handleShareBookmark = async (bookmark: Bookmark) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: bookmark.title,
                    text: bookmark.description,
                    url: bookmark.articleUrl,
                })
            } catch (err) {
                console.error('Error sharing:', err)
            }
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(bookmark.articleUrl)
            toast({
                title: "Copied",
                description: "Article URL copied to clipboard.",
            })
        }
    }

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedPublisher('')
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center glass-card p-12 max-w-md">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <BookmarkIcon className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <div className="h-2 w-32 bg-primary/20 mx-auto rounded-full mb-4 animate-pulse"></div>
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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left section */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="rounded-xl"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                                    <BookmarkIcon className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">My Bookmarks</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {bookmarks.length} saved articles
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right section */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search bookmarks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-64 bg-muted/50"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>

                            {/* Filters */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="relative">
                                        <Filter className="w-4 h-4" />
                                        {selectedPublisher && (
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Filter by Publisher</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setSelectedPublisher('')}>
                                        <span className={selectedPublisher === '' ? 'font-medium' : ''}>
                                            All Publishers
                                        </span>
                                    </DropdownMenuItem>
                                    {publishers.map(publisher => (
                                        <DropdownMenuItem
                                            key={publisher}
                                            onClick={() => setSelectedPublisher(publisher)}
                                        >
                                            <span className={selectedPublisher === publisher ? 'font-medium' : ''}>
                                                {publisher}
                                            </span>
                                        </DropdownMenuItem>
                                    ))}
                                    {(searchQuery || selectedPublisher) && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={clearFilters}>
                                                <X className="w-4 h-4 mr-2" />
                                                Clear Filters
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Sort */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setSortBy('date')}>
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span className={sortBy === 'date' ? 'font-medium' : ''}>Date</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('title')}>
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        <span className={sortBy === 'title' ? 'font-medium' : ''}>Title</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('publisher')}>
                                        <Archive className="w-4 h-4 mr-2" />
                                        <span className={sortBy === 'publisher' ? 'font-medium' : ''}>Publisher</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                                        {sortOrder === 'asc' ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
                                        {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* View Mode */}
                            <div className="flex border rounded-lg">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-r-none"
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-l-none"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Active filters */}
                    {(searchQuery || selectedPublisher) && (
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-sm text-muted-foreground">Active filters:</span>
                            {searchQuery && (
                                <Badge variant="secondary" className="gap-1">
                                    Search: {searchQuery}
                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                                </Badge>
                            )}
                            {selectedPublisher && (
                                <Badge variant="secondary" className="gap-1">
                                    Publisher: {selectedPublisher}
                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedPublisher('')} />
                                </Badge>
                            )}
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6">
                {filteredAndSortedBookmarks.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center glass-card p-12 max-w-md">
                            <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <BookmarkIcon className="w-10 h-10 text-primary-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">
                                {searchQuery || selectedPublisher ? 'No matching bookmarks' : 'No bookmarks yet'}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {searchQuery || selectedPublisher
                                    ? 'Try adjusting your search or filters'
                                    : 'Start saving articles you want to read later'}
                            </p>
                            {!searchQuery && !selectedPublisher && (
                                <Button
                                    onClick={() => router.push('/')}
                                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Discover News
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={cn(
                        viewMode === 'grid'
                            ? 'grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : 'space-y-4'
                    )}>
                        {filteredAndSortedBookmarks.map((bookmark, index) => (
                            <BookmarkCard
                                key={bookmark.id}
                                bookmark={bookmark}
                                viewMode={viewMode}
                                onEdit={() => handleArticleClick(bookmark)}
                                onDelete={() => handleDeleteBookmark(bookmark.id)}
                                onShare={() => handleShareBookmark(bookmark)}
                                isDeleting={deletingBookmarks.has(bookmark.id)}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// Separate BookmarkCard component for better organization
function BookmarkCard({
    bookmark,
    viewMode,
    onEdit,
    onDelete,
    onShare,
    isDeleting,
    index
}: {
    bookmark: Bookmark
    viewMode: ViewMode
    onEdit: () => void
    onDelete: () => void
    onShare: () => void
    isDeleting: boolean
    index: number
}) {
    if (viewMode === 'list') {
        return (
            <Card
                className="group glass-card cursor-pointer hover:shadow-xl hover:bg-accent/5 transition-all duration-500 ease-out animate-fade-in-up border-x border-t border-border/50 hover:border-primary/20 border-b-0"
                onClick={onEdit}
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        {bookmark.imageUrl && (
                            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                                <Image
                                    src={bookmark.imageUrl}
                                    alt={bookmark.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    sizes="96px"
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300">
                                        {bookmark.title}
                                    </h3>
                                    {bookmark.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 group-hover:text-foreground/80 transition-colors duration-300">
                                            {bookmark.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3">
                                        {bookmark.publisher && (
                                            <Badge variant="outline" className="text-xs group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors duration-300">
                                                {bookmark.publisher}
                                            </Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-foreground/70 transition-colors duration-300">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(bookmark.articleUrl, '_blank') }}>
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open Article
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare() }}>
                                            <Share2 className="w-4 h-4 mr-2" />
                                            Share
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={(e) => { e.stopPropagation(); onDelete() }}
                                            disabled={isDeleting}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {isDeleting ? 'Removing...' : 'Remove'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            className="group glass-card cursor-pointer hover:shadow-2xl hover:-translate-y-2 hover:bg-accent/5 transition-all duration-500 ease-out animate-fade-in-up overflow-hidden border-x border-t border-border/50 hover:border-primary/20 border-b-0"
            onClick={onEdit}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {bookmark.imageUrl && (
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={bookmark.imageUrl}
                        alt={bookmark.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-colors duration-500" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(bookmark.articleUrl, '_blank') }}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Article
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare() }}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); onDelete() }}
                                disabled={isDeleting}
                                className="text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isDeleting ? 'Removing...' : 'Remove'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <CardContent className="p-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}</span>
                        {bookmark.publisher && (
                            <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors duration-300">
                                    {bookmark.publisher}
                                </Badge>
                            </>
                        )}
                    </div>

                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {bookmark.title}
                    </h3>

                    {bookmark.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 group-hover:text-foreground/80 transition-colors duration-300">
                            {bookmark.description}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 