"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Map, LayoutDashboard, PlusCircle, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { ModeToggle } from '@/components/mode-toggle';

export function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

    const isActive = (path: string) => pathname === path;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-neo-black md:top-0 md:bottom-auto md:border-b-2 md:border-t-0 p-4 bg-neo-white">
            <div className="container mx-auto max-w-7xl flex items-center justify-between">
                <Link href="/" className="hidden md:block">
                    <div className="bg-neo-lemon border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <span className="font-milestone text-xl font-bold tracking-tighter text-black">
                            SaafSaksham
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-6">
                    <ModeToggle />
                    {isAuthenticated ? (
                        <>
                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link
                                href="/profile"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </Link>
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                                        <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{user?.displayName || 'User'}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/auth/login">
                                <Button variant="ghost" size="sm" className="font-milestone hover:bg-neo-lemon hover:text-black hover:border-2 hover:border-black">Login</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button size="sm" className="font-milestone bg-neo-black text-neo-white hover:bg-neutral-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Nav */}
                <div className="flex md:hidden w-full justify-around items-center">
                    {isAuthenticated ? (
                        <>
                            <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}>
                                <Map className="w-6 h-6" />
                                <span className="text-xs">Map</span>
                            </Link>
                            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-primary -mt-8">
                                <div className="bg-black text-white p-4 rounded-full shadow-lg border-4 border-background">
                                    <PlusCircle className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium">Report</span>
                            </Link>
                            <Link href="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
                                <User className="w-6 h-6" />
                                <span className="text-xs">Profile</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
                                <Map className="w-6 h-6" />
                                <span className="text-xs">Home</span>
                            </Link>
                            <Link href="/auth/login" className={`flex flex-col items-center gap-1 ${isActive('/auth/login') ? 'text-primary' : 'text-muted-foreground'}`}>
                                <LogIn className="w-6 h-6" />
                                <span className="text-xs">Login</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
