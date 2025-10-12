import { Head } from '@inertiajs/react';
import { SharedData } from '@/types';

interface WorkerDashboardTestProps extends SharedData {
    availableShifts: any[];
    myApplications: any[];
    stats: {
        available_shifts: number;
        my_applications: number;
        accepted_applications: number;
        pending_applications: number;
    };
}

export default function WorkerDashboardTest({ availableShifts, myApplications, stats }: WorkerDashboardTestProps) {
    console.log('Worker Dashboard Props:', { availableShifts, myApplications, stats });
    
    return (
        <div>
            <Head title="Worker Dashboard Test" />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Worker Dashboard Test</h1>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Stats</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.available_shifts}</div>
                                <div className="text-sm text-gray-600">Available Shifts</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">{stats.pending_applications}</div>
                                <div className="text-sm text-gray-600">Pending Applications</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.accepted_applications}</div>
                                <div className="text-sm text-gray-600">Accepted Applications</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{stats.my_applications}</div>
                                <div className="text-sm text-gray-600">Total Applications</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Data Check</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Available Shifts:</strong> {Array.isArray(availableShifts) ? availableShifts.length : 'Not an array'}</p>
                            <p><strong>My Applications:</strong> {Array.isArray(myApplications) ? myApplications.length : 'Not an array'}</p>
                            <p><strong>Stats object:</strong> {JSON.stringify(stats, null, 2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}