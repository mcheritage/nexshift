import { Head, Link, useForm } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Clock, 
    Coins, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Search,
    Filter,
    Calendar,
    User,
    MessageSquare,
    Eye,
    Users
} from 'lucide-react';
import { useState } from 'react';

interface Worker {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_photo?: string;
}

interface Shift {
    id: string;
    title: string;
    role: string;
    shift_date: string;
    start_time: string;
    end_time: string;
}

interface Timesheet {
    id: string;
    status: string;
    clock_in_time: string;
    clock_out_time?: string;
    total_hours: number;
    hourly_rate: number;
    total_pay: number;
    worker_notes?: string;
    manager_notes?: string;
    submitted_at?: string;
    approved_at?: string;
    worker: Worker;
    shift: Shift;
    approver?: {
        id: string;
        name: string;
    };
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    queried: number;
    rejected: number;
    total_pending_pay: number;
    total_approved_pay: number;
}

interface Filters {
    status: string;
    search: string;
    date_from?: string;
    date_to?: string;
}

interface TimesheetsIndexProps extends SharedData {
    timesheets: {
        data: Timesheet[];
        links: any[];
        meta: any;
    };
    stats: Stats;
    filters: Filters;
    statusOptions: Record<string, string>;
}

const statusColors = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'queried': 'bg-orange-100 text-orange-800',
    'rejected': 'bg-red-100 text-red-800',
};

export default function TimesheetsIndex({ timesheets, stats, filters, statusOptions }: TimesheetsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'submitted');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [selectedTimesheets, setSelectedTimesheets] = useState<string[]>([]);
    const [showQueryModal, setShowQueryModal] = useState<string | null>(null);
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
    const [queryNotes, setQueryNotes] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');

    const { patch, processing } = useForm();

    const formatDateTime = (dateTimeString: string) => {
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateTimeString;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const handleApprove = (timesheetId: string) => {
        patch(`/timesheets/${timesheetId}/approve`);
    };

    const handleQuery = (timesheetId: string) => {
        if (!queryNotes.trim()) {
            alert('Please provide query notes');
            return;
        }

        patch(`/timesheets/${timesheetId}/query`, {
            data: { manager_notes: queryNotes },
            onSuccess: () => {
                setShowQueryModal(null);
                setQueryNotes('');
            }
        });
    };

    const handleReject = (timesheetId: string) => {
        if (!rejectNotes.trim()) {
            alert('Please provide rejection reason');
            return;
        }

        patch(`/timesheets/${timesheetId}/reject`, {
            data: { manager_notes: rejectNotes },
            onSuccess: () => {
                setShowRejectModal(null);
                setRejectNotes('');
            }
        });
    };

    const handleBulkApprove = () => {
        if (selectedTimesheets.length === 0) {
            alert('Please select timesheets to approve');
            return;
        }

        patch('/timesheets/bulk-approve', {
            data: { timesheet_ids: selectedTimesheets },
            onSuccess: () => {
                setSelectedTimesheets([]);
            }
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const approveableIds = timesheets?.data
                .filter(t => t.status === 'submitted')
                .map(t => t.id);
            setSelectedTimesheets(approveableIds);
        } else {
            setSelectedTimesheets([]);
        }
    };

    const handleSelectTimesheet = (timesheetId: string, checked: boolean) => {
        if (checked) {
            setSelectedTimesheets(prev => [...prev, timesheetId]);
        } else {
            setSelectedTimesheets(prev => prev.filter(id => id !== timesheetId));
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (statusFilter) params.set('status', statusFilter);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        
        window.location.href = `/timesheets?${params.toString()}`;
    };

    return (
        <AppLayout>
            <Head title="Timesheet Approvals" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Timesheet Approvals</h1>
                    <p className="text-muted-foreground">
                        Review and approve worker timesheets for payroll processing
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-sm text-gray-600">Pending Approval</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {formatCurrency(stats.total_pending_pay)} pending
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                            <div className="text-sm text-gray-600">Approved</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {formatCurrency(stats.total_approved_pay)} approved
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.queried}</div>
                            <div className="text-sm text-gray-600">Queried</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
                            <div className="text-sm text-gray-600">Total Timesheets</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search workers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    {Object.entries(statusOptions).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <Input
                                    type="date"
                                    placeholder="From date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <Input
                                    type="date"
                                    placeholder="To date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <Button onClick={applyFilters} className="w-full">
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedTimesheets.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-700">
                                    {selectedTimesheets.length} timesheets selected
                                </span>
                                <Button 
                                    onClick={handleBulkApprove}
                                    disabled={processing}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Bulk Approve
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Timesheets List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Timesheets ({timesheets?.data?.length || 0})</CardTitle>
                            {timesheets?.data?.some(t => t.status === 'submitted') && (
                                <label className="flex items-center text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedTimesheets.length === (timesheets?.data?.filter(t => t.status === 'submitted').length || 0)}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="mr-2"
                                    />
                                    Select All Pending
                                </label>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(!timesheets?.data || timesheets.data.length === 0) ? (
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No Timesheets Found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    No timesheets match your current filters.
                                </p>
                            </div>
                        ) : (
                            timesheets?.data?.map(timesheet => (
                                <div key={timesheet.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            {timesheet.status === 'submitted' && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTimesheets.includes(timesheet.id)}
                                                    onChange={(e) => handleSelectTimesheet(timesheet.id, e.target.checked)}
                                                    className="mt-2"
                                                />
                                            )}
                                            
                                            <div className="flex-shrink-0">
                                                {timesheet.worker.profile_photo ? (
                                                    <img 
                                                        src={timesheet.worker.profile_photo} 
                                                        alt={`${timesheet.worker.first_name} ${timesheet.worker.last_name}`}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <User className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {timesheet.worker.first_name} {timesheet.worker.last_name}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {timesheet.shift.title} • {timesheet.shift.role}
                                                </p>
                                                
                                                <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {timesheet.shift.shift_date}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        {timesheet.total_hours}h
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Coins className="h-4 w-4 mr-1" />
                                                        {formatCurrency(timesheet.total_pay)}
                                                    </div>
                                                </div>
                                                
                                                {timesheet.worker_notes && (
                                                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                                                        <div className="flex items-center text-blue-700 mb-1">
                                                            <MessageSquare className="h-3 w-3 mr-1" />
                                                            Worker Notes:
                                                        </div>
                                                        <p className="text-blue-600">{timesheet.worker_notes}</p>
                                                    </div>
                                                )}
                                                
                                                {timesheet.manager_notes && (
                                                    <div className="mt-3 p-2 bg-orange-50 rounded text-sm">
                                                        <div className="flex items-center text-orange-700 mb-1">
                                                            <MessageSquare className="h-3 w-3 mr-1" />
                                                            Manager Notes:
                                                        </div>
                                                        <p className="text-orange-600">{timesheet.manager_notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <Badge className={statusColors[timesheet.status as keyof typeof statusColors]}>
                                                {statusOptions[timesheet.status]}
                                            </Badge>
                                            
                                            <Link href={`/timesheets/${timesheet.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                            
                                            {timesheet.status === 'submitted' && (
                                                <>
                                                    <Button
                                                        onClick={() => handleApprove(timesheet.id)}
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        disabled={processing}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => setShowQueryModal(timesheet.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                                        Query
                                                    </Button>
                                                    <Button
                                                        onClick={() => setShowRejectModal(timesheet.id)}
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Pagination would go here */}
            </div>

            {/* Query Modal */}
            {showQueryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Query Timesheet</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Query Notes *
                                </label>
                                <textarea
                                    value={queryNotes}
                                    onChange={(e) => setQueryNotes(e.target.value)}
                                    placeholder="What additional information do you need from the worker?"
                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                                    rows={4}
                                />
                            </div>
                            <div className="flex space-x-3">
                                <Button
                                    onClick={() => handleQuery(showQueryModal)}
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    Send Query
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowQueryModal(null);
                                        setQueryNotes('');
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Reject Timesheet</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    value={rejectNotes}
                                    onChange={(e) => setRejectNotes(e.target.value)}
                                    placeholder="Please provide a reason for rejecting this timesheet..."
                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                                    rows={4}
                                />
                            </div>
                            <div className="flex space-x-3">
                                <Button
                                    onClick={() => handleReject(showRejectModal)}
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    Reject Timesheet
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowRejectModal(null);
                                        setRejectNotes('');
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}