import { UserStats } from '@/components/profile/user-stats';
import { MyReports } from '@/components/profile/my-reports';

export default function ProfilePage() {
    return (
        <main className="min-h-screen bg-background pt-20 pb-20 md:pb-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                    <div>
                        <h1 className="text-2xl font-bold">Citizen User</h1>
                        <div className="text-muted-foreground">Level 5 Guardian • New Delhi</div>
                    </div>
                    <button className="ml-auto border px-4 py-2 rounded-md text-sm hover:bg-muted">
                        Edit Profile
                    </button>
                </div>

                <div className="space-y-8">
                    <UserStats />
                    <MyReports />
                </div>
            </div>
        </main>
    );
}
