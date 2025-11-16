import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

interface Owner {
    id: string;
    name: string;
}

interface WalletData {
    id: number;
    owner_type: string;
    owner_id: string;
    balance: number;
    total_credited: number;
    total_debited: number;
    currency: string;
    transactions_count: number;
    owner: Owner;
}

interface Props {
    wallets: {
        data: WalletData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_wallets: number;
        total_balance: number;
        total_credited: number;
        total_debited: number;
    };
}

export default function WalletsIndex({ wallets, stats }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const getOwnerTypeBadge = (type: string) => {
        if (type.includes('CareHome')) {
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Care Home</Badge>;
        }
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Worker</Badge>;
    };

    const getBalanceColor = (balance: number) => {
        if (balance > 1000) return 'text-green-600';
        if (balance > 0) return 'text-gray-900';
        return 'text-red-600';
    };

    return (
        <AppLayout>
            <Head title="Wallet Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Manage care home and worker wallet balances
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_wallets}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats.total_balance)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Credited</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats.total_credited)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Debited</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {formatCurrency(stats.total_debited)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Wallets Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Wallets</CardTitle>
                            <CardDescription>
                                View and manage wallet balances for all care homes and workers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                        <TableHead className="text-right">Total Credited</TableHead>
                                        <TableHead className="text-right">Total Debited</TableHead>
                                        <TableHead className="text-center">Transactions</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {wallets.data.map((wallet) => (
                                        <TableRow key={wallet.id}>
                                            <TableCell className="font-medium">
                                                {wallet.owner?.name || 'Unknown'}
                                            </TableCell>
                                            <TableCell>
                                                {getOwnerTypeBadge(wallet.owner_type)}
                                            </TableCell>
                                            <TableCell className={`text-right font-semibold ${getBalanceColor(wallet.balance)}`}>
                                                {formatCurrency(wallet.balance)}
                                            </TableCell>
                                            <TableCell className="text-right text-green-600">
                                                {formatCurrency(wallet.total_credited)}
                                            </TableCell>
                                            <TableCell className="text-right text-red-600">
                                                {formatCurrency(wallet.total_debited)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{wallet.transactions_count}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.wallets.show', wallet.id)}>
                                                        <Button variant="outline" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Link 
                                                        href={route('admin.wallets.credit-form', {
                                                            ownerType: wallet.owner_type.includes('CareHome') ? 'care_home' : 'user',
                                                            ownerId: wallet.owner_id
                                                        })}
                                                    >
                                                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                                                            Credit
                                                        </Button>
                                                    </Link>
                                                    <Link 
                                                        href={route('admin.wallets.debit-form', {
                                                            ownerType: wallet.owner_type.includes('CareHome') ? 'care_home' : 'user',
                                                            ownerId: wallet.owner_id
                                                        })}
                                                    >
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                            Debit
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {wallets.data.length === 0 && (
                                <div className="text-center py-12">
                                    <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No wallets found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Wallets will be created automatically when users or care homes are registered.
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
