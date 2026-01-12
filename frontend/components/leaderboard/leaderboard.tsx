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
        // Try 127.0.0.1 to avoid localhost resolution issues on Windows
        fetch('http://127.0.0.1:8000/api/leaderboard')
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                setLeaders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load leaderboard", err);
                // Fallback mock data for demo if backend is offline
                setLeaders([
                    { name: 'Sarah J.', avatar_url: '', civic_rank: 'Urban Guardian', total_xp: 2400 },
                    { name: 'Mike T.', avatar_url: '', civic_rank: 'Community Scout', total_xp: 1850 },
                    { name: 'Priya R.', avatar_url: '', civic_rank: 'Eco Warrior', total_xp: 1600 },
                ]);
                setLoading(false);
            });
    }, []);

    return (
        <div className="bg-neo-white border-2 border-black shadow-neo p-6">
            <div className="flex items-center mb-6 border-b-2 border-black pb-4">
                <Trophy className="w-8 h-8 text-neo-black mr-2 stroke-[3px]" />
                <h2 className="text-2xl font-black font-sirukota tracking-tighter text-neo-black">TOP GUARDIANS</h2>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-black/5 animate-pulse border-2 border-transparent" />)}
                </div>
            ) : (
                <div className="space-y-4">
                    {leaders.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border-2 border-black hover:bg-neo-blue transition-colors hover:shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-neo-white">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 flex items-center justify-center font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-neo-black
                    ${index === 0 ? 'bg-neo-lemon' :
                                        index === 1 ? 'bg-gray-300' :
                                            index === 2 ? 'bg-orange-300' : 'bg-neo-white'}`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="font-bold font-story text-lg text-neo-black">{user.name || 'Anonymous'}</div>
                                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">{user.civic_rank}</div>
                                </div>
                            </div>
                            <div className="font-black font-milestone text-xl text-neo-black">
                                {user.total_xp} XP
                            </div>
                        </div>
                    ))}

                    {leaders.length === 0 && (
                        <div className="text-center font-bold font-mono py-8 border-2 border-dashed border-black bg-white/50">
                            No active Guardians yet. Be the first!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
