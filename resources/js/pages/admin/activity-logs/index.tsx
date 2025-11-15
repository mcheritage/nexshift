import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Activity,
    Search,
    Filter,
    Calendar,
    User as UserIcon,
    Building2,
    FileText,
    Shield,
    CheckCircle,
    XCircle,
    Ban,
    Upload,
    Trash2,
    Edit,
    Plus,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Activity Logs',
        href: '#',
    },
];

interface ActivityLog {
    id: string;
    action: string;
    description: string;
    subject_type: string | null;
    subject_id: string | null;
    subject?: {
        type: string;
        id: string;
        name?: string;
        email?: string;
        type_label?: string;
        file_name?: string;
        title?: string;
        date?: string;
    } | null;
    properties: Record<string, any> | null;
    created_at: string;
    user: {
        id: string;
        name: string;
        email: string;
    } | null;
    care_home: {
        id: string;
        name: string;
    } | null;
}

interface Props {
    activityLogs: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    actions: string[];
    filters: {
        action?: string;
        user_id?: string;
        care_home_id?: string;
        from_date?: string;
        to_date?: string;
        search?: string;
    };
}

const getActionIcon = (action: string) => {
    if (action.includes('created')) return <Plus className="h-4 w-4 text-green-600" />;
    if (action.includes('updated') || action.includes('edited')) return <Edit className="h-4 w-4 text-blue-600" />;
    if (action.includes('deleted')) return <Trash2 className="h-4 w-4 text-red-600" />;
    if (action.includes('approved')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (action.includes('rejected')) return <XCircle className="h-4 w-4 text-red-600" />;
    if (action.includes('suspend')) return <Ban className="h-4 w-4 text-orange-600" />;
    if (action.includes('unsuspend')) return <Shield className="h-4 w-4 text-blue-600" />;
    if (action.includes('upload')) return <Upload className="h-4 w-4 text-blue-600" />;
    if (action.includes('document')) return <FileText className="h-4 w-4 text-purple-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
};

const getActionColor = (action: string) => {
    if (action.includes('created')) return 'default';
    if (action.includes('updated') || action.includes('edited')) return 'secondary';
    if (action.includes('deleted')) return 'destructive';
    if (action.includes('approved')) return 'default';
    if (action.includes('rejected')) return 'destructive';
    if (action.includes('suspend')) return 'secondary';
    return 'outline';
};

export default function ActivityLogsIndex({ activityLogs, actions, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || 'all');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleFilter = () => {
        router.get('/admin/activity-logs', {
            search: search || undefined,
            action: selectedAction !== 'all' ? selectedAction : undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
        }, {
            preserveState: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setSelectedAction('all');
        setFromDate('');
        setToDate('');
        router.get('/admin/activity-logs');
    };

    const handleViewDetails = (log: ActivityLog) => {
        setSelectedLog(log);
        setIsDetailsOpen(true);
    };

    const handlePageChange = (page: number) => {
        router.get('/admin/activity-logs', {
            page,
            search: search || undefined,
            action: selectedAction !== 'all' ? selectedAction : undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Activity Logs
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Comprehensive audit trail of all system activities
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            {activityLogs.total} Total Logs
                        </Badge>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                        <CardDescription>Filter activity logs by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative mt-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search description..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="action">Action</Label>
                                <Select value={selectedAction} onValueChange={setSelectedAction}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="All actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All actions</SelectItem>
                                        {actions.map((action) => (
                                            <SelectItem key={action} value={action}>
                                                {action.replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="from_date">From Date</Label>
                                <Input
                                    id="from_date"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="to_date">To Date</Label>
                                <Input
                                    id="to_date"
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleFilter}>
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={handleClearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity Log Entries</CardTitle>
                        <CardDescription>
                            Showing {activityLogs.data.length} of {activityLogs.total} logs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activityLogs.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No activity logs found</p>
                                </div>
                            ) : (
                                activityLogs.data.map((log) => (
                                    <div 
                                        key={log.id} 
                                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {getActionIcon(log.action)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={getActionColor(log.action)}>
                                                    {log.action.replace(/_/g, ' ')}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                                                </span>
                                            </div>
                                            <p className="text-sm mb-2">
                                                {log.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                {log.user && (
                                                    <div className="flex items-center gap-1">
                                                        <UserIcon className="h-3 w-3" />
                                                        {log.user.name}
                                                    </div>
                                                )}
                                                {log.care_home && (
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {log.care_home.name}
                                                    </div>
                                                )}
                                                {log.subject_type && (
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="h-3 w-3" />
                                                        {log.subject_type}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {log.properties && Object.keys(log.properties).length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewDetails(log)}
                                            >
                                                View Details
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {activityLogs.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Page {activityLogs.current_page} of {activityLogs.last_page}
                                    <span className="ml-2">({activityLogs.total} total logs)</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={activityLogs.current_page === 1}
                                        onClick={() => handlePageChange(activityLogs.current_page - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={activityLogs.current_page === activityLogs.last_page}
                                        onClick={() => handlePageChange(activityLogs.current_page + 1)}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Details Sheet */}
                <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                        <SheetHeader className="border-b pb-4 px-6 pt-6">
                            <SheetTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Activity Details
                            </SheetTitle>
                            <SheetDescription>
                                Complete information about this activity
                            </SheetDescription>
                        </SheetHeader>
                        {selectedLog && (
                            <div className="mt-6 space-y-6 px-6 pb-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</Label>
                                    <div className="mt-1">
                                        <Badge variant={getActionColor(selectedLog.action)} className="text-sm px-3 py-1">
                                            {selectedLog.action.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timestamp</Label>
                                    <div className="flex items-center gap-2 text-sm p-3 bg-muted/50 rounded-md">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {format(new Date(selectedLog.created_at), 'MMMM dd, yyyy HH:mm:ss')}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</Label>
                                    <p className="text-sm p-3 bg-muted/50 rounded-md leading-relaxed">
                                        {selectedLog.description}
                                    </p>
                                </div>

                                {selectedLog.user && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Performed By</Label>
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                                                    <UserIcon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedLog.user.name}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedLog.user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.care_home && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Care Home</Label>
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedLog.care_home.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.subject && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject</Label>
                                        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {selectedLog.subject.type}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500 font-mono">ID: {selectedLog.subject.id}</span>
                                                    </div>
                                                    {selectedLog.subject.name && (
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedLog.subject.name}</p>
                                                    )}
                                                    {selectedLog.subject.email && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">{selectedLog.subject.email}</p>
                                                    )}
                                                    {selectedLog.subject.type_label && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">Type: {selectedLog.subject.type_label}</p>
                                                    )}
                                                    {selectedLog.subject.file_name && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">File: {selectedLog.subject.file_name}</p>
                                                    )}
                                                    {selectedLog.subject.title && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">Title: {selectedLog.subject.title}</p>
                                                    )}
                                                    {selectedLog.subject.date && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">Date: {format(new Date(selectedLog.subject.date), 'PP')}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.properties && Object.keys(selectedLog.properties).length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Additional Properties</Label>
                                        <div className="relative">
                                            <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-700 font-mono leading-relaxed">
                                                {JSON.stringify(selectedLog.properties, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </SheetContent>
                </Sheet>
            </div>
        </AppLayout>
    );
}
