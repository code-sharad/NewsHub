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
    X,
    ChevronRight
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
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left section */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="rounded-full hover:bg-muted/50 -ml-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <BookmarkIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight font-serif">Library</h1>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        {bookmarks.length} {bookmarks.length === 1 ? 'Saved Article' : 'Saved Articles'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right section */}
                        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 md:flex-none md:w-64 lg:w-80 group">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search your library..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 transition-all rounded-full"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full hover:bg-muted"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 border-l pl-2 ml-1 border-border/50">
                                {/* Filters */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted/50">
                                            <Filter className="w-4 h-4" />
                                            {selectedPublisher && (
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>Filter by Publisher</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setSelectedPublisher('')}>
                                            <span className={selectedPublisher === '' ? 'font-medium text-primary' : ''}>
                                                All Publishers
                                            </span>
                                        </DropdownMenuItem>
                                        {publishers.map(publisher => (
                                            <DropdownMenuItem
                                                key={publisher}
                                                onClick={() => setSelectedPublisher(publisher)}
                                            >
                                                <span className={selectedPublisher === publisher ? 'font-medium text-primary' : ''}>
                                                    {publisher}
                                                </span>
                                            </DropdownMenuItem>
                                        ))}
                                        {(searchQuery || selectedPublisher) && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={clearFilters} className="text-destructive focus:text-destructive">
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
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50">
                                            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setSortBy('date')}>
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span className={sortBy === 'date' ? 'font-medium text-primary' : ''}>Date Added</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortBy('title')}>
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            <span className={sortBy === 'title' ? 'font-medium text-primary' : ''}>Title</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortBy('publisher')}>
                                            <Archive className="w-4 h-4 mr-2" />
                                            <span className={sortBy === 'publisher' ? 'font-medium text-primary' : ''}>Publisher</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                                            {sortOrder === 'asc' ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
                                            {sortOrder === 'asc' ? 'Newest First' : 'Oldest First'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* View Mode */}
                                <div className="hidden sm:flex bg-muted/50 rounded-full p-1 border border-border/50">
                                    <Button
                                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        onClick={() => setViewMode('grid')}
                                        className={cn("h-7 w-7 rounded-full", viewMode === 'grid' && "bg-background shadow-sm")}
                                    >
                                        <Grid3X3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        onClick={() => setViewMode('list')}
                                        className={cn("h-7 w-7 rounded-full", viewMode === 'list' && "bg-background shadow-sm")}
                                    >
                                        <List className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active filters */}
                    {(searchQuery || selectedPublisher) && (
                        <div className="flex items-center gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active filters:</span>
                            {searchQuery && (
                                <Badge variant="secondary" className="gap-1 rounded-full px-3 font-normal">
                                    Search: <span className="font-medium">{searchQuery}</span>
                                    <X className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" onClick={() => setSearchQuery('')} />
                                </Badge>
                            )}
                            {selectedPublisher && (
                                <Badge variant="secondary" className="gap-1 rounded-full px-3 font-normal">
                                    Publisher: <span className="font-medium">{selectedPublisher}</span>
                                    <X className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" onClick={() => setSelectedPublisher('')} />
                                </Badge>
                            )}
                            <Button variant="link" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground hover:text-destructive h-auto p-0 ml-2">
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {filteredAndSortedBookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in duration-500">
                        <div className="text-center p-8 max-w-md">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-white/10">
                                <BookmarkIcon className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 font-serif tracking-tight">
                                {searchQuery || selectedPublisher ? 'No matching bookmarks' : 'Your library is empty'}
                            </h3>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                {searchQuery || selectedPublisher
                                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                                    : 'Start saving articles you want to read later. They will appear here for easy access.'}
                            </p>
                            {!searchQuery && !selectedPublisher && (
                                <Button
                                    onClick={() => router.push('/')}
                                    className="rounded-full px-8 shadow-lg hover:shadow-primary/25 transition-all hover:scale-105"
                                    size="lg"
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
                            ? 'grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'space-y-4 max-w-4xl mx-auto'
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
                className="group glass-card cursor-pointer hover:shadow-xl hover:bg-accent/5 transition-all duration-300 ease-out border border-border/50 hover:border-primary/20 overflow-hidden"
                onClick={onEdit}
            >
                <CardContent className="p-4 sm:p-5">
                    <div className="flex gap-4 sm:gap-5">
                        {bookmark.imageUrl && (
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-sm ring-1 ring-border/10">
                                <Image
                                    src={bookmark.imageUrl}
                                    alt={bookmark.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    sizes="(max-width: 640px) 96px, 128px"
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 font-serif">
                                        {bookmark.title}
                                    </h3>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1"
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
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                {isDeleting ? 'Removing...' : 'Remove'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {bookmark.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                        {bookmark.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dashed border-border/50">
                                {bookmark.publisher && (
                                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-5 font-medium bg-secondary/50 group-hover:bg-secondary transition-colors">
                                        {bookmark.publisher}
                                    </Badge>
                                )}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            className="group glass-card cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out overflow-hidden border border-border/50 hover:border-primary/20 flex flex-col h-full"
            onClick={onEdit}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {bookmark.imageUrl && (
                <div className="relative aspect-video overflow-hidden">
                    <Image
                        src={bookmark.imageUrl}
                        alt={bookmark.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-0"
                            onClick={(e) => { e.stopPropagation(); onShare() }}
                        >
                            <Share2 className="w-3.5 h-3.5" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(bookmark.articleUrl, '_blank') }}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Article
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={(e) => { e.stopPropagation(); onDelete() }}
                                    disabled={isDeleting}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {isDeleting ? 'Removing...' : 'Remove'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {bookmark.publisher && (
                        <div className="absolute bottom-3 left-3">
                            <Badge variant="secondary" className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-0 text-xs font-medium px-2.5 py-0.5">
                                {bookmark.publisher}
                            </Badge>
                        </div>
                    )}
                </div>
            )}

            <CardContent className="p-5 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}</span>
                    </div>

                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 font-serif">
                        {bookmark.title}
                    </h3>

                    {bookmark.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {bookmark.description}
                        </p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-dashed border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="hover:text-foreground transition-colors">Read full article</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
            </CardContent>
        </Card>
    )
}