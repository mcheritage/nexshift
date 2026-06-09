import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Ban,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    FileText,
    Shield,
    Star,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Health Care Workers', href: '/admin/healthcare-workers' },
    { title: 'Worker Details', href: '#' },
];

interface WorkExperience {
    id: string;
    company_name: string;
    position: string;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
}

interface Skill {
    id: string;
    name: string;
    category: string | null;
    proficiency_level: string | null;
    years_experience: number | null;
}

interface StatusChange {
    id: string;
    old_status: string | null;
    new_status: string;
    action: string;
    reason: string | null;
    created_at: string;
    changed_by: { id: string; first_name: string; last_name: string } | null;
}

interface HealthCareWorker {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    gender: string | null;
    date_of_birth: string | null;
    profile_photo: string | null;
    qualifications: string[];
    hourly_rate_min: number | null;
    hourly_rate_max: number | null;
    status: string;
    rejection_reason: string | null;
    approved_at: string | null;
    created_at: string;
    care_home: { id: string; name: string } | null;
    status_changes: StatusChange[];
    work_experiences: WorkExperience[];
    skills: Skill[];
}

interface DocumentStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    requires_attention: number;
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
    documentStats: DocumentStats;
    totalRequired: number;
    stripeStatus?: StripeStatus | null;
}

const statusConfig = {
    pending: { variant: 'secondary' as const, color: 'text-yellow-600', icon: Clock, label: 'Pending' },
    approved: { variant: 'default' as const, color: 'text-green-600', icon: CheckCircle, label: 'Approved' },
    rejected: { variant: 'destructive' as const, color: 'text-red-600', icon: XCircle, label: 'Rejected' },
    suspended: { variant: 'destructive' as const, color: 'text-orange-600', icon: Ban, label: 'Suspended' },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;
    const Icon = cfg.icon;
    return (
        <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit">
            <Icon className="h-3 w-3" />
            {cfg.label}
        </Badge>
    );
}

function AvatarDisplay({ worker, onClick }: { worker: HealthCareWorker; onClick: () => void }) {
    const initials = `${worker.first_name[0] ?? ''}${worker.last_name[0] ?? ''}`.toUpperCase();
    return (
        <button
            onClick={onClick}
            className="flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer group relative"
            title="View photo"
        >
            {worker.profile_photo ? (
                <img
                    src={worker.profile_photo}
                    alt={`${worker.first_name} ${worker.last_name}`}
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-border group-hover:opacity-80 transition-opacity"
                />
            ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border group-hover:bg-primary/20 transition-colors">
                    <span className="text-2xl font-bold text-primary">{initials}</span>
                </div>
            )}
        </button>
    );
}

function formatDate(d: string | null | undefined) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateRange(start: string | null, end: string | null, isCurrent: boolean) {
    const s = start ? new Date(start).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '?';
    const e = isCurrent ? 'Present' : end ? new Date(end).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '?';
    return `${s} – ${e}`;
}

export default function HealthCareWorkerShow({ healthCareWorker: worker, documentStats, totalRequired, stripeStatus }: Props) {
    const completionPct = totalRequired > 0 ? Math.round((documentStats.approved / totalRequired) * 100) : 0;

    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isSuspendOpen, setIsSuspendOpen] = useState(false);
    const [isUnsuspendOpen, setIsUnsuspendOpen] = useState(false);
    const [isPhotoOpen, setIsPhotoOpen] = useState(false);

    const rejectForm = useForm({ reason: '' });
    const suspendForm = useForm({ reason: '' });
    const unsuspendForm = useForm({ reason: '' });

    const handleApprove = () => {
        router.patch(`/admin/healthcare-workers/${worker.id}/approve`, {}, {
            onSuccess: () => { setIsApproveOpen(false); router.reload(); },
        });
    };

    const handleReject = () => {
        rejectForm.patch(`/admin/healthcare-workers/${worker.id}/reject`, {
            onSuccess: () => { setIsRejectOpen(false); rejectForm.reset(); router.reload(); },
        });
    };

    const handleSuspend = () => {
        suspendForm.patch(`/admin/healthcare-workers/${worker.id}/suspend`, {
            onSuccess: () => { setIsSuspendOpen(false); suspendForm.reset(); router.reload(); },
        });
    };

    const handleUnsuspend = () => {
        unsuspendForm.patch(`/admin/healthcare-workers/${worker.id}/unsuspend`, {
            onSuccess: () => { setIsUnsuspendOpen(false); unsuspendForm.reset(); router.reload(); },
        });
    };

    const actionIcons: Record<string, React.ElementType> = {
        approve: CheckCircle,
        reject: XCircle,
        suspend: Ban,
        unsuspend: Shield,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${worker.first_name} ${worker.last_name} — Worker Profile`} />

            <div className="space-y-6 p-6">
                {/* Back button — separate row so it doesn't crowd the name */}
                <div>
                    <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
                        <Link href="/admin/healthcare-workers">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Workers
                        </Link>
                    </Button>
                </div>

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <AvatarDisplay worker={worker} onClick={() => setIsPhotoOpen(true)} />
                        <div>
                            <h1 className="text-3xl font-bold capitalize">
                                {worker.first_name} {worker.last_name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <StatusBadge status={worker.status} />
                                {worker.care_home && (
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        {worker.care_home.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 items-start">
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline">
                                <Link href={`/admin/workers/${worker.id}/documents`}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Documents
                                </Link>
                            </Button>
                            {worker.status === 'pending' && (
                                <>
                                    <Button variant="default" onClick={() => setIsApproveOpen(true)}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button variant="destructive" onClick={() => setIsRejectOpen(true)}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </>
                            )}
                            {worker.status === 'approved' && (
                                <Button variant="destructive" onClick={() => setIsSuspendOpen(true)}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend
                                </Button>
                            )}
                            {worker.status === 'rejected' && (
                                <Button variant="default" onClick={() => setIsApproveOpen(true)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            )}
                            {worker.status === 'suspended' && (
                                <Button variant="outline" onClick={() => setIsUnsuspendOpen(true)}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Unsuspend
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status alerts */}
                {(worker.status === 'suspended' || worker.status === 'rejected') && worker.rejection_reason && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                        <CardContent className="pt-4">
                            <p className="text-sm font-semibold text-red-800 dark:text-red-200 flex items-center gap-2 mb-1">
                                {worker.status === 'suspended'
                                    ? <><Ban className="h-4 w-4" /> Account Suspended</>
                                    : <><XCircle className="h-4 w-4" /> Account Rejected</>
                                }
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300">{worker.rejection_reason}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Document Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                    {[
                        { label: 'Total Documents', value: documentStats.total, icon: FileText, color: 'text-muted-foreground' },
                        { label: 'Pending', value: documentStats.pending, icon: Clock, color: 'text-yellow-600' },
                        { label: 'Approved', value: documentStats.approved, icon: CheckCircle, color: 'text-green-600' },
                        { label: 'Rejected', value: documentStats.rejected, icon: XCircle, color: 'text-red-600' },
                        { label: 'Needs Attention', value: documentStats.requires_attention, icon: AlertTriangle, color: 'text-orange-600' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Link key={label} href={`/admin/workers/${worker.id}/documents`}>
                            <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                    <Icon className={`h-4 w-4 ${color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Document completion */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Document Completion</span>
                            <span className="text-sm font-medium">{completionPct}%</span>
                        </div>
                        <Progress value={completionPct} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {documentStats.approved} of {totalRequired} required documents approved
                        </p>
                    </CardContent>
                </Card>

                {/* Personal + Professional */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Basic details about the worker</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { label: 'Full Name', value: `${worker.first_name} ${worker.last_name}`, capitalize: true },
                                { label: 'Email', value: worker.email },
                                { label: 'Phone', value: worker.phone_number },
                                { label: 'Gender', value: worker.gender ? worker.gender.charAt(0).toUpperCase() + worker.gender.slice(1) : null },
                                { label: 'Date of Birth', value: formatDate(worker.date_of_birth) },
                                { label: 'Joined', value: formatDate(worker.created_at) },
                                { label: 'Approved Date', value: worker.approved_at ? formatDate(worker.approved_at) : null },
                            ].map(({ label, value, capitalize: cap }) =>
                                value ? (
                                    <div key={label} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className={`font-medium text-right${cap ? ' capitalize' : ''}`}>{value}</span>
                                    </div>
                                ) : null
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Professional Information
                            </CardTitle>
                            <CardDescription>Work-related details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {worker.care_home && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Assigned Care Home</span>
                                    <Link
                                        href={`/admin/carehomes/${worker.care_home.id}`}
                                        className="font-medium text-primary hover:underline text-right"
                                    >
                                        {worker.care_home.name}
                                    </Link>
                                </div>
                            )}
                            {(worker.hourly_rate_min || worker.hourly_rate_max) && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Hourly Rate</span>
                                    <span className="font-medium">
                                        {worker.hourly_rate_min != null && worker.hourly_rate_max != null
                                            ? `£${worker.hourly_rate_min} – £${worker.hourly_rate_max}`
                                            : worker.hourly_rate_min != null
                                            ? `From £${worker.hourly_rate_min}`
                                            : `Up to £${worker.hourly_rate_max}`}
                                    </span>
                                </div>
                            )}
                            {worker.qualifications && worker.qualifications.length > 0 && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground block mb-1">Qualifications</span>
                                    <div className="flex flex-wrap gap-1">
                                        {worker.qualifications.map((q, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">{q}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {worker.qualifications?.length === 0 && !worker.hourly_rate_min && !worker.care_home && (
                                <p className="text-sm text-muted-foreground">No professional details added yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Skills */}
                {worker.skills && worker.skills.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Skills
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {worker.skills.map((skill) => (
                                    <div key={skill.id} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                                        <span className="font-medium">{skill.name}</span>
                                        {skill.proficiency_level && (
                                            <span className="text-muted-foreground text-xs">· {skill.proficiency_level}</span>
                                        )}
                                        {skill.years_experience != null && skill.years_experience > 0 && (
                                            <span className="text-muted-foreground text-xs">· {skill.years_experience}y</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Work Experience */}
                {worker.work_experiences && worker.work_experiences.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Work Experience
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {worker.work_experiences.map((we) => (
                                <div key={we.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                                    <div className="mt-1 h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium">{we.position}</p>
                                        <p className="text-sm text-muted-foreground">{we.company_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateRange(we.start_date, we.end_date, we.is_current)}
                                        </p>
                                        {we.description && (
                                            <p className="text-sm mt-1 text-muted-foreground">{we.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Stripe */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Account
                        </CardTitle>
                        <CardDescription>Stripe Connect account for receiving payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stripeStatus ? (
                            <div className="grid gap-3 sm:grid-cols-2 text-sm">
                                {[
                                    { label: 'Status', value: stripeStatus.onboarding_complete ? 'Connected' : 'Pending Setup' },
                                    { label: 'Account Type', value: stripeStatus.account_type || 'Express' },
                                    { label: 'Charges Enabled', value: stripeStatus.charges_enabled ? 'Yes' : 'No' },
                                    { label: 'Payouts Enabled', value: stripeStatus.payouts_enabled ? 'Yes' : 'No' },
                                    { label: 'Connected', value: formatDate(stripeStatus.connected_at) },
                                    { label: 'Account ID', value: stripeStatus.account_id },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className="font-medium font-mono text-xs text-right">{value}</span>
                                    </div>
                                ))}
                                {!stripeStatus.onboarding_complete && (
                                    <div className="sm:col-span-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-2">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            Stripe onboarding has started but isn't complete yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No payment account connected yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status History */}
                {worker.status_changes && worker.status_changes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Status History</CardTitle>
                            <CardDescription>All account status changes for this worker</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {worker.status_changes.map((change) => {
                                const Icon = actionIcons[change.action] ?? Shield;
                                return (
                                    <div key={change.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {change.old_status ? `${change.old_status} → ${change.new_status}` : change.new_status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(change.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            {change.changed_by && (
                                                <p className="text-xs text-muted-foreground">
                                                    By {change.changed_by.first_name} {change.changed_by.last_name}
                                                </p>
                                            )}
                                            {change.reason && (
                                                <p className="text-sm mt-1 p-2 bg-muted rounded text-muted-foreground">
                                                    {change.reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Photo Modal */}
            <Dialog open={isPhotoOpen} onOpenChange={setIsPhotoOpen}>
                <DialogContent className="max-w-sm p-4">
                    <DialogHeader>
                        <DialogTitle>{worker.first_name} {worker.last_name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center">
                        {worker.profile_photo ? (
                            <img
                                src={worker.profile_photo}
                                alt={`${worker.first_name} ${worker.last_name}`}
                                className="w-full rounded-lg object-cover"
                            />
                        ) : (
                            <div className="h-48 w-48 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-6xl font-bold text-primary">
                                    {`${worker.first_name[0] ?? ''}${worker.last_name[0] ?? ''}`.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Healthcare Worker</DialogTitle>
                        <DialogDescription>
                            This will approve {worker.first_name} {worker.last_name} and grant them access to the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
                        <Button onClick={handleApprove}>Confirm Approval</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Healthcare Worker</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting {worker.first_name} {worker.last_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="reject-reason">Reason</Label>
                        <Textarea
                            id="reject-reason"
                            placeholder="Enter rejection reason..."
                            value={rejectForm.data.reason}
                            onChange={(e) => rejectForm.setData('reason', e.target.value)}
                        />
                        {rejectForm.errors.reason && (
                            <p className="text-sm text-destructive">{rejectForm.errors.reason}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectForm.data.reason || rejectForm.processing}>
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Suspend Dialog */}
            <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Suspend Healthcare Worker</DialogTitle>
                        <DialogDescription>
                            Provide a reason for suspending {worker.first_name} {worker.last_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="suspend-reason">Reason</Label>
                        <Textarea
                            id="suspend-reason"
                            placeholder="Enter suspension reason..."
                            value={suspendForm.data.reason}
                            onChange={(e) => suspendForm.setData('reason', e.target.value)}
                        />
                        {suspendForm.errors.reason && (
                            <p className="text-sm text-destructive">{suspendForm.errors.reason}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSuspendOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleSuspend} disabled={!suspendForm.data.reason || suspendForm.processing}>
                            Confirm Suspension
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unsuspend Dialog */}
            <Dialog open={isUnsuspendOpen} onOpenChange={setIsUnsuspendOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unsuspend Healthcare Worker</DialogTitle>
                        <DialogDescription>
                            This will restore access for {worker.first_name} {worker.last_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUnsuspendOpen(false)}>Cancel</Button>
                        <Button onClick={handleUnsuspend} disabled={unsuspendForm.processing}>
                            Confirm Unsuspend
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
