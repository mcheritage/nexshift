import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    UserCheck, 
    Mail, 
    Calendar,
    ArrowLeft,
    FileText,
    Building2,
    CheckCircle,
    XCircle,
    Ban,
    Shield,
    CreditCard
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Health Care Workers',
        href: '/admin/healthcare-workers',
    },
    {
        title: 'Worker Details',
        href: '#',
    },
];

interface StatusChange {
    id: string;
    old_status: string | null;
    new_status: string;
    action: string;
    reason: string | null;
    created_at: string;
    changed_by: {
        id: string;
        first_name: string;
        last_name: string;
    };
}

interface HealthCareWorker {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    role: string;
    created_at: string;
    status_changes?: StatusChange[];
    care_home: {
        id: string;
        name: string;
    } | null;
}

interface StripeStatus {
    connected: boolean;
    account_id: string;
    onboarding_complete: boolean;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    connected_at: string;
    account_type: string;
}

interface Props {
    healthCareWorker: HealthCareWorker;
    stripeStatus?: StripeStatus | null;
}

export default function HealthCareWorkerShow({ healthCareWorker, stripeStatus }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${healthCareWorker.first_name} ${healthCareWorker.last_name}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button asChild variant="outline" className="mb-2">
                            <Link href="/admin/healthcare-workers">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Workers
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {healthCareWorker.first_name} {healthCareWorker.last_name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Health Care Worker Profile
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={`/admin/workers/${healthCareWorker.id}/documents`}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Documents
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic details about the worker</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">
                                        {healthCareWorker.first_name} {healthCareWorker.last_name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{healthCareWorker.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium capitalize">{healthCareWorker.gender}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Joined Date</p>
                                    <p className="font-medium">
                                        {new Date(healthCareWorker.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Work Information</CardTitle>
                            <CardDescription>Employment and assignment details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-sm">
                                    {healthCareWorker.role.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            {healthCareWorker.care_home && (
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Assigned Care Home</p>
                                        <p className="font-medium">{healthCareWorker.care_home.name}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Stripe Connect Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Account Status
                        </CardTitle>
                        <CardDescription>Stripe Connect account information for receiving payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stripeStatus ? (
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Connection Status</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={stripeStatus.onboarding_complete ? "default" : "secondary"}>
                                                    {stripeStatus.onboarding_complete ? "Connected" : "Pending Setup"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Account Type</p>
                                            <p className="font-medium capitalize mt-1">{stripeStatus.account_type || 'Express'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Charges Enabled</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {stripeStatus.charges_enabled ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {stripeStatus.charges_enabled ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Payouts Enabled</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {stripeStatus.payouts_enabled ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {stripeStatus.payouts_enabled ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Connected Date</p>
                                            <p className="font-medium mt-1">
                                                {new Date(stripeStatus.connected_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Account ID</p>
                                            <p className="font-mono text-xs mt-1 text-muted-foreground">
                                                {stripeStatus.account_id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {!stripeStatus.onboarding_complete && (
                                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            This worker has started the Stripe onboarding process but hasn't completed it yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground mb-2">No payment account connected</p>
                                <p className="text-sm text-muted-foreground">
                                    This worker hasn't set up their Stripe Connect account yet.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage this worker's account and documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <Button asChild variant="outline">
                                <Link href={`/admin/workers/${healthCareWorker.id}/documents`}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Verify Documents
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Status History */}
                {healthCareWorker.status_changes && healthCareWorker.status_changes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Status History</CardTitle>
                            <CardDescription>Track of all status changes for this healthcare worker</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {healthCareWorker.status_changes.map((change) => (
                                    <div 
                                        key={change.id} 
                                        className="flex items-start gap-4 p-4 border rounded-lg"
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {change.action === 'approve' && <CheckCircle className="h-5 w-5 text-green-600" />}
                                            {change.action === 'reject' && <XCircle className="h-5 w-5 text-red-600" />}
                                            {change.action === 'suspend' && <Ban className="h-5 w-5 text-orange-600" />}
                                            {change.action === 'unsuspend' && <Shield className="h-5 w-5 text-blue-600" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge 
                                                    variant={
                                                        change.new_status === 'approved' ? 'default' :
                                                        change.new_status === 'rejected' ? 'destructive' :
                                                        change.new_status === 'suspended' ? 'secondary' :
                                                        'outline'
                                                    }
                                                >
                                                    {change.old_status ? `${change.old_status} → ${change.new_status}` : change.new_status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(change.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                Changed by {change.changed_by.first_name} {change.changed_by.last_name}
                                            </p>
                                            {change.reason && (
                                                <p className="text-sm mt-2 p-2 bg-muted rounded">
                                                    <span className="font-medium">Reason: </span>
                                                    {change.reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
