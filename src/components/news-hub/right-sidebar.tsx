'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Calendar, Users, Globe, Briefcase, Cpu, Trophy, Music, Heart, Microscope, MapPin, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type NewsCategory } from '@/types/news'

// Category configuration with icons and colors
const CATEGORY_CONFIG = {
    politics: { icon: Users, color: 'bg-red-100 text-red-700 hover:bg-red-200', count: 45 },
    business: { icon: Briefcase, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', count: 38 },
    technology: { icon: Cpu, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200', count: 52 },
    sports: { icon: Trophy, color: 'bg-green-100 text-green-700 hover:bg-green-200', count: 29 },
    entertainment: { icon: Music, color: 'bg-pink-100 text-pink-700 hover:bg-pink-200', count: 34 },
    health: { icon: Heart, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200', count: 41 },
    science: { icon: Microscope, color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200', count: 27 },
    world: { icon: Globe, color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200', count: 56 },
    india: { icon: MapPin, color: 'bg-amber-100 text-amber-700 hover:bg-amber-200', count: 48 },
    opinion: { icon: MessageSquare, color: 'bg-slate-100 text-slate-700 hover:bg-slate-200', count: 23 }
}

interface RightSidebarProps {
    selectedCategory?: NewsCategory | 'all'
    onCategorySelect?: (category: NewsCategory | 'all') => void
}

export function RightSidebar({ selectedCategory, onCategorySelect }: RightSidebarProps) {
    const trendingTopics = [
        { name: "AI Revolution", count: 234 },
        { name: "Climate Change", count: 189 },
        { name: "Space Exploration", count: 156 },
        { name: "Cryptocurrency", count: 143 },
        { name: "Healthcare", count: 127 }
    ]

    const handleCategoryClick = (category: string) => {
        if (onCategorySelect) {
            // If clicking the same category, deselect it (show all)
            onCategorySelect(selectedCategory === category ? 'all' : category as NewsCategory)
        }
    }

    return (
        <div className="space-y-6">
            {/* Popular Topics (Categories) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Popular Topics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
                            const Icon = config.icon
                            const isSelected = selectedCategory === category

                            return (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryClick(category)}
                                    className={cn(
                                        "flex items-center gap-2 p-3 rounded-lg transition-all duration-200",
                                        "border hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20",
                                        isSelected
                                            ? "border-primary bg-primary/10 shadow-md"
                                            : "border-border hover:border-primary/50",
                                        config.color
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-medium capitalize">
                                            {category}
                                        </span>
                                        <span className="text-xs opacity-70">
                                            {config.count}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {selectedCategory && selectedCategory !== 'all' && (
                        <button
                            onClick={() => onCategorySelect?.('all')}
                            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Clear filter • Show all topics
                        </button>
                    )}
                </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Trending Now
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {trendingTopics.map((topic, index) => (
                            <div key={topic.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-muted-foreground w-4">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm group-hover:text-primary transition-colors cursor-pointer">
                                        {topic.name}
                                    </span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {topic.count}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Today's Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Today's Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Articles Published</span>
                            <span className="font-semibold">1,247</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Active Readers</span>
                            <span className="font-semibold">89,423</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Breaking News</span>
                            <span className="font-semibold text-red-600">12</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
