import { Head, Link, useForm } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    MapPin, 
    DollarSign, 
    Users, 
    AlertTriangle, 
    Edit, 
    Eye,
    CheckCircle,
    XCircle,
    PlayCircle,
    Pause
} from 'lucide-react';

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
}

interface ShiftShowProps extends SharedData {
    shift: Shift;
}

const roleLabels: Record<string, string> = {
    'registered_nurse': 'Registered Nurse',
    'healthcare_assistant': 'Healthcare Assistant',
    'support_worker': 'Support Worker',
    'domestic_staff': 'Domestic Staff',
    'kitchen_staff': 'Kitchen Staff',
    'maintenance_staff': 'Maintenance Staff'
};

const statusColors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'published': 'bg-blue-100 text-blue-800',
    'filled': 'bg-green-100 text-green-800',
    'completed': 'bg-purple-100 text-purple-800',
    'cancelled': 'bg-red-100 text-red-800'
};

export default function ShiftShow({ shift }: ShiftShowProps) {
    const { patch, processing } = useForm();

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

    const handlePublish = () => {
        patch(`/shifts/${shift.id}/publish`);
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this shift?')) {
            patch(`/shifts/${shift.id}/cancel`);
        }
    };

    const canEdit = ['draft', 'published'].includes(shift.status);
    const canPublish = shift.status === 'draft';
    const canCancel = ['draft', 'published'].includes(shift.status);

    return (
        <AppLayout>
            <Head title={`${roleLabels[shift.role] || shift.role} - Shift Details`} />
            
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
                                    <DollarSign className="h-5 w-5" />
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
                                        {shift.applications_count || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">applications received</div>
                                    {shift.status === 'published' && (
                                        <Button className="w-full mt-4" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Applications
                                        </Button>
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
        </AppLayout>
    );
}