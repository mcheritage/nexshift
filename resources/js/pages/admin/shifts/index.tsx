import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    CalendarCheck,
    CheckCircle,
    Clock,
    LayoutGrid,
    Search,
    UserCheck,
    UserX,
    X,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Shifts', href: '/admin/shifts' },
];

interface CareHome { id: string; name: string }
interface Worker { id: string; first_name: string; last_name: string; email: string }

interface Shift {
    id: string;
    title: string;
    role: string;
    status: string;
    start_datetime: string;
    end_datetime: string;
    hourly_rate: number;
    total_pay: number;
    is_urgent: boolean;
    care_home: CareHome;
    selected_worker: Worker | null;
    applications_count: number;
    pending_applications_count: number;
    is_pending_assignment: boolean; // true = admin-assigned but worker hasn't accepted yet
}

interface PaginatedShifts {
    data: Shift[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Stats { total: number; published: number; filled: number; completed: number }

interface Filters { status?: string; care_home_id?: string; date_from?: string; date_to?: string }

interface Props {
    shifts: PaginatedShifts;
    careHomes: CareHome[];
    workers: Worker[];
    stats: Stats;
    filters: Filters;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    draft:       { label: 'Draft',       className: 'bg-gray-100 text-gray-700' },
    published:   { label: 'Published',   className: 'bg-blue-100 text-blue-800' },
    filled:      { label: 'Filled',      className: 'bg-yellow-100 text-yellow-800' },
    in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-800' },
    completed:   { label: 'Completed',   className: 'bg-green-100 text-green-800' },
    cancelled:   { label: 'Cancelled',   className: 'bg-red-100 text-red-800' },
};

const roleLabel = (role: string) =>
    role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function AdminShiftsIndex({ shifts, careHomes, workers, stats, filters }: Props) {
    const [assignShift, setAssignShift] = useState<Shift | null>(null);
    const [workerSearch, setWorkerSearch] = useState('');

    const assignForm = useForm({ worker_id: '' });

    const filteredWorkers = workers.filter((w) => {
        const q = workerSearch.toLowerCase();
        return (
            w.first_name.toLowerCase().includes(q) ||
            w.last_name.toLowerCase().includes(q) ||
            w.email.toLowerCase().includes(q)
        );
    });

    const applyFilter = (key: string, value: string) => {
        const resolved = value === 'all' ? undefined : value || undefined;
        router.get('/admin/shifts', { ...filters, [key]: resolved }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        router.get('/admin/shifts', {}, { preserveState: false, replace: true });
    };

    const handleAssign = () => {
        if (!assignShift) return;
        assignForm.post(`/admin/shifts/${assignShift.id}/assign`, {
            onSuccess: () => {
                setAssignShift(null);
                assignForm.reset();
                setWorkerSearch('');
            },
        });
    };

    const handleUnassign = (shift: Shift) => {
        if (!confirm(`Remove the current worker assignment from "${shift.title}"?`)) return;
        router.patch(`/admin/shifts/${shift.id}/unassign`);
    };

    const openAssign = (shift: Shift) => {
        assignForm.reset();
        setWorkerSearch('');
        setAssignShift(shift);
    };

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shifts" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shifts</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View all shifts across care homes and assign workers
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { label: 'Total Shifts', value: stats.total, icon: Calendar, color: '' },
                        { label: 'Published', value: stats.published, icon: LayoutGrid, color: 'text-blue-600' },
                        { label: 'Filled', value: stats.filled, icon: CalendarCheck, color: 'text-yellow-600' },
                        { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[160px]">
                        <Label className="text-xs mb-1 block">Status</Label>
                        <Select value={filters.status ?? 'all'} onValueChange={(v) => applyFilter('status', v)}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="All statuses" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                {Object.entries(statusConfig).map(([val, { label }]) => (
                                    <SelectItem key={val} value={val}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 min-w-[160px]">
                        <Label className="text-xs mb-1 block">Care Home</Label>
                        <Select value={filters.care_home_id ?? 'all'} onValueChange={(v) => applyFilter('care_home_id', v)}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="All care homes" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All care homes</SelectItem>
                                {careHomes.map((ch) => (
                                    <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs mb-1 block">From</Label>
                        <Input
                            type="date"
                            className="h-9 w-36"
                            value={filters.date_from ?? ''}
                            onChange={(e) => applyFilter('date_from', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label className="text-xs mb-1 block">To</Label>
                        <Input
                            type="date"
                            className="h-9 w-36"
                            value={filters.date_to ?? ''}
                            onChange={(e) => applyFilter('date_to', e.target.value)}
                        />
                    </div>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1">
                            <X className="h-3.5 w-3.5" /> Clear
                        </Button>
                    )}
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Shift</TableHead>
                                    <TableHead>Care Home</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Assigned Worker</TableHead>
                                    <TableHead>Applications</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shifts.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                            No shifts found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    shifts.data.map((shift) => {
                                        const sc = statusConfig[shift.status] ?? { label: shift.status, className: 'bg-gray-100 text-gray-700' };
                                        return (
                                            <TableRow key={shift.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{shift.title}</p>
                                                        <p className="text-xs text-muted-foreground">{roleLabel(shift.role)}</p>
                                                        {shift.is_urgent && (
                                                            <Badge className="mt-1 bg-red-100 text-red-700 text-xs">Urgent</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{shift.care_home?.name}</TableCell>
                                                <TableCell className="text-sm">
                                                    <div>{new Date(shift.start_datetime).toLocaleDateString()}</div>
                                                    <div className="text-muted-foreground text-xs">
                                                        {new Date(shift.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {' – '}
                                                        {new Date(shift.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`text-xs ${sc.className}`}>{sc.label}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {shift.selected_worker ? (
                                                        <div>
                                                            <p className="font-medium capitalize">
                                                                {shift.selected_worker.first_name} {shift.selected_worker.last_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">{shift.selected_worker.email}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic text-xs">Unassigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span>{shift.pending_applications_count} pending</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{shift.applications_count} total</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1.5 justify-end">
                                                        {/* Assign: only on open shifts or admin-assigned-but-pending */}
                                                        {(shift.status === 'published' || shift.is_pending_assignment) && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openAssign(shift)}
                                                                className="gap-1"
                                                            >
                                                                <UserCheck className="h-3.5 w-3.5" />
                                                                {shift.is_pending_assignment ? 'Reassign' : 'Assign'}
                                                            </Button>
                                                        )}
                                                        {/* Unassign: only when admin assigned and worker hasn't accepted yet */}
                                                        {shift.is_pending_assignment && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleUnassign(shift)}
                                                                className="gap-1 text-red-600 hover:text-red-700"
                                                            >
                                                                <UserX className="h-3.5 w-3.5" />
                                                                Unassign
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {shifts.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-6 py-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(shifts.current_page - 1) * shifts.per_page + 1}–
                                    {Math.min(shifts.current_page * shifts.per_page, shifts.total)} of {shifts.total}
                                </p>
                                <div className="flex gap-2">
                                    {shifts.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            size="sm"
                                            variant={link.active ? 'default' : 'outline'}
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

            {/* Assign Worker Dialog */}
            <Dialog open={!!assignShift} onOpenChange={(open) => { if (!open) { setAssignShift(null); assignForm.reset(); setWorkerSearch(''); } }}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Assign Worker</DialogTitle>
                        <DialogDescription>
                            Select a care worker for <strong>{assignShift?.title}</strong> at{' '}
                            <strong>{assignShift?.care_home?.name}</strong>.
                            The worker will be notified and must accept the shift.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Current assignment info */}
                        {assignShift?.selected_worker && (
                            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm">
                                <span className="font-medium">Currently assigned: </span>
                                {assignShift.selected_worker.first_name} {assignShift.selected_worker.last_name} ({assignShift.selected_worker.email})
                                <span className="block text-yellow-700 text-xs mt-1">Reassigning will remove the current assignment.</span>
                            </div>
                        )}

                        {/* Worker search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search workers by name or email..."
                                value={workerSearch}
                                onChange={(e) => setWorkerSearch(e.target.value)}
                            />
                        </div>

                        {/* Worker list */}
                        <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
                            {filteredWorkers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No workers found</p>
                            ) : (
                                filteredWorkers.map((w) => (
                                    <label
                                        key={w.id}
                                        className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors ${assignForm.data.worker_id === w.id ? 'bg-primary/5' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="worker_id"
                                            value={w.id}
                                            checked={assignForm.data.worker_id === w.id}
                                            onChange={() => assignForm.setData('worker_id', w.id)}
                                            className="accent-primary"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium capitalize">
                                                {w.first_name} {w.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">{w.email}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        {assignForm.errors.worker_id && (
                            <p className="text-xs text-red-500">{assignForm.errors.worker_id}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setAssignShift(null); assignForm.reset(); setWorkerSearch(''); }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!assignForm.data.worker_id || assignForm.processing}
                        >
                            {assignForm.processing ? 'Assigning...' : 'Assign Worker'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
