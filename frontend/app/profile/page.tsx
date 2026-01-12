"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserStats } from '@/components/profile/user-stats';
import { MyReports } from '@/components/profile/my-reports';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <main className="min-h-screen bg-neo-white bg-grid font-sans text-neo-black pt-24 pb-20 md:pb-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-white border-2 border-black shadow-neo p-6">
                    <Avatar className="w-24 h-24 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                        <AvatarFallback className="text-3xl font-black font-milestone bg-neo-lemon">{user?.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black font-sirukota uppercase tracking-wider text-neo-mint drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-shadow">{user?.displayName || 'Citizen User'}</h1>
                        <div className="font-mono font-bold text-neo-mint">{user?.email}</div>
                    </div>
                    <div className="md:ml-auto">
                        <EditProfileDialog />
                    </div>
                </div>

                <div className="space-y-8">
                    <UserStats />
                    <MyReports />
                </div>
            </div>
        </main>
    );
}
