import { Head, Link, router, useForm } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
// Removed Select component import - using HTML select instead
import { Textarea } from '@/components/ui/textarea';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Coins, 
    Building2, 
    Users,
    Filter,
    Search,
    Send,
    CheckCircle,
    XCircle,
    Timer
} from 'lucide-react';
import { useState } from 'react';

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

interface WorkerShiftsProps extends SharedData {
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
}

export default function WorkerShifts({ shifts, filters, roleOptions }: WorkerShiftsProps) {
    const [selectedShift, setSelectedShift] = useState<string | null>(null);
    const [applicationMessage, setApplicationMessage] = useState('');
    const { post, processing } = useForm();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
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

    const handleFilterChange = (field: string, value: string) => {
        const newFilters = { ...filters, [field]: value };
        router.get('/worker/shifts', newFilters, { preserveState: true });
    };

    const handleApply = (shiftId: string) => {
        post(`/worker/shifts/${shiftId}/apply`, {
            data: { message: applicationMessage },
            onSuccess: () => {
                setSelectedShift(null);
                setApplicationMessage('');
            }
        });
    };

    const getStatusBadge = (shift: Shift) => {
        if (!shift.user_has_applied) {
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Available
                </Badge>
            );
        }

        switch (shift.user_application_status) {
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800">
                        <Timer className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'accepted':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accepted
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary">
                        Applied
                    </Badge>
                );
        }
    };

    return (
        <AppLayout>
            <Head title="Browse Shifts" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Shifts</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Find healthcare shifts that match your skills and availability
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Filter Shifts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                    {Object.entries(roleOptions).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Location..."
                                    value={filters.location || ''}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date From
                                </label>
                                <Input
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date To
                                </label>
                                <Input
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Min Rate (£/hr)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.50"
                                    placeholder="0.00"
                                    value={filters.min_rate || ''}
                                    onChange={(e) => handleFilterChange('min_rate', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Available Shifts ({shifts.meta.total} found)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {shifts.data.map(shift => (
                            <div key={shift.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                {shift.title}
                                            </h3>
                                            {getStatusBadge(shift)}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
                                            <Building2 className="h-4 w-4 mr-1" />
                                            {shift.care_home.name}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(shift.shift_date)}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {shift.location}
                                            </div>
                                            <div className="flex items-center">
                                                <Coins className="h-4 w-4 mr-1" />
                                                £{shift.hourly_rate}/hour
                                            </div>
                                            {shift.break_duration > 0 && (
                                                <div className="flex items-center">
                                                    <Timer className="h-4 w-4 mr-1" />
                                                    {shift.break_duration}min break ({shift.break_paid ? 'Paid' : 'Unpaid'})
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Pay:</span>
                                                <span className="text-lg font-bold text-green-600">£{calculateTotalPay(shift)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center space-x-4">
                                            <Badge variant="secondary">
                                                {roleOptions[shift.role] || shift.role}
                                            </Badge>
                                            <div className="flex items-center text-xs text-gray-400">
                                                <Users className="h-3 w-3 mr-1" />
                                                {shift.applications_count} application{shift.applications_count !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="ml-6">
                                        {!shift.user_has_applied ? (
                                            <Button
                                                onClick={() => setSelectedShift(shift.id)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Apply Now
                                            </Button>
                                        ) : (
                                            <Button variant="outline" disabled>
                                                Already Applied
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Application Form */}
                                {selectedShift === shift.id && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                                            Apply for this shift
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Cover Message (Optional)
                                                </label>
                                                <Textarea
                                                    value={applicationMessage}
                                                    onChange={(e) => setApplicationMessage(e.target.value)}
                                                    placeholder="Tell the care home why you're a good fit for this shift..."
                                                    rows={3}
                                                    maxLength={500}
                                                />
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {applicationMessage.length}/500 characters
                                                </div>
                                            </div>
                                            <div className="flex space-x-3">
                                                <Button
                                                    onClick={() => handleApply(shift.id)}
                                                    disabled={processing}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {processing ? 'Submitting...' : 'Submit Application'}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setSelectedShift(null);
                                                        setApplicationMessage('');
                                                    }}
                                                    variant="outline"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {shifts.data.length === 0 && (
                            <div className="text-center py-8">
                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No shifts found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Try adjusting your filters to find more shifts.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {shifts.links && shifts.links.length > 3 && (
                    <div className="flex justify-center space-x-1">
                        {shifts.links.map((link: any, index: number) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-2 text-sm rounded ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
                                        : link.url
                                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}