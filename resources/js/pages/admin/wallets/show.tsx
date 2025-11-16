import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Activity, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Owner {
    id: string;
    name: string;
    email?: string;
}

interface Transaction {
    id: number;
    transaction_id: string;
    type: 'credit' | 'debit';
    amount: number;
    balance_before: number;
    balance_after: number;
    category: string;
    description: string;
    reason?: string;
    proof_file_path?: string;
    performed_by?: {
        name: string;
    };
    created_at: string;
}

interface WalletData {
    id: number;
    owner_type: string;
    owner_id: string;
    balance: number;
    total_credited: number;
    total_debited: number;
    currency: string;
    owner: Owner;
}

interface Props {
    wallet: WalletData;
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
    };
    stats: {
        total_credits: number;
        total_debits: number;
        transaction_count: number;
    };
}

export default function WalletShow({ wallet, transactions, stats }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const getOwnerType = () => {
        return wallet.owner_type.includes('CareHome') ? 'care_home' : 'user';
    };

    const getTransactionBadge = (type: string) => {
        if (type === 'credit') {
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Credit</Badge>;
        }
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Debit</Badge>;
    };

    const getCategoryDisplay = (category: string) => {
        return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <AppLayout>
            <Head title={`Wallet - ${wallet.owner.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.wallets.index')}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Wallets
                            </Button>
                        </Link>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{wallet.owner?.name}</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    {wallet.owner?.email}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link 
                                    href={route('admin.wallets.credit-form', {
                                        ownerType: getOwnerType(),
                                        ownerId: wallet.owner_id
                                    })}
                                >
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Credit Wallet
                                    </Button>
                                </Link>
                                <Link 
                                    href={route('admin.wallets.debit-form', {
                                        ownerType: getOwnerType(),
                                        ownerId: wallet.owner_id
                                    })}
                                >
                                    <Button variant="outline" className="text-red-600 hover:text-red-700 border-red-200">
                                        <TrendingDown className="h-4 w-4 mr-2" />
                                        Debit Wallet
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(wallet.balance)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats.total_credits)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {formatCurrency(stats.total_debits)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.transaction_count}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transactions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>
                                Complete transaction history for this wallet
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Balance After</TableHead>
                                        <TableHead>Performed By</TableHead>
                                        <TableHead className="text-center">Proof</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="text-sm">
                                                {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell>
                                                {getTransactionBadge(transaction.type)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getCategoryDisplay(transaction.category)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate" title={transaction.description}>
                                                    {transaction.description}
                                                </div>
                                                {transaction.reason && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {transaction.reason}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className={`text-right font-semibold ${
                                                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(transaction.balance_after)}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {transaction.performed_by?.name || 'System'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {transaction.proof_file_path && (
                                                    <a 
                                                        href={route('admin.transactions.proof', transaction.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {transactions.data.length === 0 && (
                                <div className="text-center py-12">
                                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Transaction history will appear here once activity begins.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
