"use client";
import { useEffect, useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
    name: string;
    avatar_url: string;
    civic_rank: string;
    total_xp: number;
}

export function Leaderboard() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/leaderboard/')
            .then(res => res.json())
            .then(data => {
                setLeaders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load leaderboard", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
                <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                <h2 className="text-xl font-bold">Top Guardians</h2>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />)}
                </div>
            ) : (
                <div className="space-y-4">
                    {leaders.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full 
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-transparent text-muted-foreground'}`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="font-medium">{user.name || 'Anonymous'}</div>
                                    <div className="text-xs text-muted-foreground">{user.civic_rank}</div>
                                </div>
                            </div>
                            <div className="font-mono font-semibold text-primary">
                                {user.total_xp} XP
                            </div>
                        </div>
                    ))}

                    {leaders.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No active Guardians yet. Be the first!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
