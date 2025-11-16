import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Timesheet {
    id: string;
    user: {
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
    created_at: string;
    timesheets: Timesheet[];
}

interface Props {
    invoices: {
        data: Invoice[];
        links: any;
        meta: any;
    };
}

export default function Invoices({ invoices }: Props) {
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

    const isOverdue = (dueDate: string, status: string) => {
        return new Date(dueDate) < new Date() && status.toLowerCase() !== 'paid';
    };

    return (
        <AppLayout>
            <Head title="Invoices" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('finances.index')}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Finances
                            </Button>
                        </Link>

                        <h1 className="text-3xl font-bold text-gray-900">All Invoices</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            View and manage all your invoices
                        </p>
                    </div>

                    {/* Invoices Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices</CardTitle>
                            <CardDescription>
                                Complete list of all invoices
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {invoices.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No invoices found</p>
                                    <p className="text-xs text-gray-500">
                                        Invoices will appear here once timesheets are approved
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Workers</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.data.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">
                                                    {invoice.invoice_number}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {invoice.timesheets.slice(0, 2).map((ts, idx) => (
                                                            <div key={ts.id}>
                                                                {ts.user.first_name} {ts.user.last_name}
                                                            </div>
                                                        ))}
                                                        {invoice.timesheets.length > 2 && (
                                                            <div className="text-xs text-gray-500">
                                                                +{invoice.timesheets.length - 2} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={isOverdue(invoice.due_date, invoice.status) ? 'text-red-600 font-medium' : ''}>
                                                        {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                                                        {isOverdue(invoice.due_date, invoice.status) && (
                                                            <Badge variant="destructive" className="ml-2">
                                                                Overdue
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(invoice.status)}>
                                                        {invoice.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(invoice.total)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={route('finances.invoices.show', invoice.id)}>
                                                        <Button size="sm" variant="outline">
                                                            View Details
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
                </div>
            </div>
        </AppLayout>
    );
}
