"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TaskCard } from '@/components/feed/task-card';

export function MyReports() {
    const [tasks, setTasks] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        // For MVP, fetch recent tasks as user's
        // Ideally: .eq('posted_by', user.id)
        async function fetchMyTasks() {
            const { data } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            if (data) setTasks(data);
        }
        fetchMyTasks();
    }, []);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}
