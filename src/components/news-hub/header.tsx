'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { Search, Bell, Settings, User, LogOut, Sparkles, Zap, Menu, LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeSwitcher, ThemeSwitcherCompact } from '@/components/theme/theme-switcher'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface HeaderProps {
    onSearch: (query: string) => void
}

export function Header({ onSearch }: HeaderProps) {
    const { data: session } = useSession()
    const [searchQuery, setSearchQuery] = useState('')
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(searchQuery)
    }
    console.log(session)

    return (
        <header className={cn(
            "h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50",
            "transition-all duration-300 border-b border-border/50",
            "glass backdrop-blur-md",
            isScrolled ? "shadow-md bg-background/95" : "bg-background/90"
        )}>
            {/* Logo Section */}
            <div className="flex items-center space-x-3 min-w-0">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <Image
                        src="/logo.png"
                        alt="NewsHub Logo"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl font-bold text-gradient-primary truncate">
                        NewsHub
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block truncate">
                        Your shortcut to news
                    </p>
                </div>
            </div>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-xl mx-4 sm:mx-8">
                <form onSubmit={handleSearch} className="relative group">
                    <div className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 blur-xl",
                        "group-focus-within:opacity-100 transition-opacity duration-500"
                    )} />
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                        <Input
                            placeholder="Search news..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "pl-10 pr-4 h-10 rounded-xl border-border/50 relative z-10 bg-background/50",
                                "glass transition-all duration-300 placeholder:text-muted-foreground/70",
                                "focus:border-primary/50 focus:shadow-lg focus:bg-background/80"
                            )}
                        />
                        <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] text-muted-foreground/70 z-10">
                            ⌘K
                        </kbd>
                    </div>
                </form>
            </div>

            {/* Actions Section */}
            <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Theme Switcher */}
                <div className="hidden sm:block">
                    <ThemeSwitcher />
                </div>
                <div className="sm:hidden">
                    <ThemeSwitcherCompact />
                </div>

                {session ? (
                    <>
                        {/* Notifications - Hidden on mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "relative h-9 w-9 rounded-xl hidden md:flex",
                                "hover:scale-105 transition-all duration-300",
                                "hover:bg-primary/10"
                            )}
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full">
                                <span className="absolute inset-0.5 bg-background rounded-full" />
                            </span>
                        </Button>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "relative h-9 w-9 rounded-xl p-0",
                                        "hover:scale-105 transition-all duration-300",
                                        "hover:shadow-lg"
                                    )}
                                >
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={session.user.image || ''} alt={session.user?.name || ''} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-medium">
                                            {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Online indicator */}
                                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border border-background" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className={cn(
                                    "w-72 p-3 glass-card border animate-scale-in"
                                )}
                                align="end"
                                forceMount
                            >
                                {/* User Info */}
                                <div className={cn(
                                    "flex items-center space-x-3 p-3 rounded-xl mb-3",
                                    "bg-gradient-to-r from-primary/5 to-accent/5",
                                    "border border-primary/10"
                                )}>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-medium">
                                            {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{session.user?.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {session.user?.email}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <DropdownMenuItem className={cn(
                                    "cursor-pointer rounded-lg p-3 transition-all duration-200",
                                    "hover:bg-primary/5 focus:bg-primary/5"
                                )}>
                                    <User className="mr-3 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem className={cn(
                                    "cursor-pointer rounded-lg p-3 transition-all duration-200",
                                    "hover:bg-primary/5 focus:bg-primary/5"
                                )}>
                                    <Settings className="mr-3 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>

                                {/* Mobile notifications */}
                                <DropdownMenuItem className={cn(
                                    "cursor-pointer rounded-lg p-3 transition-all duration-200 md:hidden",
                                    "hover:bg-primary/5 focus:bg-primary/5"
                                )}>
                                    <Bell className="mr-3 h-4 w-4" />
                                    <span>Notifications</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="my-2" />

                                <DropdownMenuItem
                                    onClick={() => signOut()}
                                    className={cn(
                                        "cursor-pointer rounded-lg p-3 transition-all duration-200",
                                        "text-destructive focus:text-destructive",
                                        "hover:bg-destructive/10 focus:bg-destructive/10"
                                    )}
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <Button
                        onClick={() => signIn('google')}
                        size="sm"
                        className="shadow-glow px-6"
                    >
                        <LogIn className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Sign In</span>
                        <span className="sm:hidden">Join</span>
                    </Button>
                )}
            </div>
        </header>
    )
}