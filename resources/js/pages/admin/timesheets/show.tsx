import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Clock,
    Mail,
    MessageSquare,
    Phone,
    PoundSterling,
    User,
} from 'lucide-react';

interface Worker {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
}

interface CareHome {
    id: string;
    name: string;
    address?: string;
    postcode?: string;
    phone_number?: string;
}

interface Shift {
    id: string;
    title: string;
    role: string;
    start_datetime: string;
    end_datetime: string;
}

interface Approver {
    id: string;
    first_name: string;
    last_name: string;
}

interface StatusHistoryEntry {
    id: string;
    status: string;
    notes?: string;
    created_at: string;
    changed_by?: Approver;
}

interface Timesheet {
    id: string;
    status: string;
    clock_in_time: string;
    clock_out_time: string | null;
    break_duration_minutes: number;
    total_hours: string;
    hourly_rate: string;
    overtime_hours: string | null;
    overtime_rate: string | null;
    has_overtime: boolean;
    total_pay: string;
    worker_notes: string | null;
    manager_notes: string | null;
    submitted_at: string | null;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
    worker: Worker;
    care_home: CareHome;
    shift: Shift | null;
    approver: Approver | null;
    status_history: StatusHistoryEntry[];
}

interface Props { timesheet: Timesheet }

const statusConfig: Record<string, { label: string; className: string }> = {
    draft:     { label: 'Draft',     className: 'bg-gray-100 text-gray-700' },
    submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800' },
    approved:  { label: 'Approved',  className: 'bg-green-100 text-green-800' },
    queried:   { label: 'Queried',   className: 'bg-yellow-100 text-yellow-800' },
    rejected:  { label: 'Rejected',  className: 'bg-red-100 text-red-800' },
    paid:      { label: 'Paid',      className: 'bg-purple-100 text-purple-800' },
};

const statusHistoryBg: Record<string, string> = {
    draft:     'bg-gray-50 dark:bg-gray-800',
    submitted: 'bg-blue-50 dark:bg-blue-900/20',
    approved:  'bg-green-50 dark:bg-green-900/20',
    queried:   'bg-yellow-50 dark:bg-yellow-900/20',
    rejected:  'bg-red-50 dark:bg-red-900/20',
    paid:      'bg-purple-50 dark:bg-purple-900/20',
};

const gbp = (n: string | number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n));

const fmtDT = (d: string | null) =>
    d ? new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—';

const fmtBreak = (mins: number) => {
    if (!mins) return 'None';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min${m !== 1 ? 's' : ''}`;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
        </div>
    );
}

export default function AdminTimesheetShow({ timesheet }: Props) {
    const cfg = statusConfig[timesheet.status] ?? { label: timesheet.status, className: 'bg-gray-100 text-gray-700' };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Timesheets', href: '/admin/timesheets' },
        { title: `${timesheet.worker.first_name} ${timesheet.worker.last_name}`, href: `/admin/timesheets/${timesheet.id}` },
    ];

    const shiftRole = timesheet.shift?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ?? '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Timesheet — ${timesheet.worker.first_name} ${timesheet.worker.last_name}`} />

            <div className="flex flex-col gap-6 p-6 max-w-5xl">

                {/* Page header */}
                <div className="flex items-start gap-4">
                    <Link href={route('admin.timesheets.index')}
                        className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold">
                                {timesheet.worker.first_name} {timesheet.worker.last_name}
                            </h1>
                            <Badge className={`${cfg.className} border-0 text-sm font-medium`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                            Submitted {fmtDT(timesheet.submitted_at)}
                            {timesheet.approved_at && ` · Approved ${fmtDT(timesheet.approved_at)}`}
                            {timesheet.approver && ` by ${timesheet.approver.first_name} ${timesheet.approver.last_name}`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Worker */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="w-4 h-4" /> Carer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="font-semibold text-lg">
                                {timesheet.worker.first_name} {timesheet.worker.last_name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3.5 h-3.5" /> {timesheet.worker.email}
                            </div>
                            {timesheet.worker.phone_number && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-3.5 h-3.5" /> {timesheet.worker.phone_number}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Care Home */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Care Home
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="font-semibold text-lg">{timesheet.care_home.name}</p>
                            {timesheet.care_home.address && (
                                <p className="text-sm text-muted-foreground">
                                    {timesheet.care_home.address}{timesheet.care_home.postcode ? `, ${timesheet.care_home.postcode}` : ''}
                                </p>
                            )}
                            {timesheet.care_home.phone_number && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-3.5 h-3.5" /> {timesheet.care_home.phone_number}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Shift */}
                {timesheet.shift && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Shift
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <InfoRow label="Title" value={timesheet.shift.title} />
                                <InfoRow label="Role" value={shiftRole} />
                                <InfoRow label="Scheduled Start" value={fmtDT(timesheet.shift.start_datetime)} />
                                <InfoRow label="Scheduled End" value={fmtDT(timesheet.shift.end_datetime)} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Time Tracking */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Time Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Clock In</span>
                                <p className="text-sm font-semibold text-green-600 mt-0.5">{fmtDT(timesheet.clock_in_time)}</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Clock Out</span>
                                <p className="text-sm font-semibold text-red-600 mt-0.5">{fmtDT(timesheet.clock_out_time)}</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Break</span>
                                <p className="text-sm font-semibold mt-0.5">{fmtBreak(timesheet.break_duration_minutes)}</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Hours</span>
                                <p className="text-2xl font-bold text-blue-600 mt-0.5">{timesheet.total_hours}h</p>
                            </div>
                        </div>

                        {timesheet.has_overtime && timesheet.overtime_hours && (
                            <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-3 gap-4">
                                <InfoRow label="Overtime Hours" value={`${timesheet.overtime_hours}h`} />
                                {timesheet.overtime_rate && (
                                    <InfoRow label="Overtime Rate" value={`${gbp(timesheet.overtime_rate)}/hr`} />
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pay */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <PoundSterling className="w-4 h-4" /> Pay
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hourly Rate</span>
                                <p className="text-lg font-semibold mt-0.5">{gbp(timesheet.hourly_rate)}/hr</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Regular Pay</span>
                                <p className="text-lg font-semibold mt-0.5">
                                    {gbp(Number(timesheet.total_hours) * Number(timesheet.hourly_rate))}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Pay</span>
                                <p className="text-3xl font-bold text-green-600 mt-0.5">{gbp(timesheet.total_pay)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                {(timesheet.worker_notes || timesheet.manager_notes) && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {timesheet.worker_notes && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Carer Notes</p>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">{timesheet.worker_notes}</p>
                                </div>
                            )}
                            {timesheet.manager_notes && (
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">Manager Notes</p>
                                    <p className="text-sm text-orange-800 dark:text-orange-300">{timesheet.manager_notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Status History */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Status History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {timesheet.status_history && timesheet.status_history.length > 0
                                ? timesheet.status_history.map(entry => (
                                    <div key={entry.id}
                                        className={`flex items-start justify-between p-3 rounded-lg ${statusHistoryBg[entry.status] ?? 'bg-gray-50'}`}>
                                        <div>
                                            <span className="font-medium capitalize text-sm">{entry.status}</span>
                                            {entry.changed_by && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    by {entry.changed_by.first_name} {entry.changed_by.last_name}
                                                </p>
                                            )}
                                            {entry.notes && (
                                                <p className="text-sm italic mt-1 text-muted-foreground">"{entry.notes}"</p>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4 mt-0.5">
                                            {fmtDT(entry.created_at)}
                                        </span>
                                    </div>
                                ))
                                : (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between">
                                        <span className="text-sm font-medium">Created</span>
                                        <span className="text-xs text-muted-foreground">{fmtDT(timesheet.created_at)}</span>
                                    </div>
                                )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
