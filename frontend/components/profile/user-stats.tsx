"use client";
import { Award, Zap, Target } from 'lucide-react';

import { ActivityChart } from './activity-chart';

export function UserStats() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neo-white border-2 border-black shadow-neo p-6 text-center hover:shadow-hover transition-all">
                    <div className="bg-neo-lemon border-2 border-black w-12 h-12 flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Award className="w-6 h-6 text-neo-black" />
                    </div>
                    <div className="text-3xl font-black font-milestone">1,250</div>
                    <div className="text-sm font-bold font-mono text-muted-foreground uppercase tracking-wider">Total XP</div>
                </div>
                <div className="bg-neo-white border-2 border-black shadow-neo p-6 text-center hover:shadow-hover transition-all">
                    <div className="bg-neo-blue border-2 border-black w-12 h-12 flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Zap className="w-6 h-6 text-neo-black" />
                    </div>
                    <div className="text-3xl font-black font-milestone">12</div>
                    <div className="text-sm font-bold font-mono text-muted-foreground uppercase tracking-wider">Verified</div>
                </div>
                <div className="bg-neo-white border-2 border-black shadow-neo p-6 text-center hover:shadow-hover transition-all">
                    <div className="bg-neo-mint border-2 border-black w-12 h-12 flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Target className="w-6 h-6 text-neo-black" />
                    </div>
                    <div className="text-3xl font-black font-milestone">98%</div>
                    <div className="text-sm font-bold font-mono text-muted-foreground uppercase tracking-wider">Accuracy</div>
                </div>
            </div>

            <div className="h-[400px]">
                <ActivityChart />
            </div>
        </div>
    );
}
