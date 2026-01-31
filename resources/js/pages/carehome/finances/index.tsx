import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, FileText, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Timesheet {
    id: string;
    total_pay: number;
    clock_in: string;
    clock_out: string;
    worker: {
        first_name: string;
        last_name: string;
    };
}

interface Invoice {
    id: string;
    invoice_number: string;
    total: number;
    due_date: string;
    paid_at?: string;
    status: string;
    timesheets: Timesheet[];
}

interface Stats {
    pending_invoices_count: number;
    pending_invoices_total: number;
    total_spent: number;
    monthly_spent: number;
}

interface Props {
    unpaidInvoices: {
        data: Invoice[];
    };
    recentInvoices: {
        data: Invoice[];
    };
    stats: Stats;
}

export default function CareHomeFinances({ unpaidInvoices, recentInvoices, stats }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const getInvoiceStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'sent':
                return 'bg-yellow-100 text-yellow-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    return (
        <AppLayout>
            <Head title="Finances" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Finances</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Track your spending and manage invoices with Stripe payments
                        </p>
                    </div>

                    {/* Pending Invoices Warning */}
                    {stats.pending_invoices_count > 0 && (
                        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                You have {stats.pending_invoices_count} unpaid invoice{stats.pending_invoices_count !== 1 ? 's' : ''} totaling {formatCurrency(stats.pending_invoices_total)}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Total Spent */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Spent
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats.total_spent)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All-time via Stripe
                                </p>
                            </CardContent>
                        </Card>

                        {/* This Month */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    This Month
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(stats.monthly_spent)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Paid this month
                                </p>
                            </CardContent>
                        </Card>

                        {/* Pending Invoices */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending Invoices
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {stats.pending_invoices_count}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Total: {formatCurrency(stats.pending_invoices_total)}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Payment Method
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-indigo-600">
                                    Stripe
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Secure payments
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Unpaid Invoices */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Unpaid Invoices</CardTitle>
                                    <CardDescription>
                                        Invoices awaiting payment
                                    </CardDescription>
                                </div>
                                <Link href={route('finances.invoices')}>
                                    <Button variant="outline" size="sm">
                                        View All Invoices
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {unpaidInvoices.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No unpaid invoices</p>
                                    <p className="text-xs text-gray-500">All invoices are paid</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Workers</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {unpaidInvoices.data.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">
                                                    {invoice.invoice_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {invoice.timesheets.map((ts, idx) => (
                                                            <div key={ts.id}>
                                                                {ts.worker.first_name} {ts.worker.last_name}
                                                                {idx < invoice.timesheets.length - 1 && ', '}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={isOverdue(invoice.due_date) ? 'text-red-600 font-medium' : ''}>
                                                        {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                                                        {isOverdue(invoice.due_date) && (
                                                            <Badge variant="destructive" className="ml-2">
                                                                Overdue
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getInvoiceStatusColor(invoice.status)}>
                                                        {invoice.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(invoice.total)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={route('finances.invoices.show', invoice.id)}>
                                                        <Button size="sm">
                                                            Pay with Stripe
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Paid Invoices */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Payments</CardTitle>
                            <CardDescription>
                                Your latest paid invoices via Stripe
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentInvoices.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No payments yet</p>
                                    <p className="text-xs text-gray-500">Your payment history will appear here</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Workers</TableHead>
                                            <TableHead>Paid Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentInvoices.data.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">
                                                    <Link 
                                                        href={route('finances.invoices.show', invoice.id)}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {invoice.invoice_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {invoice.timesheets.map((ts, idx) => (
                                                            <span key={ts.id}>
                                                                {ts.worker.first_name} {ts.worker.last_name}
                                                                {idx < invoice.timesheets.length - 1 && ', '}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {invoice.paid_at && format(new Date(invoice.paid_at), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-green-100 text-green-800">
                                                        Paid
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-green-600">
                                                    {formatCurrency(invoice.total)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
