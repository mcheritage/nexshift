import { Head, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Timer, XCircle } from 'lucide-react';

interface Shift {
    id: string;
    title: string;
    role: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    start_datetime: string;
    end_datetime: string;
    location: string;
    hourly_rate: number;
    break_duration: number;
    break_paid: boolean;
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

    const calculateTotalPay = (shift: Shift) => {
        const start = new Date(shift.start_datetime);
        const end = new Date(shift.end_datetime);
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        
        const breakHours = shift.break_duration / 60;
        const billableHours = shift.break_paid ? durationHours : (durationHours - breakHours);
        
        return (billableHours * shift.hourly_rate).toFixed(2);
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
            {(approvalStatus === 'pending' || approvalStatus === 'rejected' || approvalStatus === 'suspended') && (
                <div className={`rounded-lg p-4 mb-6 ${
                    approvalStatus === 'pending' 
                        ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800' 
                        : approvalStatus === 'suspended'
                        ? 'bg-orange-50 border border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
                        : 'bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800'
                }`}>
                    <div className="flex items-start gap-3">
                        {approvalStatus === 'pending' ? (
                            <Timer className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        ) : (
                            <XCircle className={`h-5 w-5 mt-0.5 ${
                                approvalStatus === 'suspended' 
                                    ? 'text-orange-600 dark:text-orange-400' 
                                    : 'text-red-600 dark:text-red-400'
                            }`} />
                        )}
                        <div>
                            <h3 className={`font-semibold mb-1 ${
                                approvalStatus === 'pending' 
                                    ? 'text-yellow-800 dark:text-yellow-400' 
                                    : approvalStatus === 'suspended'
                                    ? 'text-orange-800 dark:text-orange-400'
                                    : 'text-red-800 dark:text-red-400'
                            }`}>
                                {approvalStatus === 'pending' ? 'Account Pending Approval' : 
                                 approvalStatus === 'suspended' ? 'Account Suspended' : 'Account Rejected'}
                            </h3>
                            <p className={
                                approvalStatus === 'pending' 
                                    ? 'text-yellow-700 dark:text-yellow-300' 
                                    : approvalStatus === 'suspended'
                                    ? 'text-orange-700 dark:text-orange-300'
                                    : 'text-red-700 dark:text-red-300'
                            }>
                                {approvalStatus === 'pending'
                                    ? 'Your account is under review. You will be able to view and apply for shifts once approved.'
                                    : approvalStatus === 'suspended'
                                    ? 'Your account has been suspended. You cannot view or apply for shifts. Please contact support.'
                                    : 'Your account has been rejected. Please contact support for assistance.'
                                }
                            </p>
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
                                            <p>🕒 {shift.start_time} - {shift.end_time}{shift.break_duration > 0 && ` • ${shift.break_duration}min break (${shift.break_paid ? 'Paid' : 'Unpaid'})`}</p>
                                            <p>💰 £{shift.hourly_rate}/hour</p>
                                            <p>📍 {shift.location}</p>
                                            <p className="font-semibold text-green-600 dark:text-green-400 mt-1">Total Pay: £{calculateTotalPay(shift)}</p>
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
                                        {!shift.user_has_applied && isApproved && (
                                            <Button
                                                onClick={() => setSelectedShift(shift.id)}
                                                size="sm"
                                            >
                                                Apply Now
                                            </Button>
                                        )}
                                        {!shift.user_has_applied && !isApproved && (
                                            <p className="text-xs text-gray-500 italic">
                                                Approval required
                                            </p>
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