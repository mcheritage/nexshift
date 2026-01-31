import { Head, Link, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, MapPin, Coins, Building2 } from 'lucide-react';

interface Application {
    id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    applied_at: string;
    reviewed_at?: string;
    review_notes?: string;
    shift: {
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
    };
}

interface WorkerApplicationsProps extends SharedData {
    applications: {
        data: Application[];
        links: any[];
        meta: any;
    };
    stats: {
        pending: number;
        accepted: number;
        rejected: number;
        withdrawn: number;
    };
}

const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'accepted': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'withdrawn': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const statusLabels = {
    'pending': 'Pending',
    'accepted': 'Accepted',
    'rejected': 'Rejected', 
    'withdrawn': 'Withdrawn',
};

export default function WorkerApplications({ applications, stats }: WorkerApplicationsProps) {
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

    const withdrawApplication = (applicationId: string) => {
        if (confirm('Are you sure you want to withdraw this application?')) {
            router.patch(`/worker/applications/${applicationId}/withdraw`);
        }
    };

    return (
        <AppLayout>
            <Head title="My Applications" />
            
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-4">
                            <Link href="/worker/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Applications</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Track the status of your shift applications
                                </p>
                            </div>
                        </div>
                    </div>
                    <Link href="/worker/shifts">
                        <Button>
                            Browse More Shifts
                        </Button>
                    </Link>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Accepted</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Rejected</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-gray-600">{stats.withdrawn}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Withdrawn</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Applications List */}
                {applications.data.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Applications Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                You haven't applied for any shifts yet. Browse available shifts to get started.
                            </p>
                            <Link href="/worker/shifts">
                                <Button>
                                    Browse Available Shifts
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {applications.data.map((application) => (
                            <Card key={application.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                        {application.shift.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {application.shift.role}
                                                    </p>
                                                </div>
                                                <Badge className={statusColors[application.status]}>
                                                    {statusLabels[application.status]}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <Building2 className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        {application.shift.care_home.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        {formatDate(application.shift.shift_date)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        {formatTime(application.shift.start_time)} - {formatTime(application.shift.end_time)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Coins className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        £{application.shift.hourly_rate}/hour
                                                    </span>
                                                </div>
                                            </div>

                                            {application.shift.location && (
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        {application.shift.location}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="text-xs text-gray-500 space-y-1">
                                                <p>Applied: {formatDate(application.applied_at)}</p>
                                                {application.reviewed_at && (
                                                    <p>Reviewed: {formatDate(application.reviewed_at)}</p>
                                                )}
                                                {application.review_notes && (
                                                    <p className="text-xs text-red-600 dark:text-red-400">
                                                        Reason: {application.review_notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-4">
                                            {application.status === 'pending' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => withdrawApplication(application.id)}
                                                >
                                                    Withdraw
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {applications.links.length > 3 && (
                            <div className="flex justify-center space-x-2">
                                {applications.links.map((link: any, index: number) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}