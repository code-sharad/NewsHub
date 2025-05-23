'use client'

import { useState } from 'react'
import { NewsArticle } from '@/lib/api'
import { useNewsAggregated } from '@/lib/hooks/useNews'
import { Header } from './header'
import { LeftSidebar } from './left-sidebar'
import { NewsFeed } from './news-feed'
import { RightSidebar } from './right-sidebar'
import { LoadingScreen, NewsCardSkeleton } from '@/components/ui/loading-screen'
import { TrendingUp, Menu, AlertCircle, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const ARTICLES_PER_PAGE = 10

export function NewsHub() {
    const {
        data: newsData,
        allArticles,
        isLoading,
        isError,
        hasPartialData,
        totalArticles,
        queries
    } = useNewsAggregated()

    const [selectedSource, setSelectedSource] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [articlesShown, setArticlesShown] = useState(ARTICLES_PER_PAGE)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Show loading screen on initial load
    if (isLoading && !hasPartialData) {
        return <LoadingScreen message="Fetching the latest news..." />
    }

    // Prepare articles for display
    const filteredArticles = allArticles.filter(article => {
        const matchesSource = selectedSource === 'all' || article.source === selectedSource
        const matchesSearch = !searchQuery ||
            article.news_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.publisher.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSource && matchesSearch
    })

    const visibleArticles = filteredArticles.slice(0, articlesShown)
    const hasMoreArticles = filteredArticles.length > articlesShown

    const handleLoadMore = () => {
        setArticlesShown(prev => prev + ARTICLES_PER_PAGE)
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        setArticlesShown(ARTICLES_PER_PAGE)
    }

    const handleSourceFilter = (source: string | null) => {
        setSelectedSource(source || 'all')
        setArticlesShown(ARTICLES_PER_PAGE)
        setMobileMenuOpen(false) // Close mobile menu after selection
    }

    const handleRefresh = () => {
        queries.forEach(query => query.refetch())
        setArticlesShown(ARTICLES_PER_PAGE)
    }

    return (
        <div className="min-h-screen bg-background">
            <Header onSearch={handleSearch} />

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Desktop Sidebar */}
                <aside className={cn(
                    "hidden lg:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm",
                    "transition-all duration-300 ease-in-out relative",
                    sidebarCollapsed ? "w-16" : "w-80"
                )}>
                    {/* Sidebar Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={cn(
                            "absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md",
                            "hover:scale-110 transition-all duration-200"
                        )}
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="h-3 w-3" />
                        ) : (
                            <ChevronLeft className="h-3 w-3" />
                        )}
                    </Button>

                    <div className="flex-1 overflow-hidden transition-all duration-300">
                        <LeftSidebar
                            sources={['thehindu', 'indianexpress', 'economictimes']}
                            selectedSource={selectedSource === 'all' ? null : selectedSource}
                            onSourceSelect={handleSourceFilter}
                            isCollapsed={sidebarCollapsed}
                        />
                    </div>
                </aside>

                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetContent side="left" className="w-80 p-0">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Navigation</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(false)}
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <LeftSidebar
                            sources={['thehindu', 'indianexpress', 'economictimes']}
                            selectedSource={selectedSource === 'all' ? null : selectedSource}
                            onSourceSelect={handleSourceFilter}
                            isCollapsed={false}
                        />
                    </SheetContent>
                </Sheet>

                {/* Main Content Area */}
                <main className={cn(
                    "flex-1 flex flex-col overflow-hidden",
                    "transition-all duration-300"
                )}>
                    {/* Source Filter Bar (Mobile/Tablet) */}
                    <div className="lg:hidden border-b border-border/50 bg-card/30 backdrop-blur-sm p-4">
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(true)}
                                className="flex-shrink-0 h-9 w-9"
                            >
                                <Menu className="h-4 w-4" />
                            </Button>

                            <div className="flex gap-2">
                                {['all', 'thehindu', 'indianexpress', 'economictimes'].map((source) => (
                                    <Button
                                        key={source}
                                        variant={selectedSource === source ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleSourceFilter(source === 'all' ? null : source)}
                                        className="flex-shrink-0 h-8 px-3 text-xs"
                                    >
                                        {source === 'all' ? 'All' :
                                            source === 'thehindu' ? 'Hindu' :
                                                source === 'indianexpress' ? 'Express' : 'ET'}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* News Feed */}
                        <div className="flex-1 overflow-y-auto">
                            {isError && !hasPartialData ? (
                                <div className="flex items-center justify-center min-h-full p-8">
                                    <div className={cn(
                                        "text-center glass-card max-w-md",
                                        "animate-fade-in-up"
                                    )}>
                                        <div className="relative mb-6">
                                            <AlertCircle className="w-16 h-16 mx-auto text-destructive animate-pulse" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-destructive/20 rounded-full blur-xl" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-destructive">Failed to load news</h3>
                                        <p className="text-muted-foreground mb-4">
                                            We couldn't fetch the latest news. Please try again.
                                        </p>
                                        <Button
                                            onClick={handleRefresh}
                                            className={cn(
                                                "bg-gradient-to-r from-primary to-accent text-primary-foreground",
                                                "hover:scale-105 transition-all duration-300"
                                            )}
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Try Again
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <NewsFeed
                                        articles={visibleArticles}
                                        searchQuery={searchQuery}
                                    />

                                    {/* Loading skeletons while fetching more */}
                                    {isLoading && hasPartialData && (
                                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-8">
                                            {[...Array(3)].map((_, i) => (
                                                <NewsCardSkeleton key={`skeleton-${i}`} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Load More Button */}
                                    {!isLoading && hasMoreArticles && (
                                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                            <div className="text-center">
                                                <Button
                                                    onClick={handleLoadMore}
                                                    size="lg"
                                                    className={cn(
                                                        "px-8 py-3 rounded-xl font-medium",
                                                        "bg-gradient-to-r from-primary to-accent text-primary-foreground",
                                                        "hover:scale-105 transition-all duration-300",
                                                        "shadow-glow hover:shadow-neon"
                                                    )}
                                                >
                                                    <TrendingUp className="w-4 h-4 mr-2" />
                                                    Load {Math.min(ARTICLES_PER_PAGE, filteredArticles.length - articlesShown)} more articles
                                                </Button>
                                                <p className="text-xs text-muted-foreground mt-3">
                                                    Showing {visibleArticles.length} of {filteredArticles.length} articles
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* End of feed message */}
                                    {!hasMoreArticles && visibleArticles.length > 0 && (
                                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                                            <div className={cn(
                                                "text-center glass-card border-primary/20",
                                                "animate-fade-in-up"
                                            )}>
                                                <div className="text-gradient-primary text-xl font-semibold mb-3">
                                                    You're all caught up! 🎉
                                                </div>
                                                <p className="text-muted-foreground">
                                                    You've seen all {filteredArticles.length} articles. Check back later for more news.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Right Sidebar - Hidden on smaller screens */}
                        <aside className="hidden xl:block w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto">
                            <RightSidebar />
                        </aside>
                    </div>
                </main>
            </div>

            {/* Floating Action Button - Only for Refresh */}
            <Button
                onClick={handleRefresh}
                disabled={isLoading}
                className={cn(
                    "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-2xl",
                    "bg-gradient-to-r from-primary to-accent text-primary-foreground",
                    "hover:scale-110 transition-all duration-300",
                    "lg:hidden", // Only show on mobile/tablet
                    isLoading && "animate-spin"
                )}
            >
                <RefreshCw className="h-5 w-5" />
            </Button>
        </div>
    )
} 