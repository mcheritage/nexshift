import { Head, Link } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Coins, 
    Building2, 
    Eye,
    Plus,
    CheckCircle,
    XCircle,
    Timer
} from 'lucide-react';
import { ROLE_LABELS } from '@/constants/roles';

interface Application {
    id: string;
    status: string;
    applied_at: string;
    shift: {
        id: string;
        title: string;
        shift_date: string;
        start_time: string;
        end_time: string;
        care_home: {
            name: string;
        };
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
    care_home: {
        name: string;
    };
}

interface WorkerDashboardProps extends SharedData {
    availableShifts: Shift[];
    myApplications: Application[];
    stats: {
        available_shifts: number;
        my_applications: number;
        accepted_applications: number;
        pending_applications: number;
    };
    isApproved?: boolean;
    approvalStatus?: string;
}

const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'withdrawn': 'bg-gray-100 text-gray-800',
};

export default function WorkerDashboard({ availableShifts, myApplications, stats, isApproved, approvalStatus }: WorkerDashboardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5); // Remove seconds
    };

    return (
        <AppLayout>
            <Head title="Worker Dashboard" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Find and apply for healthcare shifts
                    </p>
                </div>

                {/* Approval Status Warning */}
                {!isApproved && approvalStatus === 'pending' && (
                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800">
                        <CardContent className="p-6">
                            <div className="flex items-start">
                                <Timer className="h-6 w-6 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-400 mb-2">
                                        Account Pending Approval
                                    </h3>
                                    <p className="text-yellow-800 dark:text-yellow-300">
                                        Your account is currently pending approval by an administrator. You will be able to view and apply for shifts once your account has been approved. This typically takes 1-2 business days.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!isApproved && approvalStatus === 'rejected' && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
                        <CardContent className="p-6">
                            <div className="flex items-start">
                                <XCircle className="h-6 w-6 text-red-600 dark:text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">
                                        Account Not Approved
                                    </h3>
                                    <p className="text-red-800 dark:text-red-300">
                                        Unfortunately, your account application was not approved. Please contact support for more information.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!isApproved && approvalStatus === 'suspended' && (
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800">
                        <CardContent className="p-6">
                            <div className="flex items-start">
                                <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-400 mb-2">
                                        Account Suspended
                                    </h3>
                                    <p className="text-orange-800 dark:text-orange-300">
                                        Your account has been suspended. You cannot view or apply for shifts. Please contact support for assistance.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-600">{stats.available_shifts}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Available Shifts</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Timer className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_applications}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Pending Applications</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-600">{stats.accepted_applications}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Accepted Applications</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Plus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-purple-600">{stats.my_applications}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Total Applications</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Browse Shifts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                Browse Available Shifts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Find healthcare shifts that match your skills and availability.
                            </p>
                            <Link href="/worker/shifts">
                                <Button className="w-full">
                                    View All Shifts
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* My Applications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Eye className="h-5 w-5 mr-2" />
                                My Applications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Track the status of your shift applications and responses.
                            </p>
                            <Link href="/worker/applications">
                                <Button variant="outline" className="w-full">
                                    View Applications
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Available Shifts */}
                {availableShifts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Available Shifts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {availableShifts.map(shift => (
                                <div key={shift.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                {shift.title}
                                            </h4>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
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
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <Badge variant="secondary">
                                                {ROLE_LABELS[shift.role as keyof typeof ROLE_LABELS] || shift.role}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {availableShifts.length === 10 && (
                                <div className="text-center pt-4">
                                    <Link href="/worker/shifts">
                                        <Button variant="outline" size="sm">
                                            View All Available Shifts
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Recent Applications */}
                {myApplications.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Applications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {myApplications.map(application => (
                                <div key={application.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                {application.shift.title}
                                            </h4>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                <Building2 className="h-4 w-4 mr-1" />
                                                {application.shift.care_home.name}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {formatDate(application.shift.shift_date)}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {formatTime(application.shift.start_time)} - {formatTime(application.shift.end_time)}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Applied {formatDate(application.applied_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {myApplications.length === 5 && (
                                <div className="text-center pt-4">
                                    <Link href="/worker/applications">
                                        <Button variant="outline" size="sm">
                                            View All Applications
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Empty States */}
                {availableShifts.length === 0 && myApplications.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Welcome to NexShift
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Start browsing available healthcare shifts and apply for ones that match your skills and schedule.
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
}