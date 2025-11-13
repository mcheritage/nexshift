import { Head, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Shift {
    id: string;
    title: string;
    role: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    location: string;
    hourly_rate: number;
    applications_count: number;
    user_application_status: string | null;
    user_has_applied: boolean;
    care_home: {
        name: string;
        id: string;
    };
}

interface WorkerShiftsMinimalProps extends SharedData {
    shifts: {
        data: Shift[];
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
    isApproved?: boolean;
    approvalStatus?: string;
}

export default function WorkerShiftsMinimal({ shifts, filters, roleOptions, isApproved, approvalStatus }: WorkerShiftsMinimalProps) {
    const [selectedShift, setSelectedShift] = useState<string | null>(null);
    const [applicationMessage, setApplicationMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFilterChange = (field: string, value: string) => {
        const newFilters = { ...filters, [field]: value };
        // Remove empty filters
        Object.keys(newFilters).forEach(key => {
            if (!newFilters[key as keyof typeof newFilters]) {
                delete newFilters[key as keyof typeof newFilters];
            }
        });
        router.get('/worker/shifts', newFilters, { preserveState: true });
    };

    const handleApply = async (shiftId: string) => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await router.post(`/worker/shifts/${shiftId}/apply`, {
                message: applicationMessage
            }, {
                onSuccess: () => {
                    setSelectedShift(null);
                    setApplicationMessage('');
                },
                onError: (errors) => {
                    console.error('Application failed:', errors);
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Available Shifts" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Available Shifts</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Browse and apply for healthcare shifts
                    </p>
                </div>

                {/* Approval Status Warning */}
                {!isApproved && approvalStatus === 'pending' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 p-4 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                                    Account Pending Approval
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                    <p>
                                        Your account is currently pending approval. You will be able to view and apply for shifts once an administrator approves your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!isApproved && approvalStatus === 'rejected' && (
                    <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-400 p-4 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                                    Account Not Approved
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    <p>
                                        Your account application was not approved. Please contact support for more information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Filter Shifts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Role
                            </label>
                            <select 
                                value={filters.role || ''} 
                                onChange={(e) => handleFilterChange('role', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Any role</option>
                                {Object.entries(roleOptions || {}).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                placeholder="Search location..."
                                value={filters.location || ''}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={filters.date_from || ''}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Min Rate (£/hour)
                            </label>
                            <input
                                type="number"
                                placeholder="Min rate..."
                                value={filters.min_rate || ''}
                                onChange={(e) => handleFilterChange('min_rate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Shifts List */}
                {shifts.data && shifts.data.length > 0 ? (
                    <div className="space-y-4">
                        {shifts.data.map((shift) => (
                            <div key={shift.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {shift.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {shift.role} • {shift.care_home.name}
                                        </p>
                                        <div className="mt-2 text-sm text-gray-500">
                                            <p>📅 {shift.shift_date}</p>
                                            <p>🕒 {shift.start_time} - {shift.end_time}</p>
                                            <p>💰 £{shift.hourly_rate}/hour</p>
                                            <p>📍 {shift.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm mb-2">
                                            {shift.user_has_applied ? (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                                    Applied ({shift.user_application_status})
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                                    Available
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">
                                            {shift.applications_count} applicant(s)
                                        </p>
                                        {!shift.user_has_applied && (
                                            <Button
                                                onClick={() => setSelectedShift(shift.id)}
                                                size="sm"
                                            >
                                                Apply Now
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Shifts Available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            There are no published shifts available at the moment.
                        </p>
                    </div>
                )}

                {/* Application Modal */}
                {selectedShift && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Apply for Shift</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cover Message (Optional)
                                </label>
                                <textarea
                                    value={applicationMessage}
                                    onChange={(e) => setApplicationMessage(e.target.value)}
                                    placeholder="Tell the care home why you're a good fit for this shift..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedShift(null);
                                        setApplicationMessage('');
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleApply(selectedShift)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Applying...' : 'Submit Application'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}