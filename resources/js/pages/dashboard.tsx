import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Notification } from '@/types';
import { type Document, type DocumentVerificationStatus } from '@/types/document';
import { Head, Link, router } from '@inertiajs/react';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
    Upload,
    Eye,
    AlertCircle,
    Bell,
    Calendar,
    Users,
    MapPin,
    Coins,
    Plus,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface CareHome {
    id: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
}

interface Shift {
    id: string;
    title: string;
    role: string;
    start_datetime: string;
    end_datetime: string;
    location: string;
    status: string;
}

interface DashboardStats {
    active_shifts: number;
    filled_shifts: number;
    pending_timesheets: number;
    approved_timesheets: number;
    outstanding_invoices: number;
    outstanding_amount: number;
    uninvoiced_timesheets: number;
}

interface Props {
    careHome: CareHome;
    notifications: Notification[];
    // Approved dashboard props
    upcomingShifts?: Shift[];
    dashboardStats?: DashboardStats;
    // Document dashboard props
    documents?: Document[];
    verificationStatuses?: Array<{
        value: DocumentVerificationStatus;
        displayName: string;
        description: string;
        color: string;
        icon: string;
        isActionRequired: boolean;
    }>;
}

const docStatusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    requires_attention: AlertTriangle,
};

const docStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    requires_attention: 'bg-orange-100 text-orange-800',
};

function getNotificationUrl(notification: Notification): string {
    const data = notification.data ?? {};
    switch (notification.type) {
        case 'payment_received':
            return data.invoice_id ? route('invoices.show', data.invoice_id) : route('invoices.index');
        case 'timesheet_submitted':
        case 'timesheet_approved':
        case 'timesheet_rejected':
        case 'timesheet_queried':
            return data.timesheet_id ? route('timesheets.show', data.timesheet_id) : route('timesheets.index');
        case 'shift_application':
            return data.shift_id ? route('shifts.show', data.shift_id) : route('shifts.index');
        case 'application_accepted':
        case 'application_rejected':
            return data.shift_id ? route('shifts.show', data.shift_id) : route('shifts.index');
        default:
            return route('notifications.index');
    }
}

function handleNotificationClick(notification: Notification) {
    const url = getNotificationUrl(notification);
    if (!notification.read) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        fetch(route('notifications.mark-as-read', notification.id), {
            method: 'PATCH',
            headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
        }).finally(() => {
            router.visit(url);
        });
    } else {
        router.visit(url);
    }
}

function ApprovedDashboard({ careHome, notifications, upcomingShifts, dashboardStats }: {
    careHome: CareHome;
    notifications: Notification[];
    upcomingShifts: Shift[];
    dashboardStats: DashboardStats;
}) {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

    const formatDateTime = (dt: string) =>
        new Date(dt).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">{careHome.name}</p>
                </div>
                <Link href={route('shifts.create')}>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Shift
                    </Button>
                </Link>
            </div>

            {/* Uninvoiced timesheets alert */}
            {dashboardStats.uninvoiced_timesheets > 0 && (
                <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                        <p className="text-sm text-amber-800">
                            You have <strong>{dashboardStats.uninvoiced_timesheets}</strong> approved timesheet{dashboardStats.uninvoiced_timesheets > 1 ? 's' : ''} that {dashboardStats.uninvoiced_timesheets > 1 ? 'have' : 'has'} not been invoiced yet.
                        </p>
                    </div>
                    <Link href={route('invoices.create')} className="shrink-0">
                        <Button size="sm" variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-100">
                            Create Invoice
                        </Button>
                    </Link>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Shifts</p>
                                <div className="text-2xl font-bold text-blue-600">{dashboardStats.active_shifts}</div>
                                <p className="text-xs text-gray-500 mt-1">Published</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Filled Shifts</p>
                                <div className="text-2xl font-bold text-green-600">{dashboardStats.filled_shifts}</div>
                                <p className="text-xs text-gray-500 mt-1">Worker assigned</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Timesheets</p>
                                <div className="text-2xl font-bold text-orange-600">{dashboardStats.pending_timesheets}</div>
                                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
                            </div>
                            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unpaid Invoices</p>
                                <div className="text-2xl font-bold text-purple-600">{dashboardStats.outstanding_invoices}</div>
                                <p className="text-xs text-gray-500 mt-1">{formatCurrency(dashboardStats.outstanding_amount)}</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Coins className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Upcoming Shifts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Upcoming Shifts</CardTitle>
                        <Link href={route('shifts.index')}>
                            <Button variant="ghost" size="sm">View all</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {upcomingShifts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="mx-auto h-8 w-8 mb-2 opacity-40" />
                                <p className="text-sm">No upcoming shifts</p>
                                <Link href={route('shifts.create')}>
                                    <Button size="sm" variant="outline" className="mt-3">Post a shift</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingShifts.map((shift) => (
                                    <div key={shift.id} className="flex items-start justify-between p-3 border rounded-lg">
                                        <div className="space-y-1">
                                            <div className="font-medium capitalize">{shift.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {shift.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDateTime(shift.start_datetime)}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {shift.location}
                                            </div>
                                        </div>
                                        <Link href={route('shifts.show', shift.id)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-3 w-3 mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Recent Notifications
                        </CardTitle>
                        <Link href={route('notifications.index')}>
                            <Button variant="ghost" size="sm">View all</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {notifications.filter(n => !n.read).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Bell className="mx-auto h-8 w-8 mb-2 opacity-40" />
                                <p className="text-sm">No unread notifications</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notifications.filter(n => !n.read).slice(0, 5).map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-100 ${!notification.read ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' : 'bg-gray-50'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-medium text-sm">{notification.title}</div>
                                                <div className="text-xs text-muted-foreground mt-1">{notification.message}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DocumentDashboard({ careHome, documents, notifications, verificationStatuses }: {
    careHome: CareHome;
    documents: Document[];
    notifications: Notification[];
    verificationStatuses: Props['verificationStatuses'];
}) {
    const getStatusIcon = (status: string) => {
        const IconComponent = docStatusIcons[status as keyof typeof docStatusIcons];
        return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
    };

    const getStatusColor = (status: string) =>
        docStatusColors[status as keyof typeof docStatusColors] || 'bg-gray-100 text-gray-800';

    const totalRequired = 18;
    const approved = documents.filter(doc => doc.status === 'approved').length;
    const pending = documents.filter(doc => doc.status === 'pending').length;
    const rejected = documents.filter(doc => doc.status === 'rejected').length;
    const requiresAttention = documents.filter(doc => doc.status === 'requires_attention').length;
    const completionPercentage = Math.round((approved / totalRequired) * 100);
    const hasActionRequired = documents.some(doc => doc.status === 'rejected' || doc.status === 'requires_attention');

    const getDocumentsByStatus = (status: DocumentVerificationStatus) =>
        documents.filter(doc => doc.status === status);

    return (
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to Nexshift</h1>
                    <p className="text-muted-foreground">{careHome.name} - Document Verification Dashboard</p>
                </div>
                <Button asChild>
                    <Link href="/documents/">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                    </Link>
                </Button>
            </div>

            {hasActionRequired && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-800">
                            <AlertCircle className="h-5 w-5" />
                            Action Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-orange-700">
                            Some of your documents require attention. Please review the status below and take the necessary action.
                        </p>
                    </CardContent>
                </Card>
            )}

            {careHome.status === 'pending' && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-800">
                            <AlertCircle className="h-5 w-5" />
                            Account Pending Verification
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-yellow-700 mb-3">
                            Your care home account is currently pending verification. Please upload all required documents to complete the verification process.
                        </p>
                        <p className="text-yellow-700 font-semibold">
                            You will not be able to post shifts until your account is approved by our administrators.
                        </p>
                    </CardContent>
                </Card>
            )}

            {careHome.status === 'rejected' && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-800">
                            <XCircle className="h-5 w-5" />
                            Account Rejected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-700">
                            Your care home account has been rejected. Please contact support for more information or resubmit your documents.
                        </p>
                    </CardContent>
                </Card>
            )}

            {careHome.status === 'suspended' && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-800">
                            <XCircle className="h-5 w-5" />
                            Account Suspended
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-700">
                            Your care home account has been suspended. Please contact support for assistance.
                        </p>
                    </CardContent>
                </Card>
            )}

            {notifications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Recent Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {notifications.slice(0, 5).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium">{notification.title}</div>
                                            <div className="text-sm text-muted-foreground mt-1">{notification.message}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Required</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRequired}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uploaded</CardTitle>
                        <Upload className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{rejected + requiresAttention}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Document Verification Progress</CardTitle>
                    <CardDescription>{completionPercentage}% of required documents have been approved</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={completionPercentage} className="w-full" />
                    <div className="mt-2 text-sm text-muted-foreground">
                        {approved} of {totalRequired} documents approved
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Document Status Overview</h2>
                <div className="grid gap-4">
                    {verificationStatuses?.map((status) => {
                        const docsWithStatus = getDocumentsByStatus(status.value);
                        if (docsWithStatus.length === 0) return null;
                        return (
                            <Card key={status.value}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(status.value)}
                                            {status.displayName}
                                        </div>
                                        <Badge className={`${getStatusColor(status.value)} flex items-center gap-1`}>
                                            {docsWithStatus.length} document{docsWithStatus.length !== 1 ? 's' : ''}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>{status.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {docsWithStatus.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <div className="font-medium">{doc.original_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                                    </div>
                                                    {doc.rejection_reason && (
                                                        <div className="text-sm text-red-600 mt-1">
                                                            <strong>Reason:</strong> {doc.rejection_reason}
                                                        </div>
                                                    )}
                                                    {doc.action_required && (
                                                        <div className="text-sm text-orange-600 mt-1">
                                                            <strong>Action Required:</strong> {doc.action_required}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href="/documents/">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ careHome, notifications, upcomingShifts, dashboardStats, documents, verificationStatuses }: Props) {
    if (careHome.status === 'approved' && dashboardStats && upcomingShifts) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <ApprovedDashboard
                    careHome={careHome}
                    notifications={notifications}
                    upcomingShifts={upcomingShifts}
                    dashboardStats={dashboardStats}
                />
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <DocumentDashboard
                careHome={careHome}
                documents={documents ?? []}
                notifications={notifications}
                verificationStatuses={verificationStatuses}
            />
        </AppLayout>
    );
}
