'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, parseISO, format, isValid } from 'date-fns'
import {
    BookmarkIcon,
    Share2,
    TrendingUp,
    Clock,
    Heart,
    ExternalLink,
    ImageIcon
} from 'lucide-react'
import { NewsArticle } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface NewsFeedProps {
    articles: (NewsArticle & { source: string })[]
    searchQuery: string
}

// Utility function to format date strings
const formatArticleDate = (dateString: string): string => {
    try {
        let date: Date
        if (dateString.includes('T') || dateString.includes('-')) {
            date = parseISO(dateString)
        } else {
            date = new Date(dateString)
        }

        if (!isValid(date)) {
            return dateString
        }

        const now = new Date()
        const diffInDays = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

        if (diffInDays < 7) {
            return formatDistanceToNow(date, { addSuffix: true })
        } else {
            return format(date, 'MMM d, yyyy')
        }
    } catch (error) {
        return dateString
    }
}

export function NewsFeed({ articles, searchQuery }: NewsFeedProps) {
    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()
    const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set())
    const [bookmarkingArticles, setBookmarkingArticles] = useState<Set<string>>(new Set())
    const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set())

    const handleArticleClick = (article: NewsArticle & { source: string }) => {
        const params = new URLSearchParams({
            url: article.loc,
            title: article.news_title,
            publisher: article.publisher,
            date: article.news_publication_date,
            source: article.source,
        })

        if (article.news_image) {
            params.append('image', article.news_image)
        }

        router.push(`/article?${params.toString()}`)
    }

    const handleBookmark = async (article: NewsArticle & { source: string }, e: React.MouseEvent) => {
        e.stopPropagation()

        if (!session) {
            toast({
                title: "Authentication required",
                description: "Please sign in to bookmark articles.",
                variant: "destructive",
            })
            return
        }

        if (bookmarkedArticles.has(article.loc)) {
            toast({
                title: "Already bookmarked",
                description: "This article is already in your bookmarks.",
            })
            return
        }

        setBookmarkingArticles(prev => new Set([...prev, article.loc]))

        try {
            const response = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    articleUrl: article.loc,
                    title: article.news_title,
                    description: article.news_title,
                    imageUrl: article.news_image,
                    publisher: article.publisher,
                    tags: [article.source]
                }),
            })

            if (response.ok) {
                setBookmarkedArticles(prev => new Set([...prev, article.loc]))
                toast({
                    title: "Bookmarked!",
                    description: "Article saved to your collection.",
                })
            } else {
                const error = await response.json()
                if (response.status === 409) {
                    setBookmarkedArticles(prev => new Set([...prev, article.loc]))
                    toast({
                        title: "Already bookmarked",
                        description: "This article is already in your bookmarks.",
                    })
                } else {
                    throw new Error(error.error || 'Failed to bookmark article')
                }
            }
        } catch (err) {
            console.error('Error bookmarking article:', err)
            toast({
                title: "Error",
                description: "Failed to bookmark article. Please try again.",
                variant: "destructive",
            })
        } finally {
            setBookmarkingArticles(prev => {
                const newSet = new Set(prev)
                newSet.delete(article.loc)
                return newSet
            })
        }
    }

    const handleLike = (article: NewsArticle & { source: string }, e: React.MouseEvent) => {
        e.stopPropagation()

        if (!session) {
            toast({
                title: "Authentication required",
                description: "Please sign in to like articles.",
                variant: "destructive",
            })
            return
        }

        setLikedArticles(prev => {
            const newSet = new Set(prev)
            if (newSet.has(article.loc)) {
                newSet.delete(article.loc)
                toast({
                    title: "Unliked",
                    description: "Removed from your liked articles.",
                })
            } else {
                newSet.add(article.loc)
                toast({
                    title: "Liked!",
                    description: "Added to your liked articles.",
                })
            }
            return newSet
        })
    }

    const getSourceColor = (source: string) => {
        const colors: Record<string, string> = {
            'thehindu': 'bg-red-500',
            'indianexpress': 'bg-blue-500',
            'economictimes': 'bg-green-500'
        }
        return colors[source] || 'bg-gray-500'
    }

    const formatSourceName = (source: string) => {
        const sourceNames: Record<string, string> = {
            'thehindu': 'The Hindu',
            'indianexpress': 'Indian Express',
            'economictimes': 'Economic Times'
        }
        return sourceNames[source] || source
    }

    if (articles.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-8">
                <div className={cn(
                    "text-center max-w-md",
                    "animate-fade-in-up"
                )}>
                    <div className="relative mb-6">
                        <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">No articles found</h3>
                    <p className="text-muted-foreground">
                        {searchQuery ? `No articles match "${searchQuery}"` : 'No articles available at the moment.'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-full dot-grid-bg my-8 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {articles.map((article, index) => {
                        const isBookmarked = bookmarkedArticles.has(article.loc)
                        const isBookmarking = bookmarkingArticles.has(article.loc)
                        const isLiked = likedArticles.has(article.loc)

                        return (
                            <Card
                                key={`${article.loc}-${index}`}
                                className={cn(
                                    "news-card group relative flex flex-col h-full",
                                    "cursor-pointer transition-transform duration-200 ease-out"
                                )}
                                onClick={() => handleArticleClick(article)}
                            >
                                {/* Image Section */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                                    {article.news_image ? (
                                        <Image
                                            src={article.news_image}
                                            alt={article.news_title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted">
                                            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                                        </div>
                                    )}

                                    {/* Source Badge */}
                                    <div className="absolute top-4 left-4">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm backdrop-blur-md",
                                            getSourceColor(article.source)
                                        )}>
                                            {formatSourceName(article.source)}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex flex-col flex-1 p-5">
                                    {/* Meta */}
                                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-3">
                                        <span>{article.publisher}</span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatArticleDate(article.news_publication_date)}</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold leading-snug text-foreground mb-3 line-clamp-3 group-hover:text-primary transition-colors">
                                        {article.news_title}
                                    </h3>

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "h-8 w-8 rounded-full",
                                                    isLiked && "text-red-500 bg-red-50 dark:bg-red-950/30"
                                                )}
                                                onClick={(e) => handleLike(article, e)}
                                            >
                                                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "h-8 w-8 rounded-full",
                                                    isBookmarked && "text-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                                )}
                                                onClick={(e) => handleBookmark(article, e)}
                                                disabled={isBookmarking}
                                            >
                                                <BookmarkIcon className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigator.clipboard.writeText(article.loc)
                                                    toast({ title: "Link copied!" })
                                                }}
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="text-xs font-semibold rounded-lg h-8 px-4"
                                        >
                                            Read More <ExternalLink className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
