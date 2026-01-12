"use client";
import { Award, Zap, Target } from 'lucide-react';

export function UserStats() {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border rounded-xl p-4 text-center">
                <div className="bg-yellow-100 text-yellow-700 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold font-mono">1,250</div>
                <div className="text-xs text-muted-foreground">Total XP</div>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
                <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold font-mono">12</div>
                <div className="text-xs text-muted-foreground">Reports Verified</div>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
                <div className="bg-green-100 text-green-700 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold font-mono">98%</div>
                <div className="text-xs text-muted-foreground">Accuracy Score</div>
            </div>
        </div>
    );
}
