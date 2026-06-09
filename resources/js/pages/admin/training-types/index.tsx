import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Training Types', href: '/admin/training-types' },
];

interface TrainingType {
    id: number;
    name: string;
    description: string | null;
    validity_months: number;
    is_mandatory: boolean;
    is_active: boolean;
    worker_trainings_count: number;
}

interface Props {
    trainingTypes: TrainingType[];
}

const defaultFormData = {
    name: '',
    description: '',
    validity_months: 12,
    is_mandatory: true,
    is_active: true,
};

function validityLabel(months: number) {
    if (months === 12) return '1 year';
    if (months % 12 === 0) return `${months / 12} years`;
    return `${months} months`;
}

export default function TrainingTypesIndex({ trainingTypes }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TrainingType | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TrainingType | null>(null);

    const createForm = useForm({ ...defaultFormData });
    const editForm = useForm({ ...defaultFormData });

    function openEdit(tt: TrainingType) {
        setEditTarget(tt);
        editForm.setData({
            name: tt.name,
            description: tt.description ?? '',
            validity_months: tt.validity_months,
            is_mandatory: tt.is_mandatory,
            is_active: tt.is_active,
        });
    }

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/admin/training-types', {
            onSuccess: () => { setIsCreateOpen(false); createForm.reset(); },
        });
    }

    function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(`/admin/training-types/${editTarget.id}`, {
            onSuccess: () => { setEditTarget(null); },
        });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        useForm({}).delete(`/admin/training-types/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const mandatory = trainingTypes.filter((t) => t.is_mandatory && t.is_active);
    const optional = trainingTypes.filter((t) => !t.is_mandatory && t.is_active);
    const inactive = trainingTypes.filter((t) => !t.is_active);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Training Types" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <GraduationCap className="h-6 w-6" />
                            Training Types
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Define the trainings healthcare workers are required to complete and upload.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Training Type
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: trainingTypes.length, color: '' },
                        { label: 'Mandatory', value: mandatory.length, color: 'text-red-600' },
                        { label: 'Optional', value: optional.length, color: 'text-blue-600' },
                        { label: 'Inactive', value: inactive.length, color: 'text-muted-foreground' },
                    ].map(({ label, value, color }) => (
                        <Card key={label}>
                            <CardContent className="pt-4">
                                <p className="text-xs text-muted-foreground">{label}</p>
                                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Training Types</CardTitle>
                        <CardDescription>
                            Mandatory trainings are required for profile completion. Optional trainings are available but not enforced.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {trainingTypes.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground">
                                <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                <p className="font-medium">No training types yet</p>
                                <p className="text-sm mt-1">Add your first training type to get started.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40">
                                    <tr>
                                        <th className="text-left px-6 py-3 font-medium text-muted-foreground">Name</th>
                                        <th className="text-left px-6 py-3 font-medium text-muted-foreground">Validity</th>
                                        <th className="text-left px-6 py-3 font-medium text-muted-foreground">Type</th>
                                        <th className="text-left px-6 py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="text-left px-6 py-3 font-medium text-muted-foreground">Workers</th>
                                        <th className="px-6 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {trainingTypes.map((tt) => (
                                        <tr key={tt.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium">{tt.name}</p>
                                                {tt.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tt.description}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {validityLabel(tt.validity_months)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {tt.is_mandatory ? (
                                                    <Badge variant="destructive" className="text-xs">Mandatory</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {tt.is_active ? (
                                                    <Badge variant="default" className="text-xs">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {tt.worker_trainings_count}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(tt)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteTarget(tt)}
                                                        disabled={tt.worker_trainings_count > 0}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Training Type</DialogTitle>
                        <DialogDescription>Define a new training that workers will need to complete.</DialogDescription>
                    </DialogHeader>
                    <TrainingTypeForm
                        form={createForm}
                        onSubmit={handleCreate}
                        onCancel={() => { setIsCreateOpen(false); createForm.reset(); }}
                        submitLabel="Create"
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Training Type</DialogTitle>
                        <DialogDescription>Update the details for this training type.</DialogDescription>
                    </DialogHeader>
                    <TrainingTypeForm
                        form={editForm}
                        onSubmit={handleEdit}
                        onCancel={() => setEditTarget(null)}
                        submitLabel="Save Changes"
                        showActiveToggle
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Training Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function TrainingTypeForm({
    form,
    onSubmit,
    onCancel,
    submitLabel,
    showActiveToggle = false,
}: {
    form: ReturnType<typeof useForm<typeof defaultFormData>>;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitLabel: string;
    showActiveToggle?: boolean;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input
                    id="name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    placeholder="e.g. Manual Handling"
                />
                {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.target.value)}
                    placeholder="Optional — describe what this training covers"
                    rows={2}
                />
                {form.errors.description && <p className="text-xs text-destructive">{form.errors.description}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="validity_months">Validity (months) <span className="text-destructive">*</span></Label>
                <Input
                    id="validity_months"
                    type="number"
                    min={1}
                    max={120}
                    value={form.data.validity_months}
                    onChange={(e) => form.setData('validity_months', parseInt(e.target.value) || 12)}
                />
                <p className="text-xs text-muted-foreground">
                    {validityLabel(form.data.validity_months)} — how long before this training expires
                </p>
                {form.errors.validity_months && <p className="text-xs text-destructive">{form.errors.validity_months}</p>}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                    <p className="text-sm font-medium">Mandatory</p>
                    <p className="text-xs text-muted-foreground">Required for profile completion</p>
                </div>
                <Switch
                    checked={form.data.is_mandatory}
                    onCheckedChange={(v: boolean) => form.setData('is_mandatory', v)}
                />
            </div>

            {showActiveToggle && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                        <p className="text-sm font-medium">Active</p>
                        <p className="text-xs text-muted-foreground">Inactive types are hidden from workers</p>
                    </div>
                    <Switch
                        checked={form.data.is_active}
                        onCheckedChange={(v: boolean) => form.setData('is_active', v)}
                    />
                </div>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{submitLabel}</Button>
            </DialogFooter>
        </form>
    );
}
