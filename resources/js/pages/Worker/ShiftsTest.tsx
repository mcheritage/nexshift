import { Head } from '@inertiajs/react';
import { SharedData } from '@/types';

interface WorkerShiftsTestProps extends SharedData {
    shifts: {
        data: any[];
        links: any[];
        meta: any;
    };
    filters: {
        role?: string;
        location?: string;
        date_from?: string;
        date_to?: string;
        min_rate?: number;
    };
    roleOptions: Record<string, string>;
}

export default function WorkerShiftsTest({ shifts, filters, roleOptions }: WorkerShiftsTestProps) {
    console.log('Worker Shifts Props:', { shifts, filters, roleOptions });
    
    return (
        <div>
            <Head title="Worker Shifts Test" />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Worker Shifts Test</h1>
                    
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h2 className="text-xl font-semibold mb-4">Data Check</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Shifts:</strong> {Array.isArray(shifts.data) ? shifts.data.length : 'Not an array'}</p>
                            <p><strong>Role Options:</strong> {typeof roleOptions === 'object' ? Object.keys(roleOptions).length + ' options' : 'Not an object'}</p>
                            <p><strong>Filters:</strong> {JSON.stringify(filters, null, 2)}</p>
                        </div>
                    </div>

                    {shifts.data && shifts.data.length > 0 ? (
                        <div className="space-y-4">
                            {shifts.data.slice(0, 3).map((shift: any, index: number) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="font-semibold">{shift.title || 'No Title'}</h3>
                                    <p><strong>Role:</strong> {shift.role || 'No Role'}</p>
                                    <p><strong>Date:</strong> {shift.shift_date || 'No Date'}</p>
                                    <p><strong>Rate:</strong> £{shift.hourly_rate || 0}/hour</p>
                                    <p><strong>Care Home:</strong> {shift.care_home?.name || 'No Care Home'}</p>
                                    <p><strong>User Applied:</strong> {shift.user_has_applied ? 'Yes' : 'No'}</p>
                                </div>
                            ))}
                            {shifts.data.length > 3 && (
                                <p className="text-gray-600">...and {shifts.data.length - 3} more shifts</p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <p className="text-gray-600">No shifts available</p>
                        </div>
                    )}

                    <div className="mt-8 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Role Options</h2>
                        {roleOptions && typeof roleOptions === 'object' ? (
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(roleOptions).map(([key, label]) => (
                                    <div key={key} className="text-sm">
                                        <strong>{key}:</strong> {label}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">Role options not available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}