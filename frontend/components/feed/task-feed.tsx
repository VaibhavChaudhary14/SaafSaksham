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

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading community updates...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Community Reports</h2>
                <span className="text-sm text-muted-foreground">{tasks.length} active issues</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}
