import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle,
    Clock,
    Download,
    GraduationCap,
    RefreshCw,
    Trash2,
    Upload,
    XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/worker/dashboard' },
    { title: 'My Trainings', href: '/worker/trainings' },
];

interface TrainingRecord {
    id: string;
    completed_at: string;
    expires_at: string;
    status: 'pending' | 'approved' | 'rejected';
    compliance_status: 'pending' | 'approved' | 'valid' | 'expiring_soon' | 'expired' | 'rejected';
    rejection_reason: string | null;
    certificate_original_name: string | null;
    has_certificate: boolean;
    notes: string | null;
    created_at: string;
}

interface TrainingType {
    id: number;
    name: string;
    description: string | null;
    validity_months: number;
    is_mandatory: boolean;
    training: TrainingRecord | null;
}

interface Props {
    trainingTypes: TrainingType[];
}

const complianceConfig = {
    valid:          { label: 'Valid',          variant: 'default'     as const, icon: CheckCircle,   color: 'text-green-600' },
    expiring_soon:  { label: 'Expiring Soon',  variant: 'secondary'   as const, icon: AlertTriangle, color: 'text-yellow-600' },
    expired:        { label: 'Expired',        variant: 'destructive' as const, icon: XCircle,       color: 'text-red-600' },
    pending:        { label: 'Pending Review', variant: 'secondary'   as const, icon: Clock,         color: 'text-blue-600' },
    rejected:       { label: 'Rejected',       variant: 'destructive' as const, icon: XCircle,       color: 'text-red-600' },
    approved:       { label: 'Valid',          variant: 'default'     as const, icon: CheckCircle,   color: 'text-green-600' },
};

function ComplianceBadge({ status }: { status: string }) {
    const cfg = complianceConfig[status as keyof typeof complianceConfig] ?? complianceConfig.pending;
    const Icon = cfg.icon;
    return (
        <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit text-xs">
            <Icon className="h-3 w-3" />
            {cfg.label}
        </Badge>
    );
}

function validityLabel(months: number) {
    if (months === 12) return '1 year';
    if (months % 12 === 0) return `${months / 12} years`;
    return `${months} months`;
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function WorkerTrainings({ trainingTypes }: Props) {
    const [uploadTarget, setUploadTarget] = useState<TrainingType | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TrainingRecord & { name: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadForm = useForm<{
        training_type_id: number | '';
        completed_at: string;
        certificate: File | null;
        notes: string;
    }>({
        training_type_id: '',
        completed_at: '',
        certificate: null,
        notes: '',
    });

    function openUpload(type: TrainingType) {
        setUploadTarget(type);
        uploadForm.setData({
            training_type_id: type.id,
            completed_at: type.training?.completed_at ?? '',
            certificate: null,
            notes: type.training?.notes ?? '',
        });
    }

    function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        uploadForm.post('/worker/trainings', {
            forceFormData: true,
            onSuccess: () => { setUploadTarget(null); uploadForm.reset(); },
        });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(`/worker/trainings/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const mandatory = trainingTypes.filter((t) => t.is_mandatory);
    const optional = trainingTypes.filter((t) => !t.is_mandatory);

    const uploadedCount = trainingTypes.filter((t) => t.training).length;
    const validCount = trainingTypes.filter(
        (t) => t.training && (t.training.compliance_status === 'valid' || t.training.compliance_status === 'approved'),
    ).length;
    const expiringSoonCount = trainingTypes.filter((t) => t.training?.compliance_status === 'expiring_soon').length;
    const expiredCount = trainingTypes.filter(
        (t) => t.training?.compliance_status === 'expired' || t.training?.compliance_status === 'rejected',
    ).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Trainings" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-6 w-6" />
                        My Trainings
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Upload and manage your training certificates. Mandatory trainings are required to work shifts.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Required', value: mandatory.length, color: '' },
                        { label: 'Valid', value: validCount, color: 'text-green-600' },
                        { label: 'Expiring Soon', value: expiringSoonCount, color: 'text-yellow-600' },
                        { label: 'Expired / Rejected', value: expiredCount, color: 'text-red-600' },
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
                            These must be completed and kept up to date. {mandatory.filter((t) => t.training?.compliance_status === 'valid' || t.training?.compliance_status === 'approved').length} of {mandatory.length} valid.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <TrainingList types={mandatory} onUpload={openUpload} onDelete={(t, r) => setDeleteTarget({ ...r, name: t.name })} />
                    </CardContent>
                </Card>

                {/* Optional */}
                {optional.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Optional Trainings</CardTitle>
                            <CardDescription>
                                These are not required but may improve your profile and employability.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <TrainingList types={optional} onUpload={openUpload} onDelete={(t, r) => setDeleteTarget({ ...r, name: t.name })} />
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Upload / Re-upload Dialog */}
            <Dialog open={!!uploadTarget} onOpenChange={(open) => { if (!open) { setUploadTarget(null); uploadForm.reset(); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{uploadTarget?.training ? 'Update' : 'Upload'} Training</DialogTitle>
                        <DialogDescription>{uploadTarget?.name}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <input type="hidden" value={uploadTarget?.id ?? ''} />
                        <div className="space-y-1.5">
                            <Label htmlFor="completed_at">Completion Date <span className="text-destructive">*</span></Label>
                            <Input
                                id="completed_at"
                                type="date"
                                max={new Date().toISOString().split('T')[0]}
                                value={uploadForm.data.completed_at}
                                onChange={(e) => uploadForm.setData('completed_at', e.target.value)}
                            />
                            {uploadForm.errors.completed_at && (
                                <p className="text-xs text-destructive">{uploadForm.errors.completed_at}</p>
                            )}
                            {uploadForm.data.completed_at && uploadTarget && (
                                <p className="text-xs text-muted-foreground">
                                    Expires: {formatDate(
                                        new Date(new Date(uploadForm.data.completed_at).setMonth(
                                            new Date(uploadForm.data.completed_at).getMonth() + uploadTarget.validity_months
                                        )).toISOString().split('T')[0]
                                    )}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="certificate">
                                Certificate {uploadTarget?.training?.has_certificate ? '(upload new to replace)' : ''}
                            </Label>
                            <Input
                                id="certificate"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                ref={fileInputRef}
                                onChange={(e) => uploadForm.setData('certificate', e.target.files?.[0] ?? null)}
                            />
                            <p className="text-xs text-muted-foreground">PDF, JPG or PNG — max 10MB</p>
                            {uploadTarget?.training?.certificate_original_name && !uploadForm.data.certificate && (
                                <p className="text-xs text-muted-foreground">
                                    Current: {uploadTarget.training.certificate_original_name}
                                </p>
                            )}
                            {uploadForm.errors.certificate && (
                                <p className="text-xs text-destructive">{uploadForm.errors.certificate}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                rows={2}
                                placeholder="Any additional context..."
                                value={uploadForm.data.notes}
                                onChange={(e) => uploadForm.setData('notes', e.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setUploadTarget(null); uploadForm.reset(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={uploadForm.processing || !uploadForm.data.completed_at}>
                                {uploadTarget?.training ? <><RefreshCw className="h-4 w-4 mr-2" />Update</> : <><Upload className="h-4 w-4 mr-2" />Upload</>}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Training Record</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove your <strong>{deleteTarget?.name}</strong> training record? The uploaded certificate will also be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function TrainingList({
    types,
    onUpload,
    onDelete,
}: {
    types: TrainingType[];
    onUpload: (t: TrainingType) => void;
    onDelete: (t: TrainingType, r: TrainingRecord) => void;
}) {
    if (types.length === 0) {
        return (
            <div className="py-10 text-center text-sm text-muted-foreground">No trainings in this category.</div>
        );
    }

    return (
        <div className="divide-y">
            {types.map((type) => {
                const rec = type.training;
                return (
                    <div key={type.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <p className="font-medium text-sm">{type.name}</p>
                                {rec && <ComplianceBadge status={rec.compliance_status} />}
                                {!rec && (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">Not uploaded</Badge>
                                )}
                            </div>
                            {type.description && (
                                <p className="text-xs text-muted-foreground">{type.description}</p>
                            )}
                            {rec && (
                                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
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
                            {rec?.rejection_reason && (
                                <p className="text-xs text-destructive mt-1">Rejected: {rec.rejection_reason}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {rec?.has_certificate && (
                                <Button asChild variant="ghost" size="sm">
                                    <a href={`/worker/trainings/${rec.id}/download`}>
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => onUpload(type)}>
                                {rec ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Update</> : <><Upload className="h-3.5 w-3.5 mr-1.5" />Upload</>}
                            </Button>
                            {rec && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => onDelete(type, rec)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
