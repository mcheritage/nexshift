import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, FileText, Activity, TrendingDown, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WalletData {
    id: number;
    balance: number;
    total_credited: number;
    total_debited: number;
}

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
    status: string;
    timesheets: Timesheet[];
}

interface Transaction {
    id: string;
    transaction_id: string;
    type: 'credit' | 'debit';
    category: string;
    description: string;
    amount: number;
    balance_after: number;
    created_at: string;
    performed_by: {
        name: string;
    } | null;
}

interface Stats {
    pending_invoices_count: number;
    pending_invoices_total: number;
    monthly_spent: number;
}

interface Props {
    wallet: WalletData;
    unpaidInvoices: {
        data: Invoice[];
    };
    transactions: {
        data: Transaction[];
    };
    stats: Stats;
}

export default function CareHomeFinances({ wallet, unpaidInvoices, transactions, stats }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const getBalanceColor = (balance: number) => {
        if (balance > 1000) return 'text-green-600';
        if (balance > 0) return 'text-gray-600';
        return 'text-red-600';
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
                            Manage your wallet, invoices, and transaction history
                        </p>
                    </div>

                    {/* Low Balance Warning */}
                    {wallet.balance < 100 && (
                        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                Your wallet balance is low. Please top up to avoid payment delays.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Wallet Balance */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Wallet Balance
                                </CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getBalanceColor(wallet.balance)}`}>
                                    {formatCurrency(wallet.balance)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Available for payments
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

                        {/* Monthly Spent */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    This Month
                                </CardTitle>
                                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {formatCurrency(stats.monthly_spent)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Total spent
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Transactions */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Transactions
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {transactions.data.length}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Recent activities
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
                                                        <Button
                                                            size="sm"
                                                            variant={wallet.balance >= invoice.total ? 'default' : 'outline'}
                                                            disabled={wallet.balance < invoice.total}
                                                        >
                                                            {wallet.balance >= invoice.total ? 'Pay Now' : 'Insufficient Balance'}
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

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                Your latest financial activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transactions.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No transactions yet</p>
                                    <p className="text-xs text-gray-500">Transaction history will appear here</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Balance After</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>
                                                    {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            transaction.type === 'credit'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }
                                                    >
                                                        {transaction.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs truncate" title={transaction.description}>
                                                        {transaction.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right font-medium ${
                                                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                                >
                                                    {transaction.type === 'credit' ? '+' : '-'}
                                                    {formatCurrency(transaction.amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(transaction.balance_after)}
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
