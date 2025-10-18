import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { SharedData, BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, TrendingUp, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Shifts',
        href: '/shifts',
    },
];

interface Shift {
    id: string;
    role: string;
    start_date_time: string;
    end_date_time: string;
    hourly_rate: number;
    location: string;
    status: string;
    applications_count?: number;
    required_skills: string[];
}

interface ShiftsPageProps extends SharedData {
    shifts: {
        data: Shift[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_shifts: number;
        published_shifts: number;
        filled_shifts: number;
        applications_count: number;
    };
    filters?: {
        role?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function SimpleShiftsIndex({ shifts, stats, filters }: ShiftsPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shifts Management" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Shifts Management</h1>
                        <p className="text-muted-foreground">Post and manage healthcare shifts for your care home</p>
                    </div>
                    <Button asChild>
                        <Link href="/shifts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Post New Shift
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_shifts}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.published_shifts}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Filled</CardTitle>
                            <Users className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.filled_shifts}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Applications</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.applications_count}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Shifts</CardTitle>
                        <CardDescription>
                            Your latest shift postings and their current status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>

                        {shifts.data && shifts.data.length > 0 ? (
                            <div className="space-y-4">
                                {shifts.data.map((shift) => (
                                    <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">
                                                        {shift.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </h3>
                                                    <Badge variant={
                                                        shift.status === 'published' ? 'default' :
                                                        shift.status === 'filled' ? 'secondary' :
                                                        shift.status === 'completed' ? 'outline' :
                                                        'destructive'
                                                    }>
                                                        {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {shift.location}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(shift.start_date_time).toLocaleDateString()}
                                                    </div>
                                                    <div className="font-medium text-green-600">
                                                        £{shift.hourly_rate}/hour
                                                    </div>
                                                </div>
                                                {shift.required_skills && shift.required_skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {shift.required_skills.map((skill, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/shifts/${shift.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No shifts posted yet</h3>
                                <p className="text-muted-foreground mb-6">Get started by posting your first shift.</p>
                                <Button asChild>
                                    <Link href="/shifts/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Post Your First Shift
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}