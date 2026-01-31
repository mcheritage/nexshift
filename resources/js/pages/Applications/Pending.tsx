import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, MapPin, Users, User, Eye } from 'lucide-react';
import { SharedData } from '@/types/shared';

interface Worker {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_photo?: string;
}

interface Application {
    id: string;
    status: string;
    applied_at: string;
    message?: string;
    worker: Worker;
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
    pending_applications_count: number;
    applications: Application[];
}

interface PendingApplicationsProps extends SharedData {
    shifts: Shift[];
    stats: {
        total_shifts: number;
        total_applications: number;
    };
}

export default function PendingApplications({ shifts, stats }: PendingApplicationsProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <AppLayout>
            <Head title="Pending Applications" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="space-y-4">
                    <Link href="/shifts">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Shifts
                        </Button>
                    </Link>
                    
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pending Applications</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Review and manage applications from healthcare workers
                        </p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-600">{stats.total_shifts}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Shifts with Applications</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-purple-600">{stats.total_applications}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Total Pending Applications</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Shifts with Pending Applications */}
                {shifts.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Pending Applications
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                You don't have any pending applications to review at the moment.
                            </p>
                            <Link href="/shifts">
                                <Button>
                                    View All Shifts
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {shifts.map((shift) => (
                            <Card key={shift.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl mb-2">{shift.title}</CardTitle>
                                            <CardDescription className="space-y-1">
                                                <div className="flex items-center text-sm">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    {formatDate(shift.shift_date)}
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <MapPin className="h-4 w-4 mr-2" />
                                                    {shift.location}
                                                </div>
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Hourly Rate
                                            </div>
                                            <div className="text-2xl font-bold text-green-600">
                                                £{parseFloat(shift.hourly_rate).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="flex items-center">
                                            <Users className="h-5 w-5 text-purple-600 mr-2" />
                                            <span className="font-medium text-purple-900 dark:text-purple-300">
                                                {shift.pending_applications_count} pending application{shift.pending_applications_count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <Link href={`/applications/shift/${shift.id}`}>
                                            <Button size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Review Applications
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Quick preview of applicants */}
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Recent Applicants:
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {shift.applications.slice(0, 3).map((application) => (
                                                <div
                                                    key={application.id}
                                                    className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                >
                                                    <div className="flex-shrink-0">
                                                        {application.worker.profile_photo ? (
                                                            <img
                                                                src={application.worker.profile_photo}
                                                                alt={`${application.worker.first_name} ${application.worker.last_name}`}
                                                                className="h-8 w-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                                <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {application.worker.first_name} {application.worker.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(application.applied_at).toLocaleDateString('en-GB', { 
                                                                day: 'numeric', 
                                                                month: 'short' 
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {shift.pending_applications_count > 3 && (
                                                <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                                                    +{shift.pending_applications_count - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
