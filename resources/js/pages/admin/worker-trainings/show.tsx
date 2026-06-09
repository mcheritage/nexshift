import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    CheckCircle,
    Clock,
    Download,
    GraduationCap,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface TrainingRecord {
    id: string;
    completed_at: string;
    expires_at: string;
    status: 'pending' | 'approved' | 'rejected';
    compliance_status: string;
    rejection_reason: string | null;
    certificate_original_name: string | null;
    has_certificate: boolean;
    notes: string | null;
    reviewed_at: string | null;
    reviewed_by: { id: string; first_name: string; last_name: string } | null;
}

interface TrainingType {
    id: number;
    name: string;
    description: string | null;
    validity_months: number;
    is_mandatory: boolean;
    is_active: boolean;
    training: TrainingRecord | null;
}

interface Worker {
    id: string;
    first_name: string;
    last_name: string;
}

interface Props {
    worker: Worker;
    trainingTypes: TrainingType[];
}

const complianceConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType; color: string }> = {
    valid:         { label: 'Valid',          variant: 'default',      icon: CheckCircle,   color: 'text-green-600' },
    expiring_soon: { label: 'Expiring Soon',  variant: 'secondary',    icon: AlertTriangle, color: 'text-yellow-600' },
    expired:       { label: 'Expired',        variant: 'destructive',  icon: XCircle,       color: 'text-red-600' },
    pending:       { label: 'Pending Review', variant: 'secondary',    icon: Clock,         color: 'text-blue-600' },
    rejected:      { label: 'Rejected',       variant: 'destructive',  icon: XCircle,       color: 'text-red-600' },
    approved:      { label: 'Valid',          variant: 'default',      icon: CheckCircle,   color: 'text-green-600' },
};

function ComplianceBadge({ status }: { status: string }) {
    const cfg = complianceConfig[status] ?? complianceConfig.pending;
    const Icon = cfg.icon;
    return (
        <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit text-xs">
            <Icon className="h-3 w-3" />
            {cfg.label}
        </Badge>
    );
}

function formatDate(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function validityLabel(months: number) {
    if (months === 12) return '1 year';
    if (months % 12 === 0) return `${months / 12} years`;
    return `${months} months`;
}

export default function AdminWorkerTrainingsShow({ worker, trainingTypes }: Props) {
    const [rejectTarget, setRejectTarget] = useState<TrainingType | null>(null);
    const rejectForm = useForm({ reason: '' });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Health Care Workers', href: '/admin/healthcare-workers' },
        { title: `${worker.first_name} ${worker.last_name}`, href: `/admin/healthcare-workers/${worker.id}` },
        { title: 'Trainings', href: '#' },
    ];

    function handleApprove(type: TrainingType) {
        if (!type.training) return;
        useForm({}).patch(`/admin/workers/${worker.id}/trainings/${type.training.id}/approve`, {});
    }

    function handleReject(e: React.FormEvent) {
        e.preventDefault();
        if (!rejectTarget?.training) return;
        rejectForm.patch(`/admin/workers/${worker.id}/trainings/${rejectTarget.training.id}/reject`, {
            onSuccess: () => { setRejectTarget(null); rejectForm.reset(); },
        });
    }

    const mandatory = trainingTypes.filter((t) => t.is_mandatory);
    const optional = trainingTypes.filter((t) => !t.is_mandatory);
    const uploaded = trainingTypes.filter((t) => t.training);
    const approved = trainingTypes.filter((t) => t.training?.compliance_status === 'valid' || t.training?.compliance_status === 'approved');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Trainings — ${worker.first_name} ${worker.last_name}`} />

            <div className="space-y-6 p-6">
                <div>
                    <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
                        <Link href={`/admin/healthcare-workers/${worker.id}`}>
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Profile
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <GraduationCap className="h-6 w-6" />
                            Trainings
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1 capitalize">
                            {worker.first_name} {worker.last_name}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Types', value: trainingTypes.length, color: '' },
                        { label: 'Uploaded', value: uploaded.length, color: '' },
                        { label: 'Valid', value: approved.length, color: 'text-green-600' },
                        { label: 'Pending Review', value: trainingTypes.filter((t) => t.training?.status === 'pending').length, color: 'text-yellow-600' },
                    ].map(({ label, value, color }) => (
                        <Card key={label}>
                            <CardContent className="pt-4">
                                <p className="text-xs text-muted-foreground">{label}</p>
                                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Mandatory */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mandatory Trainings</CardTitle>
                        <CardDescription>
                            {approved.filter((t) => t.is_mandatory).length} of {mandatory.length} valid
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <AdminTrainingList
                            types={mandatory}
                            workerId={worker.id}
                            onApprove={handleApprove}
                            onReject={setRejectTarget}
                        />
                    </CardContent>
                </Card>

                {/* Optional */}
                {optional.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Optional Trainings</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <AdminTrainingList
                                types={optional}
                                workerId={worker.id}
                                onApprove={handleApprove}
                                onReject={setRejectTarget}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Reject Dialog */}
            <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) { setRejectTarget(null); rejectForm.reset(); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Training</DialogTitle>
                        <DialogDescription>{rejectTarget?.name}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReject} className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="reason">Reason <span className="text-destructive">*</span></Label>
                            <Textarea
                                id="reason"
                                placeholder="Explain why this training record is being rejected..."
                                value={rejectForm.data.reason}
                                onChange={(e) => rejectForm.setData('reason', e.target.value)}
                            />
                            {rejectForm.errors.reason && (
                                <p className="text-xs text-destructive">{rejectForm.errors.reason}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setRejectTarget(null); rejectForm.reset(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={!rejectForm.data.reason || rejectForm.processing}>
                                Confirm Rejection
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function AdminTrainingList({
    types,
    workerId,
    onApprove,
    onReject,
}: {
    types: TrainingType[];
    workerId: string;
    onApprove: (t: TrainingType) => void;
    onReject: (t: TrainingType) => void;
}) {
    return (
        <div className="divide-y">
            {types.map((type) => {
                const rec = type.training;
                return (
                    <div key={type.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-6 py-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-medium text-sm">{type.name}</p>
                                {rec ? (
                                    <ComplianceBadge status={rec.compliance_status} />
                                ) : (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">Not uploaded</Badge>
                                )}
                                {!type.is_active && (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">Inactive type</Badge>
                                )}
                            </div>
                            {type.description && (
                                <p className="text-xs text-muted-foreground mb-1">{type.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">Validity: {validityLabel(type.validity_months)}</p>
                            {rec && (
                                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <CalendarDays className="h-3 w-3" />
                                        Completed {formatDate(rec.completed_at)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Expires {formatDate(rec.expires_at)}
                                    </span>
                                </div>
                            )}
                            {rec?.notes && (
                                <p className="text-xs text-muted-foreground mt-1 italic">"{rec.notes}"</p>
                            )}
                            {rec?.rejection_reason && (
                                <p className="text-xs text-destructive mt-1">Rejected: {rec.rejection_reason}</p>
                            )}
                            {rec?.reviewed_by && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Reviewed by {rec.reviewed_by.first_name} {rec.reviewed_by.last_name} · {formatDate(rec.reviewed_at)}
                                </p>
                            )}
                        </div>

                        {rec && (
                            <div className="flex items-center gap-2 shrink-0">
                                {rec.has_certificate && (
                                    <Button asChild variant="ghost" size="sm">
                                        <a href={`/admin/workers/${workerId}/trainings/${rec.id}/download`}>
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {rec.status === 'pending' && (
                                    <>
                                        <Button size="sm" variant="default" onClick={() => onApprove(type)}>
                                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                            Approve
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => onReject(type)}>
                                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                            Reject
                                        </Button>
                                    </>
                                )}
                                {(rec.status === 'approved' || rec.status === 'rejected') && (
                                    <Button size="sm" variant="outline" onClick={() => onReject(type)}>
                                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                        Reject
                                    </Button>
                                )}
                                {rec.status === 'rejected' && (
                                    <Button size="sm" variant="default" onClick={() => onApprove(type)}>
                                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                        Approve
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
