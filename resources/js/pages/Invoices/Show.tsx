import { Head, Link, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Download, Send, CheckCircle, Printer, Wallet as WalletIcon, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Worker {
    id: string;
    first_name: string;
    last_name: string;
}

interface Shift {
    id: string;
    title: string;
    role: string;
    shift_date: string;
}

interface Timesheet {
    id: string;
    total_hours: number;
    hourly_rate: number;
    total_pay: number;
    worker: Worker;
    shift: Shift;
}

interface CareHome {
    id: string;
    name: string;
    address: string;
    city: string;
    postcode: string;
}

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
    timesheets: Timesheet[];
    care_home: CareHome;
}

interface WalletData {
    id: number;
    balance: number;
}

interface ShowInvoiceProps extends SharedData {
    invoice: Invoice;
    wallet: WalletData;
}

const statusColors = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-600',
};

export default function ShowInvoice({ invoice, wallet }: ShowInvoiceProps) {
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    
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

    const handleMarkAsSent = () => {
        router.patch(route('invoices.mark-sent', invoice.id), {}, {
            preserveScroll: true,
        });
    };

    const handlePayInvoice = () => {
        if (wallet.balance < invoice.total) {
            alert(`Insufficient balance. Your wallet balance is ${formatCurrency(wallet.balance)} but the invoice total is ${formatCurrency(invoice.total)}`);
            return;
        }
        setShowPaymentConfirm(true);
    };

    const confirmPayment = () => {
        router.patch(route('invoices.mark-paid', invoice.id), {}, {
            preserveScroll: true,
            onSuccess: () => setShowPaymentConfirm(false),
        });
    };

    const handlePrint = () => {
        window.print();
    };
    
    const hasInsufficientBalance = wallet.balance < invoice.total;

    return (
        <AppLayout>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 print:p-8">
                {/* Header - Hidden when printing */}
                <div className="flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('invoices.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Invoice {invoice.invoice_number}</h1>
                        <Badge className={statusColors[invoice.status]}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                        {invoice.status === 'draft' && (
                            <Button onClick={handleMarkAsSent}>
                                <Send className="w-4 h-4 mr-2" />
                                Mark as Sent
                            </Button>
                        )}
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                            <Button 
                                onClick={handlePayInvoice}
                                disabled={hasInsufficientBalance}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Pay Invoice
                            </Button>
                        )}
                    </div>
                </div>

                {/* Wallet Balance Alert */}
                {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                    <Alert className={hasInsufficientBalance ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                        {hasInsufficientBalance ? (
                            <AlertCircle className="text-red-600" />
                        ) : (
                            <WalletIcon className="text-green-600" />
                        )}
                        <AlertDescription className={hasInsufficientBalance ? 'text-red-700' : 'text-green-700'}>
                            {hasInsufficientBalance ? (
                                <div>
                                    <strong>Insufficient Balance:</strong> Your wallet balance is {formatCurrency(wallet.balance)} but this invoice total is {formatCurrency(invoice.total)}. 
                                    Please top up your wallet to pay this invoice.
                                </div>
                            ) : (
                                <div>
                                    <strong>Wallet Balance:</strong> {formatCurrency(wallet.balance)} - Sufficient funds available to pay this invoice.
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Invoice Document */}
                <Card className="print:shadow-none print:border-0">
                    <CardContent className="p-8">
                        {/* Invoice Header */}
                        <div className="flex justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold">INVOICE</h2>
                                <p className="text-gray-600 mt-2">Invoice Number: {invoice.invoice_number}</p>
                                <p className="text-gray-600">Invoice Date: {formatDate(invoice.invoice_date)}</p>
                                <p className="text-gray-600">Due Date: {formatDate(invoice.due_date)}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-lg">NexShift</h3>
                                <p className="text-gray-600">Healthcare Staffing Agency</p>
                                <p className="text-gray-600">123 Business Street</p>
                                <p className="text-gray-600">London, UK</p>
                                <p className="text-gray-600">info@nexshift.com</p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-8">
                            <h3 className="font-bold text-lg mb-2">Bill To:</h3>
                            <div className="text-gray-700">
                                <p className="font-medium">{invoice.care_home.name}</p>
                                <p>{invoice.care_home.address}</p>
                                <p>{invoice.care_home.city}</p>
                                <p>{invoice.care_home.postcode}</p>
                            </div>
                        </div>

                        {/* Billing Period */}
                        <div className="mb-6">
                            <p className="text-gray-600">
                                <span className="font-medium">Billing Period:</span> {formatDate(invoice.period_start)} to {formatDate(invoice.period_end)}
                            </p>
                        </div>

                        {/* Timesheets Table */}
                        <div className="mb-6">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-y">
                                    <tr>
                                        <th className="text-left p-3 font-medium text-gray-700">Date</th>
                                        <th className="text-left p-3 font-medium text-gray-700">Worker</th>
                                        <th className="text-left p-3 font-medium text-gray-700">Shift</th>
                                        <th className="text-right p-3 font-medium text-gray-700">Hours</th>
                                        <th className="text-right p-3 font-medium text-gray-700">Rate</th>
                                        <th className="text-right p-3 font-medium text-gray-700">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.timesheets.map((timesheet) => (
                                        <tr key={timesheet.id} className="border-b">
                                            <td className="p-3 text-gray-700">
                                                {formatDate(timesheet.shift.shift_date)}
                                            </td>
                                            <td className="p-3 text-gray-700">
                                                {timesheet.worker.first_name} {timesheet.worker.last_name}
                                            </td>
                                            <td className="p-3 text-gray-700">
                                                {timesheet.shift.title}
                                                <span className="text-gray-500 text-sm ml-1">({timesheet.shift.role})</span>
                                            </td>
                                            <td className="p-3 text-right text-gray-700">
                                                {timesheet.total_hours}
                                            </td>
                                            <td className="p-3 text-right text-gray-700">
                                                {formatCurrency(timesheet.hourly_rate)}
                                            </td>
                                            <td className="p-3 text-right text-gray-700">
                                                {formatCurrency(timesheet.total_pay)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between py-2 border-t">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">VAT ({invoice.tax_rate}%):</span>
                                    <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                                </div>
                                <div className="flex justify-between py-3 border-t-2 border-gray-300">
                                    <span className="font-bold text-lg">Total:</span>
                                    <span className="font-bold text-xl">{formatCurrency(invoice.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mt-8 p-4 bg-gray-50 rounded">
                                <h4 className="font-medium text-gray-700 mb-2">Notes:</h4>
                                <p className="text-gray-600">{invoice.notes}</p>
                            </div>
                        )}

                        {/* Payment Status */}
                        {invoice.paid_at && (
                            <div className="mt-8 p-4 bg-green-50 rounded border border-green-200">
                                <p className="text-green-800 font-medium">
                                    ✓ Paid on {formatDate(invoice.paid_at)}
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
                            <p>Thank you for your business!</p>
                            <p className="mt-2">For any queries regarding this invoice, please contact us at info@nexshift.com</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Confirmation Modal */}
            {showPaymentConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Confirm Payment</h3>
                        <div className="space-y-4">
                            <p className="text-gray-700">
                                Are you sure you want to pay this invoice?
                            </p>
                            <div className="bg-gray-50 p-4 rounded space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Invoice Total:</span>
                                    <span className="font-semibold">{formatCurrency(invoice.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Balance:</span>
                                    <span className="font-semibold">{formatCurrency(wallet.balance)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">Balance After Payment:</span>
                                    <span className="font-semibold">{formatCurrency(wallet.balance - invoice.total)}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                Payments will be transferred to all workers included in this invoice.
                            </p>
                            <div className="flex space-x-3">
                                <Button
                                    onClick={confirmPayment}
                                    className="flex-1"
                                >
                                    Confirm Payment
                                </Button>
                                <Button
                                    onClick={() => setShowPaymentConfirm(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
