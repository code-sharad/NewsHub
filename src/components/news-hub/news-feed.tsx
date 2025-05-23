'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, parseISO, format, isValid } from 'date-fns'
import {
    BookmarkIcon,
    MessageSquare,
    Share2,
    TrendingUp,
    Clock,
    Eye,
    Sparkles,
    Heart,
    ArrowUpRight,
    Zap,
    ExternalLink,
    ImageIcon
} from 'lucide-react'
import { NewsArticle } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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
        // Handle various date formats
        let date: Date

        // Try parsing as ISO string first
        if (dateString.includes('T') || dateString.includes('-')) {
            date = parseISO(dateString)
        } else {
            // Try parsing as regular date string
            date = new Date(dateString)
        }

        // Check if date is valid
        if (!isValid(date)) {
            return dateString // Return original if parsing fails
        }

        // Check if date is recent (within last 7 days)
        const now = new Date()
        const diffInDays = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

        if (diffInDays < 7) {
            // Show relative time for recent articles
            return formatDistanceToNow(date, { addSuffix: true })
        } else {
            // Show formatted date for older articles
            return format(date, 'MMM d, yyyy')
        }
    } catch (error) {
        // Fallback to original string if all parsing fails
        return dateString
    }
}

// Fallback image component
const ArticleImageFallback = ({ article, sourceGradient }: {
    article: NewsArticle & { source: string },
    sourceGradient: string
}) => (
    <div className={cn(
        "relative aspect-[4/3] rounded-xl overflow-hidden",
        "border border-border/30 group-hover:border-primary/30 transition-colors duration-300",
        "bg-gradient-to-br from-muted/20 to-muted/40",
        "flex items-center justify-center"
    )}>
        <div className="text-center space-y-3 p-4">
            <div className={cn(
                "w-12 h-12 rounded-full bg-gradient-to-r mx-auto flex items-center justify-center",
                sourceGradient
            )}>
                <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                    {article.publisher}
                </p>
                <p className="text-xs text-muted-foreground/70">
                    News Article
                </p>
            </div>
        </div>

        {/* Source indicator */}
        <div className="absolute top-3 left-3">
            <div className={cn(
                "w-3 h-3 rounded-full bg-gradient-to-r shadow-lg",
                sourceGradient
            )} />
        </div>
    </div>
)

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

    const getSourceGradient = (source: string) => {
        const gradients: Record<string, string> = {
            'thehindu': 'from-red-500 to-pink-500',
            'indianexpress': 'from-blue-500 to-cyan-500',
            'economictimes': 'from-green-500 to-emerald-500'
        }
        return gradients[source] || 'from-gray-500 to-slate-500'
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
                    "text-center glass-card max-w-md",
                    "animate-fade-in-up"
                )}>
                    <div className="relative mb-6">
                        <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground animate-float" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gradient-primary">No articles found</h3>
                    <p className="text-muted-foreground">
                        {searchQuery ? `No articles match "${searchQuery}"` : 'No articles available at the moment.'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full dot-grid-bg mt-12 ">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, index) => {
                        const isBookmarked = bookmarkedArticles.has(article.loc)
                        const isBookmarking = bookmarkingArticles.has(article.loc)
                        const isLiked = likedArticles.has(article.loc)

                        return (
                            <Card
                                key={`${article.loc}-${index}`}
                                className={cn(
                                    "news-card cursor-pointer group relative overflow-hidden",
                                    "animate-fade-in-up transition-all duration-300 ease-out",
                                    "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
                                    "bg-card/80 backdrop-blur-sm border border-border/60",
                                    "rounded-2xl p-0 h-[420px]"
                                )}
                                style={{ animationDelay: `${index * 100}ms` }}
                                onClick={() => handleArticleClick(article)}
                            >
                                {/* Image Section - Top */}
                                <div className="relative h-52 overflow-hidden rounded-t-2xl">
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
                                        <div className={cn(
                                            "w-full h-full bg-gradient-to-br flex items-center justify-center",
                                            getSourceGradient(article.source)
                                        )}>
                                            <div className="text-center text-white">
                                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-90" />
                                                <p className="text-sm font-medium opacity-90">
                                                    {formatSourceName(article.source)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Source indicator */}
                                    <div className="absolute top-3 left-3">
                                        <div className={cn(
                                            "px-2 py-1 rounded-lg text-xs font-medium text-white",
                                            "bg-black/30 backdrop-blur-sm border border-white/20"
                                        )}>
                                            {formatSourceName(article.source)}
                                        </div>
                                    </div>

                                    {/* Floating Action Buttons */}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "w-9 h-9 rounded-xl transition-all duration-200",
                                                "bg-white/10 backdrop-blur-md border border-white/20",
                                                "hover:bg-white/20 text-white shadow-lg",
                                                isBookmarked
                                                    ? "bg-blue-500/80 hover:bg-blue-500"
                                                    : "hover:bg-blue-500/50"
                                            )}
                                            onClick={(e) => handleBookmark(article, e)}
                                            disabled={isBookmarking}
                                        >
                                            <BookmarkIcon className={cn(
                                                "w-4 h-4 transition-all duration-200",
                                                (isBookmarked || isBookmarking) && "fill-current",
                                                isBookmarking && "animate-pulse"
                                            )} />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "w-9 h-9 rounded-xl transition-all duration-200",
                                                "bg-white/10 backdrop-blur-md border border-white/20",
                                                "hover:bg-white/20 text-white shadow-lg hover:bg-green-500/50"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigator.share?.({
                                                    title: article.news_title,
                                                    url: article.loc
                                                }) || navigator.clipboard.writeText(article.loc)
                                                toast({
                                                    title: "Link copied!",
                                                    description: "Article link copied to clipboard.",
                                                })
                                            }}
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Content Section - Bottom */}
                                <div className="p-5 flex flex-col justify-between h-[212px]">
                                    <div className="space-y-3">
                                        {/* Meta info */}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    "bg-gradient-to-r", getSourceGradient(article.source)
                                                )} />
                                                <span className="font-medium">{article.publisher}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatArticleDate(article.news_publication_date)}</span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className={cn(
                                            "text-lg font-bold leading-tight line-clamp-3",
                                            "text-foreground group-hover:text-primary",
                                            "transition-colors duration-300"
                                        )}>
                                            {article.news_title}
                                        </h3>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 px-3 rounded-lg text-xs font-medium",
                                                "transition-all duration-200",
                                                isLiked
                                                    ? "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
                                                    : "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                            )}
                                            onClick={(e) => handleLike(article, e)}
                                        >
                                            <Heart className={cn(
                                                "w-3.5 h-3.5 mr-1",
                                                isLiked && "fill-current"
                                            )} />
                                            Like
                                        </Button>

                                        <Button
                                            size="sm"
                                            className={cn(
                                                "h-8 px-3 rounded-lg text-xs font-medium",
                                                "bg-primary text-primary-foreground",
                                                "hover:bg-primary/90 transition-all duration-200",
                                                "shadow-sm hover:shadow-md"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleArticleClick(article)
                                            }}
                                        >
                                            Read
                                            <ExternalLink className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Hover indicator */}
                                <div className={cn(
                                    "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r",
                                    getSourceGradient(article.source),
                                    "transform scale-x-0 group-hover:scale-x-100",
                                    "transition-transform duration-300 origin-left"
                                )} />
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
} 
