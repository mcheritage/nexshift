import { Head, useForm, Link } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, 
    DollarSign, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    ArrowLeft,
    Calendar,
    User,
    MessageSquare,
    MapPin,
    Phone,
    Mail,
    Timer
} from 'lucide-react';
import { useState } from 'react';

interface Worker {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    profile_photo?: string;
}

interface Shift {
    id: string;
    title: string;
    role: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    location?: string;
    department?: string;
}

interface CareHome {
    id: string;
    name: string;
    address?: string;
}

interface Timesheet {
    id: string;
    status: string;
    clock_in_time: string;
    clock_out_time?: string;
    break_duration_minutes?: number;
    total_hours: number;
    hourly_rate: number;
    overtime_hours?: number;
    overtime_rate?: number;
    total_pay: number;
    worker_notes?: string;
    manager_notes?: string;
    submitted_at?: string;
    approved_at?: string;
    queried_at?: string;
    rejected_at?: string;
    created_at: string;
    updated_at: string;
    worker: Worker;
    shift: Shift;
    care_home: CareHome;
    approver?: {
        id: string;
        first_name: string;
        last_name: string;
    };
}

interface TimesheetShowProps extends SharedData {
    timesheet: Timesheet;
    statusOptions: Record<string, string>;
}

const statusColors = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'queried': 'bg-orange-100 text-orange-800',
    'rejected': 'bg-red-100 text-red-800',
};

export default function TimesheetShow({ timesheet, statusOptions }: TimesheetShowProps) {
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
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

    const formatTime = (timeString: string) => {
        try {
            const [hours, minutes] = timeString.split(':');
            return `${hours}:${minutes}`;
        } catch (error) {
            return timeString;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return '0 mins';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;
    };

    const handleApprove = () => {
        patch(`/timesheets/${timesheet.id}/approve`);
    };

    const handleQuery = () => {
        if (!queryNotes.trim()) {
            alert('Please provide query notes');
            return;
        }

        patch(`/timesheets/${timesheet.id}/query`, {
            data: { manager_notes: queryNotes },
            onSuccess: () => {
                setShowQueryModal(false);
                setQueryNotes('');
            }
        });
    };

    const handleReject = () => {
        if (!rejectNotes.trim()) {
            alert('Please provide rejection reason');
            return;
        }

        patch(`/timesheets/${timesheet.id}/reject`, {
            data: { manager_notes: rejectNotes },
            onSuccess: () => {
                setShowRejectModal(false);
                setRejectNotes('');
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`Timesheet - ${timesheet.worker.first_name} ${timesheet.worker.last_name}`} />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/timesheets">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Timesheets
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Timesheet Details
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                #{timesheet.id.substring(0, 8)}
                            </p>
                        </div>
                    </div>
                    
                    <Badge className={statusColors[timesheet.status as keyof typeof statusColors]}>
                        {statusOptions[timesheet.status]}
                    </Badge>
                </div>

                {/* Worker Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            Worker Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                {timesheet.worker.profile_photo ? (
                                    <img 
                                        src={timesheet.worker.profile_photo} 
                                        alt={`${timesheet.worker.first_name} ${timesheet.worker.last_name}`}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                        <User className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {timesheet.worker.first_name} {timesheet.worker.last_name}
                                </h3>
                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {timesheet.worker.email}
                                    </div>
                                    {timesheet.worker.phone && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Phone className="h-4 w-4 mr-2" />
                                            {timesheet.worker.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shift Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            Shift Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Shift Title
                                </label>
                                <p className="text-gray-900 dark:text-white">{timesheet.shift.title}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Role
                                </label>
                                <p className="text-gray-900 dark:text-white">{timesheet.shift.role}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Date
                                </label>
                                <p className="text-gray-900 dark:text-white">{timesheet.shift.shift_date}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Scheduled Time
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {formatTime(timesheet.shift.start_time)} - {formatTime(timesheet.shift.end_time)}
                                </p>
                            </div>
                            {timesheet.shift.location && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Location
                                    </label>
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                        <p className="text-gray-900 dark:text-white">{timesheet.shift.location}</p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Care Home
                                </label>
                                <p className="text-gray-900 dark:text-white">{timesheet.care_home.name}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Time Tracking */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            Time Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Clock In
                                    </label>
                                    <p className="text-lg font-semibold text-green-600">
                                        {formatDateTime(timesheet.clock_in_time)}
                                    </p>
                                </div>
                                
                                {timesheet.clock_out_time && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Clock Out
                                        </label>
                                        <p className="text-lg font-semibold text-red-600">
                                            {formatDateTime(timesheet.clock_out_time)}
                                        </p>
                                    </div>
                                )}
                                
                                {timesheet.break_duration_minutes && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Break Duration
                                        </label>
                                        <div className="flex items-center">
                                            <Timer className="h-4 w-4 mr-1 text-gray-400" />
                                            <p className="text-gray-900 dark:text-white">
                                                {formatDuration(timesheet.break_duration_minutes)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Total Hours
                                    </label>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {timesheet.total_hours}h
                                    </p>
                                </div>
                                
                                {timesheet.overtime_hours && timesheet.overtime_hours > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Overtime Hours
                                        </label>
                                        <p className="text-lg font-semibold text-orange-600">
                                            {timesheet.overtime_hours}h
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pay Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2" />
                            Pay Calculation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Hourly Rate
                                </label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(timesheet.hourly_rate)}/hour
                                </p>
                            </div>
                            
                            {timesheet.overtime_rate && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Overtime Rate
                                    </label>
                                    <p className="text-lg font-semibold text-orange-600">
                                        {formatCurrency(timesheet.overtime_rate)}/hour
                                    </p>
                                </div>
                            )}
                            
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Total Pay
                                </label>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(timesheet.total_pay)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                {(timesheet.worker_notes || timesheet.manager_notes) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {timesheet.worker_notes && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold text-blue-800 mb-2">Worker Notes</h4>
                                    <p className="text-blue-700">{timesheet.worker_notes}</p>
                                </div>
                            )}
                            
                            {timesheet.manager_notes && (
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <h4 className="font-semibold text-orange-800 mb-2">Manager Notes</h4>
                                    <p className="text-orange-700">{timesheet.manager_notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Status History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <span className="font-medium">Created</span>
                                <span className="text-sm text-gray-600">
                                    {formatDateTime(timesheet.created_at)}
                                </span>
                            </div>
                            
                            {timesheet.submitted_at && (
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                                    <span className="font-medium">Submitted</span>
                                    <span className="text-sm text-gray-600">
                                        {formatDateTime(timesheet.submitted_at)}
                                    </span>
                                </div>
                            )}
                            
                            {timesheet.queried_at && (
                                <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                                    <span className="font-medium">Queried</span>
                                    <span className="text-sm text-gray-600">
                                        {formatDateTime(timesheet.queried_at)}
                                    </span>
                                </div>
                            )}
                            
                            {timesheet.approved_at && (
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                                    <div>
                                        <span className="font-medium">Approved</span>
                                        {timesheet.approver && (
                                            <div className="text-sm text-gray-600">
                                                by {timesheet.approver.first_name} {timesheet.approver.last_name}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {formatDateTime(timesheet.approved_at)}
                                    </span>
                                </div>
                            )}
                            
                            {timesheet.rejected_at && (
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                                    <div>
                                        <span className="font-medium">Rejected</span>
                                        {timesheet.approver && (
                                            <div className="text-sm text-gray-600">
                                                by {timesheet.approver.first_name} {timesheet.approver.last_name}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {formatDateTime(timesheet.rejected_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                {timesheet.status === 'submitted' && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={handleApprove}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    disabled={processing}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Timesheet
                                </Button>
                                <Button
                                    onClick={() => setShowQueryModal(true)}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Query Timesheet
                                </Button>
                                <Button
                                    onClick={() => setShowRejectModal(true)}
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Timesheet
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
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
                                    onClick={handleQuery}
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    Send Query
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowQueryModal(false);
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
                                    onClick={handleReject}
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    Reject Timesheet
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowRejectModal(false);
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