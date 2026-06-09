import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { AlertCircle, ArrowUpDown, CalendarDays, CheckCircle, ChevronDown, Clock, FileText, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Invoices', href: '/admin/invoices' },
];

interface CareHome { id: string; name: string }

interface Invoice {
    id: string;
    invoice_number: string;
    invoice_date: string;
    period_start: string;
    period_end: string;
    due_date: string | null;
    paid_at: string | null;
    subtotal: string;
    tax_amount: string;
    total: string;
    status: string;
    notes: string | null;
    timesheets_count: number;
    care_home: CareHome;
}

interface Stats {
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    total_outstanding: number;
    total_paid: number;
}

interface Filters {
    search?: string;
    status?: string;
    care_home_id?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    invoices: Invoice[];
    stats: Stats;
    careHomes: CareHome[];
    filters: Filters;
}

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

function SortableHeader({ column, label }: { column: any; label: string }) {
    return (
        <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
            {label}
            <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
    );
}

// Searchable dropdown
interface SearchableSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}

function SearchableSelect({ value, onChange, options, placeholder }: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find(o => o.value === value);
    const filtered = query
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery(''); }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => { setOpen(o => !o); setQuery(''); }}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[200px] rounded-md border bg-popover shadow-md">
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…"
                                className="w-full pl-7 pr-2 py-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground" />
                        </div>
                    </div>
                    <ul className="max-h-56 overflow-y-auto py-1">
                        {filtered.length === 0
                            ? <li className="px-3 py-2 text-sm text-muted-foreground">No results</li>
                            : filtered.map(o => (
                                <li key={o.value} onMouseDown={() => { onChange(o.value); setOpen(false); setQuery(''); }}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${o.value === value ? 'font-medium' : ''}`}>
                                    {o.label}
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

const columns: ColumnDef<Invoice>[] = [
    {
        accessorKey: 'invoice_number',
        header: ({ column }) => <SortableHeader column={column} label="Invoice #" />,
        cell: ({ row }) => (
            <Link href={route('admin.invoices.show', row.original.id)}
                className="font-mono font-semibold text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap">
                {row.getValue('invoice_number')}
            </Link>
        ),
        size: 160,
    },
    {
        id: 'care_home',
        accessorFn: row => row.care_home.name,
        header: ({ column }) => <SortableHeader column={column} label="Care Home" />,
        cell: ({ row }) => <span className="font-medium">{row.original.care_home.name}</span>,
    },
    {
        accessorKey: 'invoice_date',
        header: ({ column }) => <SortableHeader column={column} label="Date" />,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm">{fmtDate(row.getValue('invoice_date'))}</span>,
    },
    {
        id: 'period',
        accessorFn: row => row.period_start,
        header: 'Period',
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground w-[130px]">
                <div className="whitespace-nowrap">{fmtDate(row.original.period_start)}</div>
                <div className="whitespace-nowrap">{fmtDate(row.original.period_end)}</div>
            </div>
        ),
    },
    {
        accessorKey: 'due_date',
        header: ({ column }) => <SortableHeader column={column} label="Due" />,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm">{fmtDate(row.getValue('due_date'))}</span>,
        size: 110,
        maxSize: 110,
    },
    {
        accessorKey: 'timesheets_count',
        header: ({ column }) => <SortableHeader column={column} label="Timesheets" />,
        cell: ({ row }) => <span className="text-center block">{row.getValue('timesheets_count')}</span>,
        size: 60,
        maxSize: 60,
    },
    {
        accessorKey: 'total',
        header: ({ column }) => <SortableHeader column={column} label="Total" />,
        cell: ({ row }) => <span className="font-semibold">{gbp(row.getValue('total'))}</span>,
        sortingFn: (a, b) => Number(a.original.total) - Number(b.original.total),
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <SortableHeader column={column} label="Status" />,
        cell: ({ row }) => {
            const cfg = statusConfig[row.getValue('status') as string] ?? { label: row.getValue('status'), className: 'bg-gray-100 text-gray-700' };
            return <Badge className={`${cfg.className} border-0 text-xs font-medium`}>{cfg.label}</Badge>;
        },
    },
    {
        accessorKey: 'paid_at',
        header: ({ column }) => <SortableHeader column={column} label="Paid" />,
        cell: ({ row }) => <span className="text-sm text-muted-foreground whitespace-nowrap">{fmtDate(row.getValue('paid_at'))}</span>,
    },
];

export default function AdminInvoices({ invoices, stats, careHomes, filters }: Props) {
    const [search, setSearch]         = useState(filters.search ?? '');
    const [status, setStatus]         = useState(filters.status ?? '');
    const [careHomeId, setCareHomeId] = useState(filters.care_home_id ?? '');
    const [dateFrom, setDateFrom]     = useState(filters.date_from ?? '');
    const [dateTo, setDateTo]         = useState(filters.date_to ?? '');

    function applyFilters(overrides: Partial<typeof filters> = {}) {
        const params: Record<string, string> = {};
        if (search)     params.search       = search;
        if (status)     params.status       = status;
        if (careHomeId) params.care_home_id = careHomeId;
        if (dateFrom)   params.date_from    = dateFrom;
        if (dateTo)     params.date_to      = dateTo;
        Object.assign(params, overrides);
        router.get(route('admin.invoices.index'), params, { preserveState: true, replace: true });
    }

    function clearFilters() {
        setSearch(''); setStatus(''); setCareHomeId(''); setDateFrom(''); setDateTo('');
        router.get(route('admin.invoices.index'), {}, { preserveState: false, replace: true });
    }

    const hasFilters = search || status || careHomeId || dateFrom || dateTo;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices — Admin" />

            <div className="flex flex-col gap-6 p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><FileText className="w-4 h-4" /> Total</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4" /> Sent / Pending</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-blue-600">{stats.sent}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Paid</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
                            <p className="text-xs text-muted-foreground mt-1">{gbp(stats.total_paid)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Outstanding</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-orange-600">{gbp(stats.total_outstanding)}</p>
                            {stats.overdue > 0 && <p className="text-xs text-red-600 mt-1">{stats.overdue} overdue</p>}
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            <div className="relative xl:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search invoice #, care home…" value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                    className="pl-9" />
                            </div>
                            <Select value={status || 'all'} onValueChange={v => { const val = v === 'all' ? '' : v; setStatus(val); applyFilters({ status: val }); }}>
                                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <SearchableSelect value={careHomeId}
                                onChange={val => { setCareHomeId(val); applyFilters({ care_home_id: val }); }}
                                placeholder="All care homes"
                                options={[{ value: '', label: 'All care homes' }, ...careHomes.map(ch => ({ value: ch.id, label: ch.name }))]} />
                            <div className="flex gap-2">
                                <Button onClick={() => applyFilters()} className="flex-1">
                                    <Search className="w-4 h-4 mr-1" /> Search
                                </Button>
                                {hasFilters && (
                                    <Button variant="outline" onClick={clearFilters} size="icon" title="Clear filters">
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-3 items-center">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
                            <span className="text-muted-foreground text-sm">to</span>
                            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
                            <Button variant="outline" size="sm" onClick={() => applyFilters()}>Apply dates</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* DataTable */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Invoices</span>
                            <span className="text-sm font-normal text-muted-foreground">
                                {invoices.length} result{invoices.length !== 1 ? 's' : ''} (max 1,000)
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={invoices} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
