'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    Home,
    Bookmark,
    TrendingUp,
    Globe,
    Users,
    Hash,
    Filter,
    ChevronRight,
    Sparkles,
    Calendar,
    Archive,
    Star,
    Building2,
    Monitor,
    Briefcase,
    Trophy,
    Music,
    Heart,
    Microscope,
    Earth,
    MapPin,
    MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { NewsCategory } from '@/types/news'

interface LeftSidebarProps {
    sources: string[]
    selectedSource: string | null
    selectedCategory: NewsCategory | 'all'
    onSourceSelect: (source: string | null) => void
    onCategorySelect: (category: NewsCategory | 'all') => void
    isCollapsed?: boolean
}

export function LeftSidebar({
    sources,
    selectedSource,
    selectedCategory,
    onSourceSelect,
    onCategorySelect,
    isCollapsed = false
}: LeftSidebarProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [bookmarkCount, setBookmarkCount] = useState(0)

    useEffect(() => {
        if (session) {
            fetch('/api/bookmarks')
                .then(res => res.json())
                .then(data => setBookmarkCount(data.length || 0))
                .catch(console.error)
        }
    }, [session])

    const handleNavigation = (navItem: string) => {
        switch (navItem) {
            case 'Bookmarks':
                if (session) {
                    router.push('/bookmarks')
                }
                break
            case 'Home':
                router.push('/')
                break
            default:
                break
        }
    }

    const navigation = [
        {
            name: 'Home',
            icon: Home,
            current: true,
            action: () => handleNavigation('Home'),
            description: 'Latest news feed'
        },
        {
            name: 'Bookmarks',
            icon: Bookmark,
            count: bookmarkCount,
            action: () => handleNavigation('Bookmarks'),
            description: 'Saved articles'
        },
        {
            name: 'Trending',
            icon: TrendingUp,
            description: 'Popular stories'
        },
        {
            name: 'Archive',
            icon: Archive,
            description: 'Past articles'
        },
    ]

    const quickTopics = [
        { name: 'politics' as NewsCategory, count: 45, icon: Building2, color: 'text-blue-600' },
        { name: 'technology' as NewsCategory, count: 32, icon: Monitor, color: 'text-purple-600' },
        { name: 'business' as NewsCategory, count: 28, icon: Briefcase, color: 'text-green-600' },
        { name: 'sports' as NewsCategory, count: 19, icon: Trophy, color: 'text-orange-600' },
        { name: 'entertainment' as NewsCategory, count: 15, icon: Music, color: 'text-pink-600' },
        { name: 'health' as NewsCategory, count: 12, icon: Heart, color: 'text-red-600' },
        { name: 'science' as NewsCategory, count: 8, icon: Microscope, color: 'text-cyan-600' },
        { name: 'world' as NewsCategory, count: 25, icon: Earth, color: 'text-indigo-600' },
        { name: 'india' as NewsCategory, count: 18, icon: MapPin, color: 'text-amber-600' },
        { name: 'opinion' as NewsCategory, count: 14, icon: MessageSquare, color: 'text-slate-600' },
    ]

    const formatSourceName = (source: string) => {
        const sourceNames: Record<string, string> = {
            'thehindu': 'The Hindu',
            'indianexpress': 'Indian Express',
            'economictimes': 'Economic Times'
        }
        return sourceNames[source] || source
    }

    const getSourceGradient = (source: string) => {
        const gradients: Record<string, string> = {
            'thehindu': 'from-red-500 to-pink-500',
            'indianexpress': 'from-blue-500 to-cyan-500',
            'economictimes': 'from-green-500 to-emerald-500'
        }
        return gradients[source] || 'from-gray-500 to-slate-500'
    }

    const getSourceShortName = (source: string) => {
        const shortNames: Record<string, string> = {
            'thehindu': 'TH',
            'indianexpress': 'IE',
            'economictimes': 'ET'
        }
        return shortNames[source] || source.slice(0, 2).toUpperCase()
    }

    if (isCollapsed) {
        return (
            <TooltipProvider>
                <div className="flex flex-col h-full w-16">
                    <div className="p-3 border-b border-border/50">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary-foreground" />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 px-2">
                        <div className="py-4 space-y-6">
                            {/* Navigation Icons */}
                            <div className="space-y-1">
                                {navigation.map((item) => (
                                    <Tooltip key={item.name}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={item.current ? "secondary" : "ghost"}
                                                size="icon"
                                                className={cn(
                                                    "w-10 h-10 rounded-lg relative transition-all duration-200",
                                                    item.current && "bg-primary/10 text-primary hover:bg-primary/15"
                                                )}
                                                onClick={item.action}
                                                disabled={item.name === 'Bookmarks' && !session}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.count !== undefined && item.count > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                                        <span className="text-xs text-primary-foreground font-medium">
                                                            {item.count > 9 ? '9+' : item.count}
                                                        </span>
                                                    </div>
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="ml-2">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.description}</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>

                            {/* Source Icons */}
                            <div className="space-y-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={selectedSource === null ? "secondary" : "ghost"}
                                            size="icon"
                                            className={cn(
                                                "w-10 h-10 rounded-lg transition-all duration-200",
                                                selectedSource === null && "bg-primary/10 text-primary hover:bg-primary/15"
                                            )}
                                            onClick={() => onSourceSelect(null)}
                                        >
                                            <Globe className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="ml-2">
                                        <div>
                                            <p className="font-medium">All Sources</p>
                                            <p className="text-xs text-muted-foreground">Complete coverage</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>

                                {sources.map((source) => (
                                    <Tooltip key={source}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={selectedSource === source ? "secondary" : "ghost"}
                                                size="icon"
                                                className={cn(
                                                    "w-10 h-10 rounded-lg transition-all duration-200 text-xs font-bold",
                                                    selectedSource === source && "bg-primary/10 text-primary hover:bg-primary/15"
                                                )}
                                                onClick={() => onSourceSelect(source)}
                                            >
                                                <div className={cn(
                                                    "w-6 h-6 rounded-md bg-gradient-to-r flex items-center justify-center text-white text-xs font-bold",
                                                    getSourceGradient(source)
                                                )}>
                                                    {getSourceShortName(source)}
                                                </div>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="ml-2">
                                            <div>
                                                <p className="font-medium">{formatSourceName(source)}</p>
                                                <p className="text-xs text-muted-foreground">Trusted source</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>

                            {/* Topic Icons */}
                            <div className="grid grid-cols-2 gap-1">
                                {quickTopics.slice(0, 4).map((topic) => (
                                    <Tooltip key={topic.name}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-6 h-6 text-xs rounded-md"
                                            >
                                                <topic.icon className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="ml-2">
                                            <div>
                                                <p className="font-medium">{topic.name}</p>
                                                <p className="text-xs text-muted-foreground">{topic.count} articles</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="p-2 border-t border-border/50">
                        <div className="w-2 h-2 bg-green-400 rounded-full mx-auto animate-pulse" />
                    </div>
                </div>
            </TooltipProvider>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">Explore</h2>
                        <p className="text-xs text-muted-foreground">Discover content</p>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 px-4">
                <div className="py-6 space-y-8">
                    {/* Quick Navigation */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Navigate
                        </h3>
                        <nav className="space-y-1">
                            {navigation.map((item) => (
                                <Button
                                    key={item.name}
                                    variant={item.current ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start h-11 rounded-xl group transition-all duration-200",
                                        item.current && "bg-primary/10 text-primary hover:bg-primary/15"
                                    )}
                                    onClick={item.action}
                                    disabled={item.name === 'Bookmarks' && !session}
                                >
                                    <item.icon className="mr-3 h-4 w-4" />
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                                            {item.description}
                                        </div>
                                    </div>
                                    {item.count !== undefined && (
                                        <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary">
                                            {item.count}
                                        </Badge>
                                    )}
                                    {item.name === 'Bookmarks' && !session && (
                                        <Badge variant="outline" className="ml-auto text-xs">
                                            Sign in
                                        </Badge>
                                    )}
                                    <ChevronRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            ))}
                        </nav>
                    </div>

                    {/* News Sources */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Sources
                            </h3>
                            <Filter className="h-3 w-3 text-muted-foreground/60" />
                        </div>
                        <div className="space-y-1">
                            <Button
                                variant={selectedSource === null ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start h-11 rounded-xl group transition-all duration-200",
                                    selectedSource === null && "bg-primary/10 text-primary hover:bg-primary/15"
                                )}
                                onClick={() => onSourceSelect(null)}
                            >
                                <div className="p-1.5 mr-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                                    <Globe className="h-3 w-3 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">All Sources</div>
                                    <div className="text-xs text-muted-foreground">
                                        Complete coverage
                                    </div>
                                </div>
                                <ChevronRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                            {sources.map((source) => (
                                <Button
                                    key={source}
                                    variant={selectedSource === source ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start h-11 rounded-xl group transition-all duration-200",
                                        selectedSource === source && "bg-primary/10 text-primary hover:bg-primary/15"
                                    )}
                                    onClick={() => onSourceSelect(source)}
                                >
                                    <div className={cn(
                                        "w-6 h-6 mr-3 rounded-lg bg-gradient-to-r flex items-center justify-center",
                                        getSourceGradient(source)
                                    )}>
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="font-medium truncate">{formatSourceName(source)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Trusted source
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Topics */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Popular Topics
                        </h3>
                        <div className="space-y-1">
                            <Button
                                variant={selectedCategory === 'all' ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 h-auto p-3 rounded-xl transition-all duration-200",
                                    selectedCategory === 'all' && "bg-primary/10 text-primary hover:bg-primary/15"
                                )}
                                onClick={() => onCategorySelect('all')}
                            >
                                <div className="flex items-center gap-3">
                                    <Globe className="w-4 h-4" />
                                    <span className="text-sm font-medium">All Topics</span>
                                </div>
                            </Button>

                            {quickTopics.map((topic) => (
                                <Button
                                    key={topic.name}
                                    variant={selectedCategory === topic.name ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-between h-auto p-3 rounded-xl transition-all duration-200 group",
                                        selectedCategory === topic.name && "bg-primary/10 text-primary hover:bg-primary/15"
                                    )}
                                    onClick={() => onCategorySelect(topic.name)}
                                >
                                    <div className="flex items-center gap-3">
                                        <topic.icon className={cn("w-4 h-4", topic.color)} />
                                        <span className="text-sm font-medium capitalize">{topic.name}</span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs bg-muted-foreground/10">
                                        {topic.count}
                                    </Badge>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Daily Highlight */}
                    {session && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                For You
                            </h3>
                            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
                                        <Star className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm mb-1">Today&apos;s Highlights</h4>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            3 trending stories in your interests
                                        </p>
                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                            View →
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Quick Stats Footer */}
            <div className="p-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Updated now</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>24/7 coverage</span>
                    </div>
                </div>
            </div>
        </div>
    )
}