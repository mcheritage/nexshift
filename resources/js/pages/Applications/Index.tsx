import { Head, Link, useForm } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    User, 
    Calendar, 
    CheckCircle, 
    XCircle, 
    Clock,
    MessageSquare
} from 'lucide-react';
import { useState } from 'react';

interface Application {
    id: string;
    status: string;
    message?: string;
    applied_at: string;
    reviewed_at?: string;
    review_notes?: string;
    worker: {
        id: string;
        name: string;
        email: string;
        // Add more worker fields as needed
    };
}

interface Shift {
    id: string;
    title: string;
    role: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    location: string;
    hourly_rate: number;
    status: string;
    selected_worker_id?: string;
    applications?: Application[];
}

interface ApplicationsIndexProps extends SharedData {
    shift: Shift;
    applications: Application[];
}

const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'withdrawn': 'bg-gray-100 text-gray-800',
};

const roleLabels = {
    'registered_nurse': 'Registered Nurse',
    'healthcare_assistant': 'Healthcare Assistant',
    'support_worker': 'Support Worker',
    'senior_care_worker': 'Senior Care Worker',
    'night_shift_worker': 'Night Shift Worker',
    'domestic_staff': 'Domestic Staff',
    'kitchen_staff': 'Kitchen Staff',
    'maintenance_staff': 'Maintenance Staff'
};

export default function ApplicationsIndex({ shift, applications }: ApplicationsIndexProps) {
    const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    
    const { patch } = useForm();
    const rejectForm = useForm({
        review_notes: ''
    });

    const handleAccept = (applicationId: string) => {
        patch(`/applications/${applicationId}/accept`);
    };

    const handleReject = (applicationId: string) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        
        rejectForm.patch(`/applications/${applicationId}/reject`, {
            data: { review_notes: rejectionReason },
            onSuccess: () => {
                setSelectedApplication(null);
                setRejectionReason('');
            }
        });
    };

    const isShiftFilled = shift.status === 'filled';

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
            console.error('Error formatting date:', error);
            return dateTimeString;
        }
    };

    const pendingApplications = applications.filter(app => app.status === 'pending');
    const reviewedApplications = applications.filter(app => app.status !== 'pending');

    return (
        <AppLayout>
            <Head title={`Applications - ${shift.title}`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    <Link href={`/shifts/${shift.id}`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Shift
                        </Button>
                    </Link>
                    
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Applications</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Review applications for "{shift.title}"
                        </p>
                    </div>
                </div>

                {/* Shift Status Banner */}
                {shift.status === 'filled' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            <div>
                                <p className="font-medium text-green-800">Position Filled</p>
                                <p className="text-sm text-green-700">
                                    This shift has been filled and is no longer accepting new applications.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shift Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shift Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Role:</span>
                                <div>{roleLabels[shift.role as keyof typeof roleLabels] || shift.role}</div>
                            </div>
                            <div>
                                <span className="font-medium">Date & Time:</span>
                                <div>{shift.shift_date} • {shift.start_time} - {shift.end_time}</div>
                            </div>
                            <div>
                                <span className="font-medium">Location:</span>
                                <div>{shift.location}</div>
                            </div>
                            <div>
                                <span className="font-medium">Rate:</span>
                                <div>£{shift.hourly_rate}/hour</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</div>
                            <div className="text-sm text-gray-600">Pending Review</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {applications.filter(app => app.status === 'accepted').length}
                            </div>
                            <div className="text-sm text-gray-600">Accepted</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-gray-600">{applications.length}</div>
                            <div className="text-sm text-gray-600">Total Applications</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Applications */}
                {pendingApplications.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Applications ({pendingApplications.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pendingApplications.map(application => (
                                <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-gray-100 rounded-full p-3">
                                                <User className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {application.worker.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {application.worker.email}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        Applied {formatDateTime(application.applied_at)}
                                                    </div>
                                                </div>
                                                {application.message && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                            <MessageSquare className="h-4 w-4 mr-1" />
                                                            Cover Message
                                                        </div>
                                                        <p className="text-sm text-gray-600">{application.message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            {shift.status === 'filled' ? (
                                                <div className="text-sm text-gray-500 italic">
                                                    Position filled
                                                </div>
                                            ) : application.status === 'pending' ? (
                                                <>
                                                    <Button
                                                        onClick={() => handleAccept(application.id)}
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        onClick={() => setSelectedApplication(application.id)}
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                    
                                    {/* Rejection Form */}
                                    {selectedApplication === application.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Rejection Reason *
                                                </label>
                                                <textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder="Please provide a reason for rejection..."
                                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                                                    rows={3}
                                                />
                                                <div className="flex space-x-2">
                                                    <Button
                                                        onClick={() => handleReject(application.id)}
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        Confirm Rejection
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedApplication(null);
                                                            setRejectionReason('');
                                                        }}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Reviewed Applications */}
                {reviewedApplications.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Reviewed Applications ({reviewedApplications.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {reviewedApplications.map(application => (
                                <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-gray-100 rounded-full p-3">
                                                <User className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {application.worker.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {application.worker.email}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        Applied {formatDateTime(application.applied_at)}
                                                    </div>
                                                    {application.reviewed_at && (
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            Reviewed {formatDateTime(application.reviewed_at)}
                                                        </div>
                                                    )}
                                                </div>
                                                {application.review_notes && (
                                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                        <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                                                            Review Notes
                                                        </h4>
                                                        <p className="text-sm text-red-600">{application.review_notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {applications.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Applications Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                This shift hasn't received any applications yet. 
                                Healthcare workers will be able to apply once the shift is published.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}