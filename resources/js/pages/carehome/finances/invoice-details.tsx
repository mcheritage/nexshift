import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface Timesheet {
    id: string;
    clock_in_time: string;
    clock_out_time: string;
    total_pay: number;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    shift: {
        id: string;
        title: string;
    };
}

interface Invoice {
    id: string;
    invoice_number: string;
    status: string;
    period_start: string;
    period_end: string;
    subtotal: number;
    tax: number;
    total: number;
    due_date: string;
    created_at: string;
    timesheets: Timesheet[];
}

interface WalletData {
    id: number;
    balance: number;
}

interface Props {
    invoice: Invoice;
    wallet: WalletData;
}

export default function ShowInvoice({ invoice, wallet }: Props) {
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const { post, processing } = useForm();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
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
        return new Date(dueDate) < new Date() && invoice.status.toLowerCase() !== 'paid';
    };

    const hasSufficientBalance = wallet.balance >= invoice.total;

    const handlePayInvoice = () => {
        post(route('finances.invoices.pay', invoice.id), {
            onSuccess: () => {
                setShowPaymentDialog(false);
            },
        });
    };

    const isPaid = invoice.status.toLowerCase() === 'paid';

    return (
        <AppLayout>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="py-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('finances.index')}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Finances
                            </Button>
                        </Link>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Invoice {invoice.invoice_number}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Period: {format(new Date(invoice.period_start), 'MMM dd, yyyy')} -{' '}
                                    {format(new Date(invoice.period_end), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <Badge className={getStatusColor(invoice.status)}>
                                {invoice.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Overdue Warning */}
                    {isOverdue(invoice.due_date) && (
                        <Alert className="mb-6 bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                This invoice is overdue. Due date was {format(new Date(invoice.due_date), 'MMM dd, yyyy')}.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Insufficient Balance Warning */}
                    {!hasSufficientBalance && !isPaid && (
                        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                Insufficient wallet balance. Your balance: <strong>{formatCurrency(wallet.balance)}</strong>.
                                Required: <strong>{formatCurrency(invoice.total)}</strong>.
                                Please contact admin to top up your wallet.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Invoice Summary */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Invoice Summary</CardTitle>
                            <CardDescription>
                                Details for invoice {invoice.invoice_number}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Invoice Date</p>
                                    <p className="font-medium">{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Due Date</p>
                                    <p className={`font-medium ${isOverdue(invoice.due_date) ? 'text-red-600' : ''}`}>
                                        {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total</span>
                                    <span className="text-green-600">{formatCurrency(invoice.total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timesheet Details */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Timesheet Details</CardTitle>
                            <CardDescription>
                                Breakdown of shifts included in this invoice
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Worker</TableHead>
                                        <TableHead>Shift</TableHead>
                                        <TableHead>Clock In</TableHead>
                                        <TableHead>Clock Out</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.timesheets.map((timesheet) => (
                                        <TableRow key={timesheet.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {timesheet.user.first_name} {timesheet.user.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {timesheet.user.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{timesheet.shift.title}</TableCell>
                                            <TableCell>
                                                {format(new Date(timesheet.clock_in_time), 'MMM dd, yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(timesheet.clock_out_time), 'MMM dd, yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(timesheet.total_pay)}
                                                {formatCurrency(timesheet.total_pay)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Payment Action */}
                    {!isPaid && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Your current wallet balance:
                                        </p>
                                        <p className={`text-2xl font-bold ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(wallet.balance)}
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        disabled={!hasSufficientBalance}
                                        onClick={() => setShowPaymentDialog(true)}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Pay {formatCurrency(invoice.total)}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Paid Status */}
                    {isPaid && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                This invoice has been paid.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Payment Confirmation Dialog */}
                    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Payment</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to pay this invoice?
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Invoice Number</span>
                                    <span className="font-medium">{invoice.invoice_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount</span>
                                    <span className="font-medium text-lg">{formatCurrency(invoice.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Balance</span>
                                    <span className="font-medium">{formatCurrency(wallet.balance)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">Balance After Payment</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(wallet.balance - invoice.total)}
                                    </span>
                                </div>

                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800 text-sm">
                                        The payment will be deducted from your wallet and distributed to the workers who completed the shifts.
                                    </AlertDescription>
                                </Alert>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPaymentDialog(false)}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePayInvoice}
                                    disabled={processing}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {processing ? 'Processing...' : 'Confirm Payment'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
