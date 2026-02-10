import { Head, Link, router, useForm } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileText, Calendar, Users } from 'lucide-react';
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
    approved_at: string;
    worker: Worker;
    shift: Shift;
}

interface CreateInvoiceProps extends SharedData {
    availableTimesheets: Timesheet[];
}

export default function CreateInvoice({ availableTimesheets }: CreateInvoiceProps) {
    const [selectedTimesheets, setSelectedTimesheets] = useState<string[]>([]);
    
    const { data, setData, post, processing, errors } = useForm({
        timesheet_ids: [] as string[],
        period_start: '',
        period_end: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
    });

    const handleTimesheetToggle = (timesheetId: string) => {
        const newSelected = selectedTimesheets.includes(timesheetId)
            ? selectedTimesheets.filter(id => id !== timesheetId)
            : [...selectedTimesheets, timesheetId];
        
        setSelectedTimesheets(newSelected);
        setData('timesheet_ids', newSelected);

        // Auto-calculate period dates if not set
        if (newSelected.length > 0 && !data.period_start) {
            const selected = availableTimesheets.filter(t => newSelected.includes(t.id));
            const dates = selected.map(t => new Date(t.shift.shift_date));
            const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
            const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
            
            setData({
                ...data,
                timesheet_ids: newSelected,
                period_start: minDate.toISOString().split('T')[0],
                period_end: maxDate.toISOString().split('T')[0],
            });
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = availableTimesheets.map(t => t.id);
            setSelectedTimesheets(allIds);
            setData('timesheet_ids', allIds);
            
            // Auto-calculate period dates
            const dates = availableTimesheets.map(t => new Date(t.shift.shift_date));
            const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
            const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
            
            setData({
                ...data,
                timesheet_ids: allIds,
                period_start: minDate.toISOString().split('T')[0],
                period_end: maxDate.toISOString().split('T')[0],
            });
        } else {
            setSelectedTimesheets([]);
            setData('timesheet_ids', []);
        }
    };

    const selectedTotal = availableTimesheets
        .filter(t => selectedTimesheets.includes(t.id))
        .reduce((sum, t) => sum + parseFloat(t.total_pay.toString()), 0);

    const total = selectedTotal;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedTimesheets.length === 0) {
            alert('Please select at least one timesheet');
            return;
        }
        
        console.log('Submitting invoice with data:', data);
        
        post(route('invoices.store'), {
            onSuccess: () => {
                console.log('Invoice created successfully');
            },
            onError: (errors) => {
                console.error('Invoice creation errors:', errors);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Create Invoice" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('invoices.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
                        <p className="text-muted-foreground">Select approved timesheets to include in the invoice</p>
                    </div>
                </div>

                {/* Display global errors */}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        <p className="font-semibold mb-2">Error creating invoice:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {Object.entries(errors).map(([key, value]) => (
                                <li key={key} className="text-sm">{value}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Timesheets Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        <Users className="inline w-5 h-5 mr-2" />
                                        Available Timesheets ({availableTimesheets.length})
                                    </CardTitle>
                                    {availableTimesheets.length > 0 && (
                                        <label className="flex items-center text-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedTimesheets.length === availableTimesheets.length}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="mr-2"
                                            />
                                            Select All
                                        </label>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {availableTimesheets.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No approved timesheets</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            All approved timesheets have been invoiced. Approve more timesheets to create a new invoice.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {availableTimesheets.map(timesheet => (
                                            <label
                                                key={timesheet.id}
                                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                                    selectedTimesheets.includes(timesheet.id)
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTimesheets.includes(timesheet.id)}
                                                    onChange={() => handleTimesheetToggle(timesheet.id)}
                                                    className="mr-4"
                                                />
                                                <div className="flex-1 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {timesheet.worker.first_name} {timesheet.worker.last_name}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {timesheet.shift.title} • {timesheet.shift.role}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-900">
                                                            {formatCurrency(timesheet.total_pay)}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {timesheet.total_hours}h @ £{timesheet.hourly_rate}/hr
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(timesheet.shift.shift_date)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {errors.timesheet_ids && (
                                    <p className="text-red-600 text-sm mt-2">{errors.timesheet_ids}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Invoice Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Calendar className="inline w-5 h-5 mr-2" />
                                    Invoice Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="invoice_date">Invoice Date</Label>
                                    <Input
                                        id="invoice_date"
                                        type="date"
                                        value={data.invoice_date}
                                        onChange={(e) => setData('invoice_date', e.target.value)}
                                        required
                                    />
                                    {errors.invoice_date && (
                                        <p className="text-red-600 text-sm mt-1">{errors.invoice_date}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="period_start">Period Start</Label>
                                    <Input
                                        id="period_start"
                                        type="date"
                                        value={data.period_start}
                                        onChange={(e) => setData('period_start', e.target.value)}
                                        required
                                    />
                                    {errors.period_start && (
                                        <p className="text-red-600 text-sm mt-1">{errors.period_start}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="period_end">Period End</Label>
                                    <Input
                                        id="period_end"
                                        type="date"
                                        value={data.period_end}
                                        onChange={(e) => setData('period_end', e.target.value)}
                                        required
                                    />
                                    {errors.period_end && (
                                        <p className="text-red-600 text-sm mt-1">{errors.period_end}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        required
                                    />
                                    {errors.due_date && (
                                        <p className="text-red-600 text-sm mt-1">{errors.due_date}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Add any additional notes..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Selected Timesheets:</span>
                                    <span className="font-medium">{selectedTimesheets.length}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between">
                                    <span className="font-semibold">Total:</span>
                                    <span className="font-bold text-xl">{formatCurrency(total)}</span>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full mt-4"
                                    disabled={processing || selectedTimesheets.length === 0}
                                >
                                    {processing ? 'Creating...' : 'Create Invoice'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
