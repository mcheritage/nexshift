import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Users, 
    Search, 
    Filter, 
    Plus,
    TrendingUp
} from 'lucide-react';

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
    is_urgent: boolean;
}

interface ShiftsPageProps extends SharedData {
    shifts: {
        data: Shift[];
        meta: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
        };
    };
    stats: {
        total_shifts: number;
        published_shifts: number;
        filled_shifts: number;
        applications_count: number;
    };
    filters: {
        status?: string;
        role?: string;
        search?: string;
    };
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

export default function ShiftsIndex({ shifts, stats, filters }: ShiftsPageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const formatDateTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateShiftDuration = (start: string, end: string) => {
        const startTime = new Date(start);
        const endTime = new Date(end);
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return `${hours}h`;
    };

    return (
        <AppLayout>
            <Head title="Shift Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Shift Management</h1>
                        <p className="text-muted-foreground">Manage your care home shifts and staffing requirements</p>
                    </div>
                    <Link href="/shifts/create">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Post New Shift
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_shifts}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.published_shifts}</div>
                            <p className="text-xs text-muted-foreground">Awaiting applications</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Filled</CardTitle>
                            <Users className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.filled_shifts}</div>
                            <p className="text-xs text-muted-foreground">Staff assigned</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Applications</CardTitle>
                            <Users className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.applications_count}</div>
                            <p className="text-xs text-muted-foreground">Pending review</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search shifts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shifts List */}
                <div className="space-y-4">
                    {shifts.data.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts posted yet</h3>
                                <p className="text-gray-600 mb-4">Start by posting your first shift to attract qualified healthcare workers.</p>
                                <Link href="/shifts/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Post Your First Shift
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        shifts.data.map((shift) => (
                            <Card key={shift.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {roleLabels[shift.role] || shift.role}
                                                </h3>
                                                {shift.is_urgent && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Urgent
                                                    </Badge>
                                                )}
                                                <Badge className={statusColors[shift.status] || 'bg-gray-100 text-gray-800'}>
                                                    {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                                                </Badge>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDateTime(shift.start_date_time)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{calculateShiftDuration(shift.start_date_time, shift.end_date_time)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{shift.location}</span>
                                                </div>
                                            </div>

                                            {shift.required_skills && shift.required_skills.length > 0 && (
                                                <div className="mt-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {shift.required_skills.map((skill, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right ml-4">
                                            <div className="text-2xl font-bold text-green-600">
                                                £{shift.hourly_rate}
                                            </div>
                                            <div className="text-sm text-gray-500">per hour</div>
                                            {shift.applications_count !== undefined && (
                                                <div className="text-sm text-blue-600 mt-2">
                                                    {shift.applications_count} applications
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Users className="h-4 w-4" />
                                            <span>Posted {new Date(shift.start_date_time).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/shifts/${shift.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                            <Link href={`/shifts/${shift.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {shifts.meta.last_page > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                        {/* Add pagination component here */}
                        <div className="text-sm text-gray-600">
                            Showing {((shifts.meta.current_page - 1) * shifts.meta.per_page) + 1} to {Math.min(shifts.meta.current_page * shifts.meta.per_page, shifts.meta.total)} of {shifts.meta.total} shifts
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}