import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, CheckCircle, ChevronDown, Clock, HelpCircle, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SearchableSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}

function SearchableSelect({ value, onChange, options, placeholder }: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = options.find(o => o.value === value);
    const filtered = query
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => { setOpen(o => !o); setQuery(''); }}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
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
                            <input
                                autoFocus
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search…"
                                className="w-full pl-7 pr-2 py-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                    <ul className="max-h-56 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-muted-foreground">No results</li>
                        ) : filtered.map(o => (
                            <li
                                key={o.value}
                                onMouseDown={() => { onChange(o.value); setOpen(false); setQuery(''); }}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${o.value === value ? 'font-medium' : ''}`}
                            >
                                {o.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Timesheets', href: '/admin/timesheets' },
];

interface Worker { id: string; first_name: string; last_name: string; email: string }
interface CareHome { id: string; name: string }
interface Shift { id: string; title: string; role: string }

interface Timesheet {
    id: string;
    status: string;
    clock_in_time: string;
    clock_out_time: string;
    total_hours: string;
    hourly_rate: string;
    total_pay: string;
    break_duration_minutes: number;
    worker_notes: string | null;
    manager_notes: string | null;
    submitted_at: string | null;
    approved_at: string | null;
    worker: Worker;
    care_home: CareHome;
    shift: Shift | null;
}

interface Stats { total: number; submitted: number; approved: number; queried: number }
interface Filters {
    search?: string;
    status?: string;
    care_home_id?: string;
    worker_id?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    timesheets: Timesheet[];
    stats: Stats;
    careHomes: CareHome[];
    workers: Worker[];
    filters: Filters;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    draft:     { label: 'Draft',     className: 'bg-gray-100 text-gray-700' },
    submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800' },
    approved:  { label: 'Approved',  className: 'bg-green-100 text-green-800' },
    queried:   { label: 'Queried',   className: 'bg-yellow-100 text-yellow-800' },
    rejected:  { label: 'Rejected',  className: 'bg-red-100 text-red-800' },
    paid:      { label: 'Paid',      className: 'bg-purple-100 text-purple-800' },
};

function fmt(dt: string | null) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

function fmtDate(dt: string | null) {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-GB', { dateStyle: 'medium' });
}

export default function AdminTimesheets({ timesheets, stats, careHomes, workers, filters }: Props) {
    const [search, setSearch]         = useState(filters.search ?? '');
    const [status, setStatus]         = useState(filters.status ?? '');
    const [careHomeId, setCareHomeId] = useState(filters.care_home_id ?? '');
    const [workerId, setWorkerId]     = useState(filters.worker_id ?? '');
    const [dateFrom, setDateFrom]     = useState(filters.date_from ?? '');
    const [dateTo, setDateTo]         = useState(filters.date_to ?? '');

    function applyFilters(overrides: Partial<typeof filters> = {}) {
        const params: Record<string, string> = {};
        if (search)     params.search        = search;
        if (status)     params.status        = status;
        if (careHomeId) params.care_home_id  = careHomeId;
        if (workerId)   params.worker_id     = workerId;
        if (dateFrom)   params.date_from     = dateFrom;
        if (dateTo)     params.date_to       = dateTo;
        Object.assign(params, overrides);
        router.get(route('admin.timesheets.index'), params, { preserveState: true, replace: true });
    }

    function clearFilters() {
        setSearch(''); setStatus(''); setCareHomeId(''); setWorkerId(''); setDateFrom(''); setDateTo('');
        router.get(route('admin.timesheets.index'), {}, { preserveState: false, replace: true });
    }

    const hasFilters = search || status || careHomeId || workerId || dateFrom || dateTo;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Timesheets — Admin" />

            <div className="flex flex-col gap-6 p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4" /> Submitted</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-blue-600">{stats.submitted}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Approved</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-green-600">{stats.approved}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><HelpCircle className="w-4 h-4" /> Queried</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-yellow-600">{stats.queried}</p></CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                            {/* Keyword search */}
                            <div className="relative xl:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search carer, care home, shift…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                    className="pl-9"
                                />
                            </div>

                            {/* Status */}
                            <Select value={status || 'all'} onValueChange={v => { const val = v === 'all' ? '' : v; setStatus(val); applyFilters({ status: val }); }}>
                                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="queried">Queried</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Care Home */}
                            <SearchableSelect
                                value={careHomeId}
                                onChange={val => { setCareHomeId(val); applyFilters({ care_home_id: val }); }}
                                placeholder="All care homes"
                                options={[
                                    { value: '', label: 'All care homes' },
                                    ...careHomes.map(ch => ({ value: ch.id, label: ch.name })),
                                ]}
                            />

                            {/* Worker */}
                            <SearchableSelect
                                value={workerId}
                                onChange={val => { setWorkerId(val); applyFilters({ worker_id: val }); }}
                                placeholder="All carers"
                                options={[
                                    { value: '', label: 'All carers' },
                                    ...workers.map(w => ({ value: w.id, label: `${w.first_name} ${w.last_name}` })),
                                ]}
                            />

                            {/* Apply / Clear */}
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

                        {/* Date range row */}
                        <div className="flex flex-wrap gap-3 mt-3 items-center">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" placeholder="From" />
                            <span className="text-muted-foreground text-sm">to</span>
                            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" placeholder="To" />
                            <Button variant="outline" size="sm" onClick={() => applyFilters()}>Apply dates</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Timesheets</span>
                            <span className="text-sm font-normal text-muted-foreground">
                                {timesheets.length} result{timesheets.length !== 1 ? 's' : ''} (max 1,000)
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Carer</TableHead>
                                        <TableHead>Care Home</TableHead>
                                        <TableHead>Shift</TableHead>
                                        <TableHead>Clock In</TableHead>
                                        <TableHead>Clock Out</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Rate</TableHead>
                                        <TableHead>Pay</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {timesheets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                                                No timesheets found.
                                            </TableCell>
                                        </TableRow>
                                    ) : timesheets.map(ts => {
                                        const cfg = statusConfig[ts.status] ?? { label: ts.status, className: 'bg-gray-100 text-gray-700' };
                                        return (
                                            <TableRow key={ts.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="font-medium">{ts.worker.first_name} {ts.worker.last_name}</div>
                                                    <div className="text-xs text-muted-foreground">{ts.worker.email}</div>
                                                </TableCell>
                                                <TableCell>{ts.care_home.name}</TableCell>
                                                <TableCell>
                                                    {ts.shift ? (
                                                        <div>
                                                            <div className="font-medium text-sm">{ts.shift.title}</div>
                                                            <div className="text-xs text-muted-foreground capitalize">{ts.shift.role?.replace('_', ' ')}</div>
                                                        </div>
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm">{fmt(ts.clock_in_time)}</TableCell>
                                                <TableCell className="whitespace-nowrap text-sm">{fmt(ts.clock_out_time)}</TableCell>
                                                <TableCell className="font-medium">{ts.total_hours ?? '—'}h</TableCell>
                                                <TableCell>£{parseFloat(ts.hourly_rate).toFixed(2)}</TableCell>
                                                <TableCell className="font-semibold">£{parseFloat(ts.total_pay).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge className={`${cfg.className} border-0 text-xs font-medium`}>{cfg.label}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{fmtDate(ts.submitted_at)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
