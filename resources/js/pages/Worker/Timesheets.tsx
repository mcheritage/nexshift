import { Head, Link } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, 
    Calendar, 
    CalendarCheck,
    Coins, 
    Plus, 
    Edit, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Eye,
    Send
} from 'lucide-react';
import { ROLE_LABELS } from '@/constants/roles';

interface Shift {
    id: string;
    title: string;
    role: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    hourly_rate: number;
    care_home: {
        id: string;
        name: string;
    };
}

interface Timesheet {
    id: string;
    status: string;
    clock_in_time: string;
    clock_out_time: string;
    total_hours: number;
    total_pay: number;
    has_overtime: boolean;
    overtime_hours: number;
    worker_notes?: string;
    manager_notes?: string;
    submitted_at?: string;
    approved_at?: string;
    created_at: string;
    shift: Shift;
}

interface TimesheetsPageProps extends SharedData {
    timesheets: {
        data: Timesheet[];
        links: any[];
        meta: any;
    };
    shiftsNeedingTimesheets: Shift[];
}

const statusColors = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-blue-100 text-blue-800',
    'approved': 'bg-purple-100 text-purple-800',
    'queried': 'bg-yellow-100 text-yellow-800',
    'rejected': 'bg-red-100 text-red-800',
    'paid': 'bg-emerald-100 text-emerald-800',
};

const statusIcons = {
    'draft': Edit,
    'submitted': Clock,
    'approved': CheckCircle,
    'queried': AlertTriangle,
    'rejected': XCircle,
    'paid': Coins,
};

export default function WorkerTimesheets({ timesheets, shiftsNeedingTimesheets }: TimesheetsPageProps) {
    const formatDateTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (time: string) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const getStatusBadge = (status: string) => {
        const Icon = statusIcons[status as keyof typeof statusIcons];
        return (
            <Badge className={statusColors[status as keyof typeof statusColors]}>
                <Icon className="h-3 w-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout title="My Timesheets">
            <Head title="My Timesheets" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Timesheets</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Submit and track your working hours
                            </p>
                        </div>
                    </div>

                {/* Info Box */}
                {shiftsNeedingTimesheets.length === 0 && (
                    <Card className="border-blue-200 bg-blue-50 mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <CalendarCheck className="h-5 w-5 text-blue-600" />
                                <div>
                                    <h3 className="font-medium text-blue-900">Need to create a timesheet?</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Visit <Link href="/worker/my-shifts" className="underline font-medium">My Shifts</Link> to see your accepted shifts and create timesheets for completed work.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Shifts Needing Timesheets */}
                {shiftsNeedingTimesheets.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Shifts Needing Timesheets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                                <div className="grid gap-4">
                                    {shiftsNeedingTimesheets.map((shift) => (
                                        <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                    {ROLE_LABELS[shift.role as keyof typeof ROLE_LABELS] || shift.role}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {shift.care_home.name}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(shift.shift_date)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Coins className="h-3 w-3" />
                                                        £{shift.hourly_rate}/hour
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/worker/shifts/${shift.id}/timesheets/create`}>
                                                <Button>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create Timesheet
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                    </Card>
                )}

                {/* Timesheets List */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Timesheets</CardTitle>
                    </CardHeader>
                    <CardContent>
                            {timesheets.data.length > 0 ? (
                                <div className="space-y-4">
                                    {timesheets.data.map((timesheet) => (
                                        <div key={timesheet.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                            {/* Header with title and status */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">
                                                        {ROLE_LABELS[timesheet.shift.role as keyof typeof ROLE_LABELS] || timesheet.shift.role}
                                                    </h3>
                                                </div>
                                                {getStatusBadge(timesheet.status)}
                                            </div>
                                            
                                            <div className="text-sm text-muted-foreground mb-3">
                                                {timesheet.shift.care_home.name}
                                            </div>

                                            {/* Time and Pay Info */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                                <div>
                                                    <div className="text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Date Created
                                                    </div>
                                                    <div className="font-medium">
                                                        {formatDateTime(timesheet.created_at)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Hours
                                                    </div>
                                                    <div className="font-medium">
                                                        {timesheet.total_hours}h
                                                        {timesheet.has_overtime && (
                                                            <span className="text-orange-600 text-xs ml-1">
                                                                (+{timesheet.overtime_hours}h OT)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground flex items-center gap-1">
                                                        <Coins className="h-3 w-3" />
                                                        Pay
                                                    </div>
                                                    <div className="font-medium">
                                                        £{timesheet.total_pay}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground flex items-center gap-1">
                                                        <Send className="h-3 w-3" />
                                                        Date Submitted
                                                    </div>
                                                    <div className="font-medium">
                                                        {timesheet.submitted_at ? formatDateTime(timesheet.submitted_at) : '-'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {timesheet.worker_notes && (
                                                <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                                                    <div className="text-blue-700 font-medium">Your notes:</div>
                                                    <div className="text-blue-600">{timesheet.worker_notes}</div>
                                                </div>
                                            )}

                                            {timesheet.manager_notes && (
                                                <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                                                    <div className="text-gray-700 font-medium">Manager notes:</div>
                                                    <div className="text-gray-600">{timesheet.manager_notes}</div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 justify-end">
                                                {timesheet.status === 'draft' && (
                                                        <>
                                                            <Link href={`/worker/timesheets/${timesheet.id}/edit`}>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="h-4 w-4 mr-1" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => {
                                                                    // Handle submit
                                                                    const form = document.createElement('form');
                                                                    form.method = 'POST';
                                                                    form.action = `/worker/timesheets/${timesheet.id}/submit`;
                                                                    
                                                                    const csrfInput = document.createElement('input');
                                                                    csrfInput.type = 'hidden';
                                                                    csrfInput.name = '_token';
                                                                    csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                                                    
                                                                    const methodInput = document.createElement('input');
                                                                    methodInput.type = 'hidden';
                                                                    methodInput.name = '_method';
                                                                    methodInput.value = 'PATCH';
                                                                    
                                                                    form.appendChild(csrfInput);
                                                                    form.appendChild(methodInput);
                                                                    document.body.appendChild(form);
                                                                    form.submit();
                                                                }}
                                                            >
                                                                <Send className="h-4 w-4 mr-1" />
                                                                Submit
                                                            </Button>
                                                        </>
                                                    )}
                                                    {timesheet.status === 'queried' && (
                                                        <Link href={`/worker/timesheets/${timesheet.id}/edit`}>
                                                            <Button size="sm">
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Update
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {timesheet.status === 'rejected' && (
                                                        <Link href={`/worker/timesheets/${timesheet.id}/edit`}>
                                                            <Button size="sm" variant="outline">
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Edit & Resubmit
                                                            </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No timesheets found</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Complete shifts will appear above for timesheet creation
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {timesheets.links && timesheets.links.length > 3 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {timesheets.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) window.location.href = link.url;
                                            }}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}