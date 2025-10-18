import { Head } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface ShiftsPageProps extends SharedData {
    shifts?: any;
    stats?: any;
    filters?: any;
}

export default function ShiftsIndex({ shifts, stats, filters }: ShiftsPageProps) {
    return (
        <AppLayout>
            <Head title="Shifts" />
            
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Shifts Management</h1>
                        <p className="text-gray-600 mt-1">Manage and track shifts for your care home</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-gray-600">Total Shifts</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_shifts || 0}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-gray-600">Published</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.published_shifts || 0}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-gray-600">Filled</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">{stats?.filled_shifts || 0}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-gray-600">Applications</h3>
                        <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.applications_count || 0}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">All Shifts</h2>
                        <a 
                            href="/shifts/create"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Post New Shift
                        </a>
                    </div>
                    
                    <div className="space-y-4">
                        {shifts?.data && shifts.data.length > 0 ? (
                            shifts.data.map((shift: any) => (
                                <div key={shift.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{shift.role}</h3>
                                            <p className="text-gray-600">{shift.location}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(shift.start_date_time).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">£{shift.hourly_rate}/hour</p>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                shift.status === 'published' ? 'bg-blue-100 text-blue-800' :
                                                shift.status === 'filled' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {shift.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No shifts posted yet.</p>
                                <a 
                                    href="/shifts/create"
                                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Post Your First Shift
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}