import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Building2, 
    Mail, 
    Calendar,
    ArrowLeft,
    FileText,
    User,
    Phone,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    Shield,
    Ban
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Care Homes',
        href: '/admin/carehomes',
    },
    {
        title: 'Care Home Details',
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

interface CareHome {
    id: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    rejection_reason?: string;
    created_at: string;
    status_changes?: StatusChange[];
    users: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        created_at: string;
    }[];
}

interface DocumentStats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    requires_attention: number;
}

interface Props {
    careHome: CareHome;
    documentStats: DocumentStats;
    totalRequired: number;
}

export default function CareHomeShow({ careHome, documentStats, totalRequired }: Props) {
    const completionPercentage = totalRequired > 0 
        ? Math.round((documentStats.approved / totalRequired) * 100) 
        : 0;

    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
    const [isUnsuspendDialogOpen, setIsUnsuspendDialogOpen] = useState(false);
    
    const rejectForm = useForm({
        reason: '',
    });

    const suspendForm = useForm({
        reason: '',
    });

    const unsuspendForm = useForm({
        reason: '',
    });

    const handleApprove = () => {
        router.patch(`/admin/carehomes/${careHome.id}/approve`, {}, {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const handleReject = () => {
        rejectForm.patch(`/admin/carehomes/${careHome.id}/reject`, {
            onSuccess: () => {
                setIsRejectDialogOpen(false);
                rejectForm.reset();
                router.reload();
            }
        });
    };

    const handleSuspend = () => {
        suspendForm.patch(`/admin/carehomes/${careHome.id}/suspend`, {
            onSuccess: () => {
                setIsSuspendDialogOpen(false);
                suspendForm.reset();
                router.reload();
            }
        });
    };

    const handleUnsuspend = () => {
        unsuspendForm.patch(`/admin/carehomes/${careHome.id}/unsuspend`, {
            onSuccess: () => {
                setIsUnsuspendDialogOpen(false);
                unsuspendForm.reset();
                router.reload();
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const config = {
            pending: { variant: 'secondary' as const, color: 'text-yellow-600', icon: Clock },
            approved: { variant: 'default' as const, color: 'text-green-600', icon: CheckCircle },
            rejected: { variant: 'destructive' as const, color: 'text-red-600', icon: XCircle },
            suspended: { variant: 'destructive' as const, color: 'text-red-600', icon: Ban },
        };

        const { variant, color, icon: Icon } = config[status as keyof typeof config] || config.pending;

        return (
            <Badge variant={variant} className="flex items-center gap-1 w-fit">
                <Icon className="h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={careHome.name} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button asChild variant="outline" className="mb-2">
                            <Link href="/admin/carehomes">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Care Homes
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {careHome.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Care Home Profile
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={`/admin/carehomes/${careHome.id}/documents`}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Documents
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Status Alert */}
                {careHome.status === 'suspended' && careHome.rejection_reason && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-800">
                                <Ban className="h-5 w-5" />
                                Account Suspended
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">Suspension Reason:</p>
                            <p className="text-red-700">{careHome.rejection_reason}</p>
                        </CardContent>
                    </Card>
                )}

                {careHome.status === 'rejected' && careHome.rejection_reason && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-800">
                                <XCircle className="h-5 w-5" />
                                Account Rejected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">Rejection Reason:</p>
                            <p className="text-red-700">{careHome.rejection_reason}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Document Stats Summary */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{documentStats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{documentStats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{documentStats.approved}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{documentStats.rejected}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Requires Attention</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{documentStats.requires_attention}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Care Home Information</CardTitle>
                            <CardDescription>Basic details about the care home</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Care Home Name</p>
                                    <p className="font-medium">{careHome.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Account Status</p>
                                    <div className="mt-1">{getStatusBadge(careHome.status)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Registered Date</p>
                                    <p className="font-medium">
                                        {new Date(careHome.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Document Completion</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Progress value={completionPercentage} className="flex-1" />
                                        <span className="text-sm font-medium">{completionPercentage}%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Administrators</CardTitle>
                            <CardDescription>Care home administrators and contacts ({careHome.users.length})</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {careHome.users.length > 0 ? (
                                careHome.users.map((admin, index) => (
                                    <div key={admin.id} className={index > 0 ? 'pt-6 border-t' : ''}>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                                    <p className="font-medium">
                                                        {admin.first_name} {admin.last_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Email</p>
                                                    <p className="font-medium">{admin.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Phone</p>
                                                    <p className="font-medium">{admin.phone || 'Not provided'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Account Created</p>
                                                    <p className="font-medium">
                                                        {new Date(admin.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No administrators assigned</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage this care home's documents and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3 flex-wrap">
                            <Button asChild variant="outline">
                                <Link href={`/admin/carehomes/${careHome.id}/documents`}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Verify Documents
                                </Link>
                            </Button>

                            {/* Status Management Buttons */}
                            {(careHome.status === 'pending' || careHome.status === 'rejected') && (
                                <Button onClick={handleApprove} variant="default">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Care Home
                                </Button>
                            )}

                            {careHome.status === 'pending' && (
                                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject Care Home
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Reject Care Home</DialogTitle>
                                            <DialogDescription>
                                                Please provide a reason for rejecting this care home. This will be visible to the care home administrators.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="reject-reason">Rejection Reason</Label>
                                                <Textarea
                                                    id="reject-reason"
                                                    placeholder="Enter the reason for rejection..."
                                                    value={rejectForm.data.reason}
                                                    onChange={(e) => rejectForm.setData('reason', e.target.value)}
                                                    className="mt-2"
                                                    rows={4}
                                                />
                                                {rejectForm.errors.reason && (
                                                    <p className="text-sm text-red-600 mt-1">{rejectForm.errors.reason}</p>
                                                )}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                onClick={handleReject}
                                                disabled={!rejectForm.data.reason || rejectForm.processing}
                                            >
                                                Confirm Rejection
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {careHome.status === 'suspended' ? (
                                <Dialog open={isUnsuspendDialogOpen} onOpenChange={setIsUnsuspendDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Unsuspend Care Home
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Unsuspend Care Home</DialogTitle>
                                            <DialogDescription>
                                                Please provide a reason for unsuspending this care home. They will be able to post shifts again once unsuspended.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="unsuspend-reason">Reason for Unsuspension</Label>
                                                <Textarea
                                                    id="unsuspend-reason"
                                                    placeholder="Enter the reason for unsuspension..."
                                                    value={unsuspendForm.data.reason}
                                                    onChange={(e) => unsuspendForm.setData('reason', e.target.value)}
                                                    className="mt-2"
                                                    rows={4}
                                                />
                                                {unsuspendForm.errors.reason && (
                                                    <p className="text-sm text-red-600 mt-1">{unsuspendForm.errors.reason}</p>
                                                )}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsUnsuspendDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button 
                                                variant="default" 
                                                onClick={handleUnsuspend}
                                                disabled={!unsuspendForm.data.reason || unsuspendForm.processing}
                                            >
                                                Confirm Unsuspension
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ) : careHome.status === 'approved' && (
                                <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Ban className="h-4 w-4 mr-2" />
                                            Suspend Care Home
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Suspend Care Home</DialogTitle>
                                            <DialogDescription>
                                                Please provide a reason for suspending this care home. They will not be able to post shifts while suspended.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="suspend-reason">Suspension Reason</Label>
                                                <Textarea
                                                    id="suspend-reason"
                                                    placeholder="Enter the reason for suspension..."
                                                    value={suspendForm.data.reason}
                                                    onChange={(e) => suspendForm.setData('reason', e.target.value)}
                                                    className="mt-2"
                                                    rows={4}
                                                />
                                                {suspendForm.errors.reason && (
                                                    <p className="text-sm text-red-600 mt-1">{suspendForm.errors.reason}</p>
                                                )}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                onClick={handleSuspend}
                                                disabled={!suspendForm.data.reason || suspendForm.processing}
                                            >
                                                Confirm Suspension
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Status History */}
                {careHome.status_changes && careHome.status_changes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Status History</CardTitle>
                            <CardDescription>Track of all status changes for this care home</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {careHome.status_changes.map((change) => (
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
