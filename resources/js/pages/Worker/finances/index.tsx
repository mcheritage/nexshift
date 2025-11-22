import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Activity, DollarSign, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface WalletData {
    id: number;
    balance: number;
    total_credited: number;
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
}

interface Stats {
    total_earned: number;
    monthly_earnings: number;
    transaction_count: number;
}

interface EarningsBreakdown {
    timesheet_payments: number;
    manual_credits: number;
}

interface Props {
    wallet: WalletData;
    transactions: {
        data: Transaction[];
        links: any;
        meta: any;
    };
    stats: Stats;
    earningsBreakdown: EarningsBreakdown;
}

export default function WorkerFinances({ wallet, transactions, stats, earningsBreakdown }: Props) {
    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return '£0.00';
        }
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const getCategoryDisplayName = (category: string) => {
        const names: Record<string, string> = {
            manual_credit: 'Manual Credit',
            manual_debit: 'Manual Debit',
            invoice_payment: 'Invoice Payment',
            timesheet_payment: 'Timesheet Payment',
            refund: 'Refund',
            adjustment: 'Adjustment',
            withdrawal: 'Withdrawal',
        };
        return names[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            timesheet_payment: 'bg-green-100 text-green-800',
            manual_credit: 'bg-blue-100 text-blue-800',
            refund: 'bg-purple-100 text-purple-800',
            manual_debit: 'bg-red-100 text-red-800',
            withdrawal: 'bg-orange-100 text-orange-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout>
            <Head title="My Finances" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">My Finances</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Track your earnings, wallet balance, and transaction history
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Wallet Balance */}
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-900">
                                    Wallet Balance
                                </CardTitle>
                                <Wallet className="h-5 w-5 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-700">
                                    {formatCurrency(wallet.balance)}
                                </div>
                                <p className="text-xs text-green-700 mt-2">
                                    Available for withdrawal
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Earned */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Earned
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats.total_earned)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All-time earnings
                                </p>
                            </CardContent>
                        </Card>

                        {/* Monthly Earnings */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    This Month
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats.monthly_earnings)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Monthly earnings
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
                                    {stats.transaction_count}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Total transactions
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Earnings Breakdown */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Earnings Breakdown</CardTitle>
                            <CardDescription>
                                Your earnings by category
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Timesheet Payments */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Timesheet Payments
                                    </span>
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatCurrency(earningsBreakdown.timesheet_payments)}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        From approved timesheets
                                    </p>
                                </div>

                                {/* Manual Credits */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Manual Credits
                                    </span>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(earningsBreakdown.manual_credits)}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Bonuses and adjustments
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>
                                All your financial transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transactions.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No transactions yet</p>
                                    <p className="text-xs text-gray-500">
                                        Your earnings will appear here once timesheets are approved
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="text-right">Balance After</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.data.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="text-sm">
                                                        {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                                                        <div className="text-xs text-gray-500">
                                                            {format(new Date(transaction.created_at), 'HH:mm')}
                                                        </div>
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
                                                        <Badge
                                                            variant="outline"
                                                            className={getCategoryColor(transaction.category)}
                                                        >
                                                            {getCategoryDisplayName(transaction.category)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-xs truncate text-sm" title={transaction.description}>
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
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(transaction.balance_after)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={route('worker.finances.transactions.show', transaction.id)}
                                                        >
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination would go here if needed */}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
