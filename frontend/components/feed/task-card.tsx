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
        <div className="bg-neo-white border-2 border-black shadow-neo hover:shadow-hover transition-all duration-200">
            <div className="aspect-video relative bg-gray-100 border-b-2 border-black">
                {task.media_urls?.[0] ? (
                    <img
                        src={task.media_urls[0]}
                        alt={task.category}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
                        No Image
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`px-2 py-1 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${task.status === 'verified' ? 'bg-neo-mint text-neo-black' :
                        task.status === 'open' ? 'bg-neo-lemon text-neo-black' :
                            'bg-gray-200 text-gray-700'
                        }`}>
                        {task.status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-black font-sirukota uppercase text-xl tracking-tight">{task.category || 'Issue'}</h3>
                        <div className="flex items-center text-sm font-bold font-mono text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                        </div>
                    </div>
                    {task.ai_confidence > 0.7 && (
                        <div className="flex items-center text-xs font-bold bg-neo-blue border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-neo-black">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            AI VERIFIED
                        </div>
                    )}
                </div>

                <div className="flex space-x-2 mt-4">
                    <button className="flex-1 bg-neo-black text-white border-2 border-black py-2 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
                        VERIFY
                    </button>
                    <button className="flex-1 bg-neo-white text-neo-black border-2 border-black py-2 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 dark:hover:bg-neutral-800 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
                        DETAILS
                    </button>
                </div>
            </div>
        </div>
    );
}
