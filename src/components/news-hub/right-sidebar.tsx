'use client'

import { useSession } from 'next-auth/react'
import {
    Plus,
    MessageSquare,
    Users,
    TrendingUp,
    Clock,
    ChevronRight,
    Sparkles,
    Calendar,
    Star,
    Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function RightSidebar() {
    const { data: session } = useSession()

    const trendingTopics = [
        {
            topic: "Economic Policy",
            articles: 12,
            growth: "+15%",
            hot: true
        },
        {
            topic: "Climate Change",
            articles: 8,
            growth: "+8%",
            hot: false
        },
        {
            topic: "Tech Industry",
            articles: 15,
            growth: "+22%",
            hot: true
        },
        {
            topic: "Healthcare",
            articles: 6,
            growth: "+5%",
            hot: false
        }
    ]

    const recentActivity = [
        {
            type: "bookmark",
            text: "15 articles bookmarked today",
            time: "2 hours ago",
            icon: Star
        },
        {
            type: "trending",
            text: "Tech news trending up 25%",
            time: "4 hours ago",
            icon: TrendingUp
        },
        {
            type: "discussion",
            text: "3 new discussions started",
            time: "6 hours ago",
            icon: MessageSquare
        }
    ]

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-accent to-primary">
                        <Activity className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">Activity</h2>
                        <p className="text-xs text-muted-foreground">Stay updated</p>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 px-4">
                <div className="py-6 space-y-8">
                    {/* Quick Action */}
                    {session && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Quick Actions
                            </h3>
                            <Card className={cn(
                                "glass-card border-primary/20 overflow-hidden relative p-4",
                                "hover:border-primary/40 transition-all duration-300"
                            )}>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                                <div className="relative text-center space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center mx-auto">
                                        <Plus className="w-5 h-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm mb-1">Start Discussion</h4>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Share thoughts on latest news
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full h-8 rounded-lg bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-200"
                                    >
                                        <Plus className="w-3 h-3 mr-2" />
                                        New Post
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Trending Topics */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Trending Now
                            </h3>
                            <TrendingUp className="h-3 w-3 text-muted-foreground/60" />
                        </div>
                        <div className="space-y-2">
                            {trendingTopics.map((item, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "p-3 rounded-xl border border-border/50 hover:border-primary/30",
                                        "transition-all duration-200 cursor-pointer group",
                                        "hover:bg-primary/5"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                                                {item.topic}
                                            </h4>
                                            {item.hot && (
                                                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{item.articles} articles</span>
                                        <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600 border-0">
                                            {item.growth}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    {session && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Your Activity
                            </h3>
                            <div className="space-y-2">
                                {recentActivity.map((activity, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-xl",
                                            "hover:bg-muted/50 transition-all duration-200 cursor-pointer"
                                        )}
                                    >
                                        <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                                            <activity.icon className="w-3 h-3 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-foreground/90 leading-tight">
                                                {activity.text}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Daily Summary */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Today's Summary
                        </h3>
                        <Card className="glass-card border-border/50 p-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span className="font-medium text-sm">Today</span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        Updated
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="p-2 rounded-lg bg-muted/30">
                                        <div className="text-lg font-bold text-primary">24</div>
                                        <div className="text-xs text-muted-foreground">Articles</div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-muted/30">
                                        <div className="text-lg font-bold text-primary">8</div>
                                        <div className="text-xs text-muted-foreground">Trending</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Tips */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Quick Tip
                        </h3>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1">
                                        Stay Informed
                                    </h4>
                                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                                        Bookmark articles to read later and build your personal news collection.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Footer Stats */}
            <div className="p-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>1.2K online</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>Live updates</span>
                    </div>
                </div>
            </div>
        </div>
    )
} 