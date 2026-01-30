import { Head, Link, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    FileText, 
    Coins, 
    CheckCircle, 
    Clock,
    AlertCircle,
    Search,
    Plus,
    Eye,
    Send,
    DollarSign
} from 'lucide-react';
import { useState } from 'react';

interface Invoice {
    id: string;
    invoice_number: string;
    invoice_date: string;
    period_start: string;
    period_end: string;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    status: string;
    due_date: string;
    paid_at?: string;
    notes?: string;
    timesheets_count?: number;
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
    status: string;
    search: string;
}

interface InvoicesIndexProps extends SharedData {
    invoices: {
        data: Invoice[];
        links: any[];
    };
    stats: Stats;
    filters: Filters;
    statusOptions: Record<string, string>;
}

const statusColors = {
    'draft': 'bg-gray-100 text-gray-800',
    'pending': 'bg-orange-100 text-orange-800',
    'sent': 'bg-blue-100 text-blue-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-600',
};

export default function InvoicesIndex({ invoices, stats, filters, statusOptions }: InvoicesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const handleFilter = () => {
        router.get(route('invoices.index'), {
            status: statusFilter,
            search: searchTerm,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Invoices" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                        <p className="text-muted-foreground">Manage invoices for approved timesheets</p>
                    </div>
                    <Link href={route('invoices.create')}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Invoice
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Outstanding</p>
                                    <div className="text-2xl font-bold text-orange-600">{stats.pending + stats.sent + stats.overdue}</div>
                                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.total_outstanding)} pending</p>
                                </div>
                                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Paid</p>
                                    <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.total_paid)} paid</p>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Overdue</p>
                                    <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                                    <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                                </div>
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Invoices</p>
                                    <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
                                    <p className="text-xs text-gray-500 mt-1">All time</p>
                                </div>
                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="text"
                                        placeholder="Search by invoice number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="w-48">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Statuses</option>
                                    {Object.entries(statusOptions).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <Button onClick={handleFilter}>
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoices ({invoices?.data?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(!invoices?.data || invoices.data.length === 0) ? (
                            <div className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by creating a new invoice from approved timesheets.
                                </p>
                                <div className="mt-6">
                                    <Link href={route('invoices.create')}>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Invoice
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {invoices?.data?.map(invoice => (
                                    <div
                                        key={invoice.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                                                    <Badge className={statusColors[invoice.status] || 'bg-gray-100'}>
                                                        {statusOptions[invoice.status] || invoice.status}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Invoice Date:</span>
                                                        <p>{formatDate(invoice.invoice_date)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Period:</span>
                                                        <p>{formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Due Date:</span>
                                                        <p>{formatDate(invoice.due_date)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Amount:</span>
                                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(invoice.total)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={route('invoices.show', invoice.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
