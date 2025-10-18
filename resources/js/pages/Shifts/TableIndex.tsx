import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { SharedData, BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, TrendingUp, Plus, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import WorkerProfileModal from '@/components/WorkerProfileModal';

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

interface Application {
    id: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    status: string;
}

interface Shift {
    id: string;
    role: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    hourly_rate: number;
    location: string;
    status: string;
    applications_count?: number;
    applications?: Application[];
    selected_worker?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    required_skills: string[];
    notes?: string;
}

interface ShiftsPageProps extends SharedData {
    shifts: {
        data: Shift[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
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
        search?: string;
    };
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) : '';
};

const getStatusBadge = (status: string) => {
    const variants = {
        'draft': 'secondary',
        'published': 'default',
        'filled': 'secondary',
        'completed': 'outline',
        'cancelled': 'destructive'
    } as const;
    
    return (
        <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
};

export default function ShiftsTableIndex({ shifts, stats, filters = {} }: ShiftsPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [sortField, setSortField] = useState<string>('shift_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedWorker, setSelectedWorker] = useState<any>(null);
    const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);

    const handleSearch = () => {
        router.get('/shifts', {
            search: searchTerm || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            role: roleFilter !== 'all' ? roleFilter : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setRoleFilter('all');
        router.get('/shifts', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
        }
        return sortDirection === 'asc' ? 
            <ArrowUp className="h-4 w-4" /> : 
            <ArrowDown className="h-4 w-4" />;
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

    // Filter and sort the shifts data locally
    const filteredShifts = (shifts.data || []).filter((shift) => {
        const matchesSearch = !searchTerm || 
            shift.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shift.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (shift.notes && shift.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || shift.status === statusFilter;
        const matchesRole = roleFilter === 'all' || shift.role === roleFilter;
        
        return matchesSearch && matchesStatus && matchesRole;
    });

    const sortedShifts = [...filteredShifts].sort((a, b) => {
        const aValue = a[sortField as keyof Shift];
        const bValue = b[sortField as keyof Shift];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <AppLayout title="Shifts Management" breadcrumbs={breadcrumbs}>
            <Head title="Shifts" />

            <div className="container mx-auto px-4 py-6">
                <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Shifts Management</h1>
                        <p className="text-muted-foreground">
                            Manage your care home shifts and track applications
                        </p>
                    </div>
                    <Link href="/shifts/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Shift
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.total_shifts}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.published_shifts}</div>
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

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search shifts by role, location, or notes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="filled">Filled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="care_assistant">Care Assistant</SelectItem>
                                    <SelectItem value="registered_nurse">Registered Nurse</SelectItem>
                                    <SelectItem value="senior_care_assistant">Senior Care Assistant</SelectItem>
                                    <SelectItem value="healthcare_support_worker">Healthcare Support Worker</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Shifts Table */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Shifts</CardTitle>
                                <CardDescription>
                                    Overview of all shifts with applications and assigned workers
                                </CardDescription>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Showing {sortedShifts.length} of {shifts.total} shifts
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('shift_date')}
                                                className="h-auto p-0 font-medium hover:bg-transparent"
                                            >
                                                Date & Time
                                                {getSortIcon('shift_date')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('role')}
                                                className="h-auto p-0 font-medium hover:bg-transparent"
                                            >
                                                Role & Location
                                                {getSortIcon('role')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('status')}
                                                className="h-auto p-0 font-medium hover:bg-transparent"
                                            >
                                                Status
                                                {getSortIcon('status')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-center">
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('applications_count')}
                                                className="h-auto p-0 font-medium hover:bg-transparent"
                                            >
                                                Applications
                                                {getSortIcon('applications_count')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>Assigned Worker</TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('hourly_rate')}
                                                className="h-auto p-0 font-medium hover:bg-transparent"
                                            >
                                                Rate
                                                {getSortIcon('hourly_rate')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedShifts && sortedShifts.length > 0 ? (
                                        sortedShifts.map((shift) => (
                                            <TableRow key={shift.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">
                                                            {formatDate(shift.shift_date)}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">
                                                            {shift.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {shift.location}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(shift.status)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Badge variant="outline" className="px-2 py-1">
                                                            {shift.applications_count || 0}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {shift.selected_worker ? (
                                                        <div className="space-y-1">
                                                            <div className="font-medium">
                                                                {shift.selected_worker.first_name} {shift.selected_worker.last_name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {shift.selected_worker.email}
                                                            </div>
                                                            <button 
                                                                onClick={() => handleWorkerClick(shift.selected_worker)}
                                                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                                                            >
                                                                View Profile
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Not assigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        £{shift.hourly_rate}/hr
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/shifts/${shift.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="space-y-2">
                                                    <Calendar className="h-8 w-8 mx-auto text-muted-foreground" />
                                                    <p className="text-muted-foreground">No shifts found</p>
                                                    <Link href="/shifts/create">
                                                        <Button variant="outline" size="sm">
                                                            Create Your First Shift
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {shifts.last_page > 1 && (
                            <div className="flex items-center justify-between space-x-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((shifts.current_page - 1) * shifts.per_page) + 1} to {Math.min(shifts.current_page * shifts.per_page, shifts.total)} of {shifts.total} shifts
                                </div>
                                <div className="flex items-center space-x-2">
                                    {shifts.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
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
        </AppLayout>
    );
}