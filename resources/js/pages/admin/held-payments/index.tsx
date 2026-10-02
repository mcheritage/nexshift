import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { AlertCircle, CheckCircle, Hourglass, RefreshCw, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Held Payments', href: '/admin/held-payments' },
];

interface Transfer {
    id: string;
    amount: string;
    status: string;
    reason: string | null;
    created_at: string;
    worker: { id: string; first_name: string; last_name: string; email: string; stripe_account_id: string | null };
    invoice: { id: string; invoice_number: string; care_home: { id: string; name: string } };
}

interface Props {
    transfers: Transfer[];
    stats: { count: number; total: number; workers: number };
    message: { type: 'success' | 'error'; text: string } | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    held:   { label: 'Held',   className: 'bg-orange-100 text-orange-800' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
};

const gbp = (n: number | string) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n));

const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—';

export default function AdminHeldPayments({ transfers, stats, message }: Props) {
    const [retrying, setRetrying] = useState<string | null>(null);

    function retry(transfer: Transfer) {
        setRetrying(transfer.id);
        router.post(route('admin.held-payments.retry', transfer.id), {}, {
            preserveScroll: true,
            onFinish: () => setRetrying(null),
        });
    }

    const columns: ColumnDef<Transfer>[] = [
        {
            id: 'worker',
            header: 'Worker',
            cell: ({ row }) => (
                <div>
                    <Link href={`/admin/healthcare-workers/${row.original.worker.id}`} className="font-medium hover:underline">
                        {row.original.worker.first_name} {row.original.worker.last_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{row.original.worker.email}</p>
                </div>
            ),
        },
        {
            id: 'invoice',
            header: 'Invoice',
            cell: ({ row }) => (
                <div>
                    <Link href={`/admin/invoices/${row.original.invoice.id}`} className="font-medium hover:underline">
                        {row.original.invoice.invoice_number}
                    </Link>
                    <p className="text-xs text-muted-foreground">{row.original.invoice.care_home.name}</p>
                </div>
            ),
        },
        {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ row }) => <span className="font-semibold">{gbp(row.original.amount)}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const cfg = statusConfig[row.original.status] ?? { label: row.original.status, className: 'bg-gray-100 text-gray-700' };
                return <Badge className={`${cfg.className} border-0 text-xs font-medium`}>{cfg.label}</Badge>;
            },
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.reason ?? '—'}</span>,
        },
        {
            accessorKey: 'created_at',
            header: 'Held since',
            cell: ({ row }) => <span className="text-sm text-muted-foreground whitespace-nowrap">{fmtDate(row.original.created_at)}</span>,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Button variant="outline" size="sm" disabled={retrying !== null} onClick={() => retry(row.original)}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${retrying === row.original.id ? 'animate-spin' : ''}`} />
                    Retry
                </Button>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Held Payments — Admin" />

            <div className="flex flex-col gap-6 p-6">
                {message && (
                    <div className={`rounded-lg border p-4 flex items-start gap-3 ${
                        message.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                        {message.type === 'success'
                            ? <CheckCircle className="w-5 h-5 mt-0.5" />
                            : <AlertCircle className="w-5 h-5 mt-0.5" />}
                        <p>{message.text}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Hourglass className="w-4 h-4" /> Payments held</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{stats.count}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Total owed to workers</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-orange-600">{gbp(stats.total)}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Users className="w-4 h-4" /> Workers waiting</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{stats.workers}</p></CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Held Payments</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Care homes have paid these invoices, but the worker's share could not be sent to their Stripe account.
                            Each payment is sent automatically once the worker's Stripe account is ready.
                        </p>
                    </CardHeader>
                    <CardContent>
                        {transfers.length > 0 ? (
                            <DataTable columns={columns} data={transfers} />
                        ) : (
                            <p className="text-sm text-muted-foreground py-8 text-center">No payments are being held. Every worker has been paid.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
