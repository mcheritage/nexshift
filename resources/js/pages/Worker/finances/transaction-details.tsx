import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Clock, Download, Building2, User } from 'lucide-react';
import { format } from 'date-fns';

interface PerformedBy {
    name: string;
    email?: string;
}

interface Invoice {
    id: string;
    invoice_number: string;
    total: number;
    status: string;
}

interface Shift {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    care_home: {
        id: string;
        name: string;
    };
}

interface Timesheet {
    id: string;
    clock_in_time: string;
    clock_out_time: string;
    total_pay: number;
    shift: Shift;
}

interface Transaction {
    id: string;
    transaction_id: string;
    type: 'credit' | 'debit';
    category: string;
    description: string;
    reason?: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    created_at: string;
    proof_file_path?: string;
    performed_by?: PerformedBy;
    invoice?: Invoice;
    timesheet?: Timesheet;
}

interface Props {
    transaction: Transaction;
}

export default function ShowTransaction({ transaction }: Props) {
    const formatCurrency = (amount: number) => {
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
            <Head title="Transaction Details" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('worker.finances')}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Finances
                            </Button>
                        </Link>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Transaction ID: {transaction.transaction_id}
                                </p>
                            </div>
                            <div className="text-right">
                                <Badge
                                    className={
                                        transaction.type === 'credit'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }
                                >
                                    {transaction.type}
                                </Badge>
                                <Badge variant="outline" className={`ml-2 ${getCategoryColor(transaction.category)}`}>
                                    {getCategoryDisplayName(transaction.category)}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Summary */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Transaction Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                                    <p className="font-medium">
                                        {format(new Date(transaction.created_at), 'MMMM dd, yyyy')}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {format(new Date(transaction.created_at), 'HH:mm:ss')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                                    <p
                                        className={`text-2xl font-bold ${
                                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                        }`}
                                    >
                                        {transaction.type === 'credit' ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Balance Before</p>
                                        <p className="font-medium">{formatCurrency(transaction.balance_before)}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Balance After</p>
                                        <p className="font-medium text-green-600">
                                            {formatCurrency(transaction.balance_after)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-600 mb-2">Description</p>
                                <p className="font-medium">{transaction.description}</p>
                            </div>

                            {transaction.reason && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-2">Reason</p>
                                    <p className="text-sm">{transaction.reason}</p>
                                </div>
                            )}

                            {transaction.performed_by && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-2">Performed By</p>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">{transaction.performed_by.name}</span>
                                        {transaction.performed_by.email && (
                                            <span className="text-sm text-gray-500">
                                                ({transaction.performed_by.email})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {transaction.proof_file_path && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-2">Proof Document</p>
                                    <a
                                        href={route('admin.transactions.proof.download', transaction.id)}
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Proof Document
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Related Timesheet */}
                    {transaction.timesheet && (
                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-gray-600" />
                                    <CardTitle>Related Shift</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Shift Title</p>
                                    <p className="font-medium">{transaction.timesheet.shift.title}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Clock In</p>
                                        <p className="font-medium">
                                            {format(new Date(transaction.timesheet.clock_in_time), 'MMM dd, yyyy HH:mm')}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Clock Out</p>
                                        <p className="font-medium">
                                            {format(new Date(transaction.timesheet.clock_out_time), 'MMM dd, yyyy HH:mm')}
                                        </p>
                                    </div>
                                </div>

                                {transaction.timesheet.shift.care_home && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Care Home</p>
                                                <p className="font-medium">
                                                    {transaction.timesheet.shift.care_home.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-1">Total Pay</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(transaction.timesheet.total_pay)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Related Invoice */}
                    {transaction.invoice && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-600" />
                                    <CardTitle>Related Invoice</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                                        <p className="font-medium">{transaction.invoice.invoice_number}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Status</p>
                                        <Badge
                                            className={
                                                transaction.invoice.status.toLowerCase() === 'paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }
                                        >
                                            {transaction.invoice.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Invoice Total</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(transaction.invoice.total)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
