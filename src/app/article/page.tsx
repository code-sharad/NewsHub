'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    ArrowLeft,
    BookmarkIcon,
    Share2,
    ExternalLink,
    Clock,
    User,
    MessageSquare,
    Heart,
    Eye,
    Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { ResizablePanel } from '@/components/ui/resizable-panel'
import { ArticleAnalysisDisplay } from '@/components/article-analysis'

interface ArticleContent {
    title?: string
    content?: string
    author?: string
    publishedDate?: string
    summary?: string
    image?: string
    tags?: string[]
    error?: string
}

function ArticlePageContent() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [article, setArticle] = useState<ArticleContent | null>(null)
    const [loading, setLoading] = useState(true)
    const [bookmarked, setBookmarked] = useState(false)
    const [bookmarking, setBookmarking] = useState(false)
    const [showAnalysis, setShowAnalysis] = useState(false)
    const [analysis, setAnalysis] = useState<any>(null)
    const [analysisLoading, setAnalysisLoading] = useState(false)
    const [analysisError, setAnalysisError] = useState<string | null>(null)

    const articleUrl = searchParams.get('url')
    const originalTitle = searchParams.get('title')
    const originalPublisher = searchParams.get('publisher')
    const originalImage = searchParams.get('image')
    const originalDate = searchParams.get('date')
    const originalSource = searchParams.get('source')

    useEffect(() => {
        const fetchArticleContent = async () => {
            if (!articleUrl) return

            try {
                setLoading(true)
                const response = await fetch('/api/article-content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: articleUrl })
                })

                const data = await response.json()

                if (response.ok) {
                    setArticle(data)
                } else {
                    throw new Error(data.error || 'Failed to fetch article')
                }
            } catch (error) {
                console.error('Error fetching article:', error)
                toast({
                    title: "Error",
                    description: "Failed to load article content. Please try again.",
                    variant: "destructive",
                })
                // Use fallback data from URL params
                setArticle({
                    title: originalTitle || 'Article Title',
                    content: 'Unable to load full article content. Please visit the original source.',
                    author: originalPublisher || 'Unknown',
                    publishedDate: originalDate || new Date().toISOString(),
                    image: originalImage || undefined
                })
            } finally {
                setLoading(false)
            }
        }

        if (!articleUrl) {
            router.push('/')
            return
        }

        fetchArticleContent()
    }, [articleUrl, router, originalTitle, originalPublisher, originalDate, originalImage, toast])

    const handleBookmark = async () => {
        if (!session) {
            toast({
                title: "Authentication required",
                description: "Please sign in to bookmark articles.",
                variant: "destructive",
            })
            return
        }

        if (!articleUrl || !article?.title) return

        setBookmarking(true)

        try {
            const response = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    articleUrl,
                    title: article.title,
                    description: article.summary || article.title,
                    imageUrl: article.image || originalImage,
                    publisher: article.author || originalPublisher,
                    tags: [originalSource]
                }),
            })

            if (response.ok) {
                setBookmarked(true)
                toast({
                    title: "Bookmarked!",
                    description: "Article saved to your bookmarks.",
                })
            } else {
                const error = await response.json()
                if (response.status === 409) {
                    setBookmarked(true)
                    toast({
                        title: "Already bookmarked",
                        description: "This article is already in your bookmarks.",
                    })
                } else {
                    throw new Error(error.error || 'Failed to bookmark article')
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to bookmark article. Please try again.",
                variant: "destructive",
            })
        } finally {
            setBookmarking(false)
        }
    }

    const handleShare = async () => {
        if (navigator.share && articleUrl) {
            try {
                await navigator.share({
                    title: article?.title || originalTitle || undefined,
                    text: article?.summary,
                    url: window.location.href,
                })
            } catch (error) {
                // Fallback to copying to clipboard
                navigator.clipboard.writeText(window.location.href)
                toast({
                    title: "Link copied!",
                    description: "Article link copied to clipboard.",
                })
            }
        } else {
            navigator.clipboard.writeText(window.location.href)
            toast({
                title: "Link copied!",
                description: "Article link copied to clipboard.",
            })
        }
    }

    const handleAnalyzeArticle = async () => {
        if (!articleUrl) return

        setShowAnalysis(true)
        setAnalysisLoading(true)
        setAnalysisError(null)

        try {
            // Helper function to strip HTML tags from content
            const stripHtml = (html: string) => {
                if (!html) return ''
                const tmp = document.createElement('DIV')
                tmp.innerHTML = html
                return tmp.textContent || tmp.innerText || ''
            }

            // Helper function to format date to DD-MM-YYYY format
            const formatDate = (dateString: string) => {
                if (!dateString) return new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
                try {
                    const date = new Date(dateString)
                    const day = String(date.getDate()).padStart(2, '0')
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const year = date.getFullYear()
                    return `${day}-${month}-${year}`
                } catch {
                    return dateString
                }
            }

            // First, check if analysis exists in database (POST route - NO LLM CALL)
            const checkResponse = await fetch('/api/article-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: articleUrl }),
            })

            if (checkResponse.ok) {
                // Analysis found in database - use cached version
                const cachedData = await checkResponse.json()
                setAnalysis(cachedData.analysis)
                toast({
                    title: "Analysis loaded",
                    description: "Using cached analysis from database (no LLM call needed).",
                })
                return
            }

            // Analysis not found in database - need to call LLM
            if (checkResponse.status === 404) {
                // Prepare article data for analysis
                console.log(article)
                const articleData = {
                    headline: article?.title || originalTitle || '',
                    summary: article?.summary || '',
                    source: originalSource || '',
                    date: formatDate(article?.publishedDate || originalDate || ''),
                    url: articleUrl,
                    content: stripHtml(article?.content || '')
                }


                // Call LLM API to generate analysis
                // The API expects the fields directly in the root object, not nested
                const llmResponse = await fetch(`https://sharad31-news-agent.hf.space/api/analyze-news`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(articleData),
                })

                const llmData = await llmResponse.json()

                if (llmResponse.ok) {
                    // Save analysis to database using POST route
                    setAnalysis(llmData)
                    const saveResponse = await fetch('/api/article-analysis', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            articleData: llmData,
                            url: articleUrl
                        }),
                    })

                    const saveData = await saveResponse.json()
                    if (saveResponse.ok) {
                        toast({
                            title: "Analysis complete",
                            description: "Article analyzed and saved to database.",
                        })
                    } else {
                        console.warn('Failed to save to database:', saveData.error)
                        toast({
                            title: "Analysis complete",
                            description: "Analysis generated but failed to save to database.",
                            variant: "default"
                        })
                    }
                } else {
                    throw new Error(llmData.error || 'Failed to analyze article')
                }
            } else {
                throw new Error('Failed to check database for existing analysis')
            }
        } catch (error) {
            console.error('Error analyzing article:', error)
            setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze article')
            toast({
                title: "Error",
                description: "Failed to analyze article. Please try again.",
                variant: "destructive",
            })
        } finally {
            setAnalysisLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Floating Analysis Button */}
            {!showAnalysis && articleUrl && (
                <div className="fixed bottom-8 right-8 z-50 group">
                    <Button
                        onClick={handleAnalyzeArticle}
                        className="h-14 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200
                        bg-black dark:bg-white text-white dark:text-black
                        hover:bg-gray-800 dark:hover:bg-gray-100
                        flex items-center gap-3 font-medium
                        group-hover:scale-105 transform"
                        aria-label="Analyze Article with AI"
                    >
                        <Brain className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
                        <span className="text-sm">AI Analysis</span>
                    </Button>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 dark:bg-blue-400/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
            )}

            {/* Analysis Sidebar */}
            {showAnalysis && (
                <ResizablePanel
                    title="Article Analysis"
                    onClose={() => {
                        setShowAnalysis(false)
                        setAnalysis(null)
                        setAnalysisError(null)
                    }}
                    defaultWidth={50}
                    minWidth={30}
                    maxWidth={70}
                >
                    <ArticleAnalysisDisplay
                        analysis={analysis}
                        loading={analysisLoading}
                        error={analysisError}
                    />
                </ResizablePanel>
            )}

            {/* Header */}
            <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center text-black dark:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex items-center space-x-2 text-black dark:text-white">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBookmark}
                            disabled={bookmarking}
                            className={bookmarked ? 'text-blue-600' : ''}
                        >
                            <BookmarkIcon className={`w-4 h-4 mr-1 ${bookmarked ? 'fill-current' : ''}`} />
                            {bookmarking ? 'Saving...' : bookmarked ? 'Saved' : 'Save'}
                        </Button>

                        <Button variant="ghost" size="sm" onClick={handleShare}>
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                        </Button>

                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={articleUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-black "
                            >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Original
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Card className="bg-white dark:bg-gray-950">
                    <CardHeader className="pb-6">
                        {/* Article Meta */}
                        <div className="flex items-center gap-2 mb-4">
                            {originalSource && (
                                <Badge variant="outline" className="capitalize text-black">
                                    {originalSource.replace(/([A-Z])/g, ' $1').trim()}
                                </Badge>
                            )}
                            <div className="flex items-center text-sm text-gray-900 dark:text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {article?.publishedDate || originalDate ?
                                    formatDistanceToNow(new Date(article?.publishedDate || originalDate!), { addSuffix: true }) :
                                    'Recently'
                                }
                            </div>
                            {article?.author && (
                                <div className="flex items-center text-sm text-gray-900 dark:text-gray-400">
                                    <User className="w-3 h-3 mr-1" />
                                    {article.author}
                                </div>
                            )}
                        </div>

                        {/* Article Title */}
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                            {article?.title || originalTitle || 'Article Title'}
                        </h1>

                        {/* Article Summary */}
                        {article?.summary && (
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                {article.summary}
                            </p>
                        )}

                        {/* Article Image */}
                        {(article?.image || originalImage) && (
                            <div className="relative w-full h-96 rounded-lg overflow-hidden mt-6">
                                <Image
                                    src={article?.image || originalImage!}
                                    alt={article?.title || originalTitle || 'Article image'}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                />
                            </div>
                        )}
                    </CardHeader>

                    <CardContent>
                        <Separator className="mb-6" />

                        {/* Article Content */}
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            {article?.content ? (
                                <div
                                    className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line"
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                            ) : (
                                <div className="text-gray-600 dark:text-gray-400 text-center py-8">
                                    <p>Article content could not be loaded.</p>
                                    <Button variant="outline" className="mt-4" asChild>
                                        <a
                                            href={articleUrl || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Read on original site
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Article Actions */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center text-black dark:text-white justify-between">
                                <div className="flex items-center space-x-4">
                                    <Button variant="ghost" size="sm">
                                        <Heart className="w-4 h-4 mr-1" />
                                        Like
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <MessageSquare className="w-4 h-4 mr-1" />
                                        Discuss
                                    </Button>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Eye className="w-4 h-4 mr-1" />
                                        {/* {Math.floor(Math.random() * 1000) + 100} views */}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBookmark}
                                        disabled={bookmarking}
                                        className={bookmarked ? 'text-blue-600' : ''}
                                    >
                                        <BookmarkIcon className={`w-4 h-4 mr-1 ${bookmarked ? 'fill-current' : ''}`} />
                                        {bookmarking ? 'Saving...' : bookmarked ? 'Saved' : 'Save'}
                                    </Button>

                                    <Button variant="ghost" size="sm" onClick={handleShare}>
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function ArticlePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
                </div>
            </div>
        }>
            <ArticlePageContent />
        </Suspense>
    )
}