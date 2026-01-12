import { formatDistanceToNow } from 'date-fns';
import { MapPin, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface Task {
    id: string;
    category: string;
    status: string;
    location: string;
    media_urls: string[];
    created_at: string;
    ai_confidence: number;
}

export function TaskCard({ task }: { task: Task }) {
    return (
        <div className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video relative bg-muted">
                {task.media_urls?.[0] ? (
                    <img
                        src={task.media_urls[0]}
                        alt={task.category}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No Image
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md ${task.status === 'verified' ? 'bg-green-500/20 text-green-700 border-green-200' :
                            task.status === 'open' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-200' :
                                'bg-gray-500/20 text-gray-700'
                        }`}>
                        {task.status}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-semibold capitalize text-lg">{task.category || 'Issue'}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                        </div>
                    </div>
                    {task.ai_confidence > 0.7 && (
                        <div className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            AI Verified
                        </div>
                    )}
                </div>

                <div className="flex space-x-2 mt-4">
                    <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                        Verify
                    </button>
                    <button className="flex-1 border bg-background py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors">
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
}
