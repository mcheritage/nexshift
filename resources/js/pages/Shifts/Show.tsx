import { Head, Link, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import WorkerProfileModal from '@/components/WorkerProfileModal';
import { ROLE_LABELS } from '@/constants/roles';
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    MapPin, 
    Coins, 
    Users, 
    AlertTriangle, 
    Edit, 
    Eye,
    CheckCircle,
    XCircle,
    PlayCircle,
    Pause
} from 'lucide-react';
import { useState } from 'react';

interface Application {
    id: string;
    status: string;
    worker: {
        id: string;
        name: string;
        email: string;
    };
}

interface Shift {
    id: string;
    role: string;
    start_date_time: string;
    end_date_time: string;
    hourly_rate: number;
    location: string;
    status: string;
    required_skills: string[];
    preferred_skills: string[];
    additional_requirements?: string;
    notes?: string;
    is_urgent: boolean;
    duration_hours: number;
    total_pay: number;
    created_at: string;
    applications_count?: number;
    applications?: Application[];
    selected_worker?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
}

interface ShiftShowProps extends SharedData {
    shift: Shift;
}

const statusColors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'published': 'bg-blue-100 text-blue-800',
    'filled': 'bg-green-100 text-green-800',
    'completed': 'bg-purple-100 text-purple-800',
    'cancelled': 'bg-red-100 text-red-800'
};

export default function ShiftShow({ shift }: ShiftShowProps) {
    const [selectedWorker, setSelectedWorker] = useState<any>(null);
    const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const formatDateTime = (dateTime: string) => {
        try {
            const date = new Date(dateTime);
            
            if (isNaN(date.getTime())) {
                console.error('Invalid date string:', dateTime);
                return 'Invalid Date';
            }
            
            return date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error, dateTime);
            return 'Invalid Date';
        }
    };

    const handleWorkerClick = (worker: any) => {
        // Create a mock application object for the modal
        const mockApplication = {
            id: `temp-${worker.id}`,
            status: 'accepted',
            applied_at: new Date().toISOString(),
            worker: worker
        };
        setSelectedWorker(mockApplication);
        setIsWorkerModalOpen(true);
    };

    const handlePublish = () => {
        router.patch(`/shifts/${shift.id}/publish`);
    };

    const handleCancel = () => {
        setIsCancelModalOpen(true);
    };

    const confirmCancel = () => {
        if (!cancellationReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }
        
        setProcessing(true);
        router.patch(`/shifts/${shift.id}/cancel`, {
            cancellation_reason: cancellationReason
        }, {
            onSuccess: () => {
                setIsCancelModalOpen(false);
                setCancellationReason('');
                setProcessing(false);
            },
            onError: (errors) => {
                console.error('Cancellation failed:', errors);
                setProcessing(false);
            }
        });
    };

    const canEdit = ['draft', 'published'].includes(shift.status);
    const canPublish = shift.status === 'draft';
    const canCancel = ['draft', 'published', 'filled'].includes(shift.status);

    return (
        <AppLayout>
            <Head title={`${ROLE_LABELS[shift.role] || shift.role} - Shift Details`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    {/* Back Button */}
                    <div className="flex justify-between items-center">
                        <Link href="/shifts">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Shifts
                            </Button>
                        </Link>
                        
                        <div className="flex gap-2">
                            {canEdit && (
                                <Link href={`/shifts/${shift.id}/edit`}>
                                    <Button variant="outline">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                            )}
                            
                            {canPublish && (
                                <Button 
                                    onClick={handlePublish}
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Publish
                                </Button>
                            )}

                            {canCancel && (
                                <Button 
                                    onClick={handleCancel}
                                    disabled={processing}
                                    variant="destructive"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    {/* Title Section */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {roleLabels[shift.role] || shift.role}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge className={statusColors[shift.status] || 'bg-gray-100 text-gray-800'}>
                                {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                            </Badge>
                            {shift.is_urgent && (
                                <Badge variant="destructive">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Urgent
                                </Badge>
                            )}
                        </div>
                        {shift.status === 'filled' && shift.selected_worker && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">
                                        Assigned to: 
                                        <span className="ml-1 font-medium">
                                            {shift.selected_worker.first_name} {shift.selected_worker.last_name}
                                        </span>
                                        <button 
                                            onClick={() => handleWorkerClick(shift.selected_worker)}
                                            className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                                        >
                                            View Profile
                                        </button>
                                    </span>
                                </div>
                                <div className="text-xs text-green-600 ml-6">
                                    {shift.selected_worker.email}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Details */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Schedule & Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Schedule & Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Start Time</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>{formatDateTime(shift.start_date_time)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">End Time</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span>{formatDateTime(shift.end_date_time)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Location</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>{shift.location}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Duration</Label>
                                        <div className="text-lg font-semibold">{shift.duration_hours} hours</div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Total Pay</Label>
                                        <div className="text-lg font-semibold text-green-600">£{shift.total_pay}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills & Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills & Requirements</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {shift.required_skills && shift.required_skills.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Required Skills</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {shift.required_skills.map((skill, index) => (
                                                <Badge key={index} variant="default" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {shift.preferred_skills && shift.preferred_skills.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Preferred Skills</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {shift.preferred_skills.map((skill, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {shift.additional_requirements && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Additional Requirements</Label>
                                        <p className="text-gray-900 dark:text-gray-100 mt-1">{shift.additional_requirements}</p>
                                    </div>
                                )}

                                {shift.notes && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Shift Notes</Label>
                                        <p className="text-gray-900 dark:text-gray-100 mt-1">{shift.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        {/* Pay Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Coins className="h-5 w-5" />
                                    Pay Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-2">
                                    <div className="text-3xl font-bold text-green-600">
                                        £{shift.hourly_rate}
                                    </div>
                                    <div className="text-sm text-gray-600">per hour</div>
                                    <div className="pt-2 border-t">
                                        <div className="text-lg font-semibold">
                                            Total: £{shift.total_pay}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            for {shift.duration_hours} hours
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Application Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Applications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-2">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {shift.applications_count ?? shift.applications?.length ?? 0}
                                    </div>
                                    <div className="text-sm text-gray-600">applications received</div>
                                    {shift.status === 'published' && (
                                        <Link href={`/applications/shift/${shift.id}`}>
                                            <Button className="w-full mt-4" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Applications
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shift Meta */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Shift Information</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created:</span>
                                    <span>{new Date(shift.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <Badge className={statusColors[shift.status]} variant="outline">
                                        {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                                    </Badge>
                                </div>
                                {shift.status === 'filled' && shift.selected_worker && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Assigned Worker:</span>
                                        <div className="text-right">
                                            <div className="font-medium">
                                                {shift.selected_worker.first_name} {shift.selected_worker.last_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {shift.selected_worker.email}
                                            </div>
                                            <button 
                                                onClick={() => handleWorkerClick(shift.selected_worker)}
                                                className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Priority:</span>
                                    <span className={shift.is_urgent ? 'text-red-600 font-medium' : 'text-gray-900 dark:text-gray-100'}>
                                        {shift.is_urgent ? 'Urgent' : 'Normal'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Worker Profile Modal */}
            <WorkerProfileModal
                isOpen={isWorkerModalOpen}
                onClose={() => {
                    setIsWorkerModalOpen(false);
                    setSelectedWorker(null);
                }}
                application={selectedWorker}
            />

            {/* Cancel Shift Modal */}
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Shift</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for cancelling this shift. The assigned worker will be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cancellation_reason">Cancellation Reason *</Label>
                            <Textarea
                                id="cancellation_reason"
                                placeholder="Enter the reason for cancelling this shift..."
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCancelModalOpen(false);
                                setCancellationReason('');
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmCancel}
                            disabled={processing || !cancellationReason.trim()}
                        >
                            {processing ? 'Cancelling...' : 'Cancel Shift'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}