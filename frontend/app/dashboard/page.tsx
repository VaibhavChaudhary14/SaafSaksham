"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ReportForm } from '@/components/report/report-form';
import { TaskMap } from '@/components/map/task-map';
import { TaskFeed } from '@/components/feed/task-feed';
import { Leaderboard } from '@/components/leaderboard/leaderboard';

export default function Dashboard() {
  const { loading, isAuthenticated } = useAuth();
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
    <main className="min-h-screen bg-neo-white font-sans text-neo-black pb-20 md:pb-0">
      {/* Hero Section with Map & Report Form */}
      <section className="w-full bg-grid border-b-4 border-black py-12 lg:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">

            {/* Left Column: Title & Report Form */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="bg-neo-white border-2 border-black shadow-neo p-8">
                <h1 className="font-sirukota text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-none">
                  FIX YOUR CITY. <br />
                  <span className="text-neo-pink underline decoration-4 underline-offset-4 decoration-black px-1">WIN REWARDS.</span>
                </h1>
                <p className="font-story text-xl font-bold border-l-4 border-black pl-4">
                  Snap a photo, get AI verification, and earn XP.
                </p>
              </div>

              <ReportForm />
            </div>

            {/* Right Column: Square Map */}
            <div className="w-full lg:w-1/2 sticky top-24">
              <div className="bg-white p-2 border-2 border-black shadow-neo">
                <TaskMap className="w-full aspect-square border-2 border-black" />
              </div>
              <div className="mt-4 flex items-center justify-between font-mono font-bold text-sm bg-neo-lemon border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span>LIVE ACTIVE ZONES</span>
                <span>DELHI NCR</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed Column */}
          <div className="lg:col-span-2">
            <TaskFeed />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <Leaderboard />

            {/* Stats Card (Placeholder) */}
            <div className="bg-primary/5 border rounded-xl p-6">
              <h3 className="font-semibold mb-2">Your Impact</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Total Reports</span>
                <span className="font-bold text-xl">12</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[60%]"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">150 XP to next level</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
