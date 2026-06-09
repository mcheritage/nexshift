import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, CalendarDays, FileText, Receipt } from 'lucide-react';

interface Worker { id: string; first_name: string; last_name: string; email: string }
interface Shift { id: string; title: string; role: string }

interface Timesheet {
    id: string;
    clock_in_time: string;
    clock_out_time: string;
    total_hours: string;
    hourly_rate: string;
    total_pay: string;
    status: string;
    worker: Worker;
    shift: Shift | null;
}

interface CareHome {
    id: string;
    name: string;
    address: string;
    postcode: string;
    phone_number: string;
}

interface Invoice {
    id: string;
    invoice_number: string;
    invoice_date: string;
    period_start: string;
    period_end: string;
    due_date: string | null;
    paid_at: string | null;
    subtotal: string;
    tax_rate: string;
    tax_amount: string;
    total: string;
    status: string;
    notes: string | null;
    care_home: CareHome;
    timesheets: Timesheet[];
}

interface Props { invoice: Invoice }

const statusConfig: Record<string, { label: string; className: string }> = {
    draft:     { label: 'Draft',     className: 'bg-gray-100 text-gray-700' },
    pending:   { label: 'Pending',   className: 'bg-orange-100 text-orange-800' },
    sent:      { label: 'Sent',      className: 'bg-blue-100 text-blue-800' },
    paid:      { label: 'Paid',      className: 'bg-green-100 text-green-800' },
    overdue:   { label: 'Overdue',   className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
};

const gbp = (n: number | string) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n));

const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—';

const fmtDateTime = (d: string | null) =>
    d ? new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function AdminInvoiceShow({ invoice }: Props) {
    const cfg = statusConfig[invoice.status] ?? { label: invoice.status, className: 'bg-gray-100 text-gray-700' };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Invoices', href: '/admin/invoices' },
        { title: invoice.invoice_number, href: `/admin/invoices/${invoice.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${invoice.invoice_number} — Admin`} />

            <div className="flex flex-col gap-6 p-6 max-w-5xl">
                {/* Back + header */}
                <div className="flex items-start gap-4">
                    <Link
                        href={route('admin.invoices.index')}
                        className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold font-mono">{invoice.invoice_number}</h1>
                            <Badge className={`${cfg.className} border-0 text-sm font-medium`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                            Invoice date: {fmtDate(invoice.invoice_date)}
                            {invoice.due_date && ` · Due: ${fmtDate(invoice.due_date)}`}
                            {invoice.paid_at && ` · Paid: ${fmtDate(invoice.paid_at)}`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Care Home */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Care Home
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold text-lg">{invoice.care_home.name}</p>
                            {invoice.care_home.address && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {invoice.care_home.address}{invoice.care_home.postcode ? `, ${invoice.care_home.postcode}` : ''}
                                </p>
                            )}
                            {invoice.care_home.phone_number && (
                                <p className="text-sm text-muted-foreground">{invoice.care_home.phone_number}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Period & Billing */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" /> Billing Period
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Period</span>
                                <span>{fmtDate(invoice.period_start)} – {fmtDate(invoice.period_end)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Invoice date</span>
                                <span>{fmtDate(invoice.invoice_date)}</span>
                            </div>
                            {invoice.due_date && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Due date</span>
                                    <span>{fmtDate(invoice.due_date)}</span>
                                </div>
                            )}
                            {invoice.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Paid on</span>
                                    <span className="text-green-600 font-medium">{fmtDate(invoice.paid_at)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Totals */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Receipt className="w-4 h-4" /> Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm max-w-xs ml-auto">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{gbp(invoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax ({Number(invoice.tax_rate).toFixed(0)}%)</span>
                                <span>{gbp(invoice.tax_amount)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-bold text-base">
                                <span>Total</span>
                                <span>{gbp(invoice.total)}</span>
                            </div>
                        </div>
                        {invoice.notes && (
                            <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
                                <span className="font-medium text-foreground">Notes: </span>{invoice.notes}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Timesheets */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Timesheets
                            <span className="text-sm font-normal text-muted-foreground ml-1">({invoice.timesheets.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Carer</TableHead>
                                        <TableHead>Shift</TableHead>
                                        <TableHead>Clock In</TableHead>
                                        <TableHead>Clock Out</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Rate</TableHead>
                                        <TableHead>Pay</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.timesheets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                No timesheets linked to this invoice.
                                            </TableCell>
                                        </TableRow>
                                    ) : invoice.timesheets.map(ts => (
                                        <TableRow key={ts.id}>
                                            <TableCell>
                                                <div className="font-medium">{ts.worker.first_name} {ts.worker.last_name}</div>
                                                <div className="text-xs text-muted-foreground">{ts.worker.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                {ts.shift ? (
                                                    <div>
                                                        <div className="font-medium text-sm">{ts.shift.title}</div>
                                                        <div className="text-xs text-muted-foreground capitalize">{ts.shift.role?.replace('_', ' ')}</div>
                                                    </div>
                                                ) : '—'}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm">{fmtDateTime(ts.clock_in_time)}</TableCell>
                                            <TableCell className="whitespace-nowrap text-sm">{fmtDateTime(ts.clock_out_time)}</TableCell>
                                            <TableCell>{ts.total_hours}h</TableCell>
                                            <TableCell>£{Number(ts.hourly_rate).toFixed(2)}</TableCell>
                                            <TableCell className="font-semibold">£{Number(ts.total_pay).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800 border-0 text-xs capitalize">
                                                    {ts.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
