"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Map, LayoutDashboard, PlusCircle } from 'lucide-react';

export function Navigation() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:top-0 md:bottom-auto md:border-b md:border-t-0 p-4">
            <div className="container mx-auto max-w-7xl flex items-center justify-between">
                <Link href="/" className="hidden md:block text-2xl font-bold text-primary">
                    SaafSaksham
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link
                        href="/"
                        className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <Map className="w-4 h-4" />
                        Explore
                    </Link>
                    <Link
                        href="/profile"
                        className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
                        Connect Wallet
                    </button>
                </div>

                {/* Mobile Nav */}
                <div className="flex md:hidden w-full justify-around items-center">
                    <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
                        <Map className="w-6 h-6" />
                        <span className="text-xs">Map</span>
                    </Link>
                    <Link href="/" className="flex flex-col items-center gap-1 text-primary -mt-8">
                        <div className="bg-black text-white p-4 rounded-full shadow-lg border-4 border-background">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium">Report</span>
                    </Link>
                    <Link href="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
                        <User className="w-6 h-6" />
                        <span className="text-xs">Profile</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
