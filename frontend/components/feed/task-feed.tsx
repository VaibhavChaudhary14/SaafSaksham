"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TaskCard } from './task-card';

export function TaskFeed() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchTasks() {
            // Fetch recent tasks
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                setTasks(data);
            }
            setLoading(false);
        }

        fetchTasks();

        // Realtime subscription
        const channel = supabase
            .channel('tasks-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, (payload) => {
                setTasks((prev) => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground font-mono animate-pulse">LOADING FEED...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
                <h2 className="text-3xl font-black font-sirukota tracking-tighter uppercase">Community Reports</h2>
                <span className="text-sm font-bold font-mono bg-neo-lemon border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">{tasks.length} ACTIVE ISSUES</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}
