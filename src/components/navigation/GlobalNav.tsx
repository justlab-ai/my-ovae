
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Moon, LogOut, Settings, LifeBuoy, CircleUser } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import { DockProvider, Dock, dockItems } from '@/components/navigation/Dock';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from 'react-error-boundary';

import { useTheme } from 'next-themes';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Logo } from '../logo';

const BackButton = () => {
    const router = useRouter();
    const pathname = usePathname();

    const showBackButton = ![
        '/',
        '/login',
        '/onboarding/welcome',
        '/onboarding/journey-status',
        '/onboarding/body-mapping',
        '/onboarding/notifications',
        '/onboarding/privacy',
        '/onboarding/theme-selection',
        '/onboarding/completion',
        '/dashboard'
    ].includes(pathname);

    return (
        <AnimatePresence>
            {showBackButton && (
                <m.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="fixed top-5 left-5 z-[1001]"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="glass-card-auth h-12 w-12 rounded-full"
                    >
                        <ArrowLeft />
                    </Button>
                </m.div>
            )}
        </AnimatePresence>
    )
}

const NavErrorFallback = () => (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1000] p-4 rounded-lg bg-destructive/80 text-destructive-foreground">
        <p>Navigation failed to load.</p>
    </div>
);

const UserMenu = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Use NextAuth's signOut
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    if (!mounted) {
        return <Skeleton className="size-9 rounded-full" />;
    }

    if (user) {
        const initials = user.name
            ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
            : user.email?.substring(0, 2).toUpperCase() || 'U';

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-accent transition-colors">
                        <div className="relative">
                            <Avatar className="size-9">
                                {user.image && <AvatarImage src={user.image} />}
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-background bg-green-500 size-3" />
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>{user.name || user.email || "My Account"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                        <DropdownMenuItem>
                            <CircleUser className="mr-2 size-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/referrals">
                        {/* Placeholder for future features */}
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <div className="flex items-center justify-between w-full">
                            <Label htmlFor="dark-mode-toggle" className="flex items-center gap-2 font-normal cursor-pointer">
                                <Moon className="size-4" />
                                <span>Dark Mode</span>
                            </Label>
                            <Switch
                                id="dark-mode-toggle"
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => {
                                    setTheme(checked ? 'dark' : 'light')
                                }}
                            />
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 size-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return null;
}


export function GlobalNav({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const showNavElements = ![
        '/',
        '/login',
        '/onboarding/welcome',
        '/onboarding/journey-status',
        '/onboarding/body-mapping',
        '/onboarding/notifications',
        '/onboarding/privacy',
        '/onboarding/theme-selection',
        '/onboarding/completion',
    ].includes(pathname);

    return (
        <DockProvider>
            {showNavElements && (
                <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
                    <m.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Logo size="sm" />
                    </m.div>

                    <m.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <UserMenu />
                    </m.div>
                </header>
            )}
            <BackButton />
            <div id="app-container" className="h-full">
                {children}
            </div>
            {showNavElements && (
                <div style={{ display: mounted ? 'block' : 'none' }}>
                    <ErrorBoundary FallbackComponent={NavErrorFallback}>
                        <Dock>
                            {dockItems.map((item) => (
                                <Dock.Item
                                    key={item.href}
                                    href={item.href}
                                    icon={item.icon}
                                    label={item.label}
                                />
                            ))}
                        </Dock>
                    </ErrorBoundary>
                </div>
            )}
        </DockProvider>
    );
}

