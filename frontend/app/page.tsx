import { ReportForm } from '@/components/report/report-form';
import { TaskMap } from '@/components/map/task-map';
import { TaskFeed } from '@/components/feed/task-feed';
import { Leaderboard } from '@/components/leaderboard/leaderboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Map & Report Form */}
      <section className="relative h-[600px] w-full bg-muted/20">
        <div className="absolute inset-0">
          <TaskMap />
        </div>

        <div className="relative container mx-auto px-4 h-full pointer-events-none">
          <div className="flex h-full items-center justify-start max-w-7xl mx-auto">
            <div className="w-full max-w-md pointer-events-auto mt-20">
              <div className="mb-6 backdrop-blur-sm bg-background/80 p-6 rounded-2xl border shadow-lg">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                  Fix Your City. <br />
                  <span className="text-primary">Win Rewards.</span>
                </h1>
                <p className="text-muted-foreground text-lg">
                  Spot garbage or potholes? Snap a photo, get AI verification, and earn XP.
                </p>
              </div>

              <ReportForm />
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
