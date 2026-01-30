import { Head, Link } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Coins, Plus, Eye, CheckCircle, XCircle, Edit, AlertTriangle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/constants/roles';

interface CareHome {
    id: number;
    name: string;
    address: string;
}

interface Timesheet {
    id: number;
    status: string;
}

interface Shift {
    id: number;
    title: string;
    role: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    hourly_rate: number;
    care_home: CareHome;
    timesheet_status: string | null;
    timesheet_id: number | null;
    can_create_timesheet: boolean;
}

interface Props {
    shifts: {
        data: Shift[];
        links: any[];
        meta: any;
    };
}

const MyShifts = ({ shifts }: Props) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
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

    const timesheetStatusColors = {
        'draft': 'bg-gray-100 text-gray-800',
        'submitted': 'bg-blue-100 text-blue-800',
        'approved': 'bg-purple-100 text-purple-800',
        'queried': 'bg-yellow-100 text-yellow-800',
        'rejected': 'bg-red-100 text-red-800',
        'paid': 'bg-emerald-100 text-emerald-800',
    };

    const timesheetStatusIcons = {
        'draft': Edit,
        'submitted': Clock,
        'approved': CheckCircle,
        'queried': AlertTriangle,
        'rejected': XCircle,
        'paid': Coins,
    };

    const getTimesheetAction = (shift: Shift) => {
        if (shift.timesheet_status) {
            const Icon = timesheetStatusIcons[shift.timesheet_status as keyof typeof timesheetStatusIcons];
            return (
                <div className="flex items-center gap-2">
                    <Badge className={timesheetStatusColors[shift.timesheet_status as keyof typeof timesheetStatusColors]}>
                        <Icon className="h-3 w-3 mr-1" />
                        {shift.timesheet_status.charAt(0).toUpperCase() + shift.timesheet_status.slice(1)}
                    </Badge>
                    {shift.timesheet_status === 'draft' && (
                        <Link href={`/worker/timesheets/${shift.timesheet_id}/edit`}>
                            <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                        </Link>
                    )}
                    {shift.timesheet_status !== 'draft' && (
                        <Link href={`/worker/timesheets`}>
                            <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                        </Link>
                    )}
                </div>
            );
        } else if (shift.can_create_timesheet) {
            return (
                <Link href={`/worker/shifts/${shift.id}/timesheets/create`}>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Create Timesheet
                    </Button>
                </Link>
            );
        } else {
            return (
                <Badge variant="secondary">
                    Timesheet not available yet
                </Badge>
            );
        }
    };

    const getShiftStatus = (shift: Shift) => {
        const today = new Date().toISOString().split('T')[0];
        const shiftDate = shift.shift_date;
        
        if (shiftDate > today) {
            return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
        } else if (shiftDate === today) {
            return { label: 'Today', color: 'bg-green-100 text-green-800' };
        } else {
            return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <AppLayout title="My Shifts">
            <Head title="My Shifts" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Shifts</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View your accepted shifts and manage timesheets
                    </p>
                </div>

                {shifts.data.length > 0 ? (
                    <div className="space-y-4">
                        {shifts.data.map((shift) => {
                            const shiftStatus = getShiftStatus(shift);
                            return (
                                <Card key={shift.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-lg">
                                                        {ROLE_LABELS[shift.role as keyof typeof ROLE_LABELS] || shift.role}
                                                    </h3>
                                                    <Badge className={shiftStatus.color}>
                                                        {shiftStatus.label}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="font-medium">{shift.care_home.name}</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>{formatDate(shift.shift_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Coins className="h-4 w-4 text-muted-foreground" />
                                                        <span>£{shift.hourly_rate}/hour</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="ml-6">
                                                {getTimesheetAction(shift)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Pagination */}
                        {shifts.links.length > 3 && (
                            <div className="flex justify-center space-x-1">
                                {shifts.links.map((link, index) => (
                                    <div key={index}>
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                className={`px-3 py-2 text-sm border rounded ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-background hover:bg-muted'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                className="px-3 py-2 text-sm border rounded bg-muted text-muted-foreground"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Shifts Yet</h3>
                            <p className="text-muted-foreground mb-6">
                                You don't have any accepted shifts yet. Apply for shifts to see them here.
                            </p>
                            <Link href="/worker/shifts">
                                <Button>
                                    Browse Available Shifts
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
};

export default MyShifts;