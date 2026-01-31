import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Activity, DollarSign, Clock, CreditCard, AlertCircle, CheckCircle, ExternalLink, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Stats {
    total_earned: number;
    monthly_earnings: number;
    last_month_earnings: number;
    pending_approval_earnings: number;
    pending_payment_earnings: number;
    total_approved_timesheets: number;
}

interface TimesheetStats {
    total_hours_worked: number;
    hours_this_month: number;
    hours_last_month: number;
    pending_approval_hours: number;
    pending_payment_hours: number;
}

interface StripeBalance {
    available: Array<{ amount: number; currency: string }>;
    pending: Array<{ amount: number; currency: string }>;
}

interface Timesheet {
    id: string;
    status: string;
    total_hours: number;
    total_pay: number;
    approved_at: string | null;
    created_at: string;
    shift: {
        id: string;
        title: string;
        shift_date: string;
        care_home: {
            name: string;
        };
    };
}

interface Props {
    stats: Stats;
    timesheetStats: TimesheetStats;
    recentTimesheets: Timesheet[];
    stripeConnected: boolean;
    stripeOnboardingComplete: boolean;
    stripeStatus: {
        connected: boolean;
        onboarding_complete: boolean;
        charges_enabled: boolean;
        payouts_enabled: boolean;
    } | null;
    stripeBalance: StripeBalance | null;
}

export default function WorkerFinances({ 
    stats, 
    timesheetStats, 
    recentTimesheets,
    stripeConnected,
    stripeOnboardingComplete,
    stripeStatus,
    stripeBalance
}: Props) {
    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return '£0.00';
        }
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const handleAccessStripeDashboard = () => {
        // Open Stripe dashboard in new tab - backend will redirect
        window.open(route('worker.stripe.dashboard'), '_blank');
    };

    // Get Stripe balance in GBP
    const getStripeAvailableBalance = () => {
        if (!stripeBalance || !stripeBalance.available) return 0;
        const gbpBalance = stripeBalance.available.find(b => b.currency === 'gbp');
        return gbpBalance ? gbpBalance.amount / 100 : 0; // Stripe amounts are in pence
    };

    const getStripePendingBalance = () => {
        if (!stripeBalance || !stripeBalance.pending) return 0;
        const gbpBalance = stripeBalance.pending.find(b => b.currency === 'gbp');
        return gbpBalance ? gbpBalance.amount / 100 : 0;
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
                            Track your earnings, hours worked, and payment history
                        </p>
                    </div>

                    {/* Stripe Connection Alert */}
                    {!stripeConnected && (
                        <Alert className="mb-6 border-blue-200 bg-blue-50">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-900">Set up payments</AlertTitle>
                            <AlertDescription className="text-blue-800">
                                Connect your Stripe account to receive payments directly to your bank account.
                                <Link href={route('worker.stripe')}>
                                    <Button variant="link" className="p-0 h-auto ml-2 text-blue-600">
                                        Set up now →
                                    </Button>
                                </Link>
                            </AlertDescription>
                        </Alert>
                    )}

                    {stripeConnected && !stripeOnboardingComplete && (
                        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertTitle className="text-yellow-900">Complete payment setup</AlertTitle>
                            <AlertDescription className="text-yellow-800">
                                Your Stripe account setup is incomplete. Complete it to start receiving payments.
                                <Link href={route('worker.stripe')}>
                                    <Button variant="link" className="p-0 h-auto ml-2 text-yellow-600">
                                        Complete setup →
                                    </Button>
                                </Link>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                        {/* Total Hours Worked */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Hours Worked
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {timesheetStats.total_hours_worked.toFixed(1)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {timesheetStats.hours_this_month.toFixed(1)} hrs this month
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Earned */}
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-900">
                                    Total Earned
                                </CardTitle>
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-700">
                                    {formatCurrency(stats.total_earned)}
                                </div>
                                <p className="text-xs text-green-700 mt-2">
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
                                    vs {formatCurrency(stats.last_month_earnings)} last month
                                </p>
                            </CardContent>
                        </Card>

                        {/* Pending Approval */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending Approval
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {formatCurrency(stats.pending_approval_earnings)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {timesheetStats.pending_approval_hours.toFixed(1)} hrs awaiting approval
                                </p>
                            </CardContent>
                        </Card>

                        {/* Pending Payment */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending Payment
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {formatCurrency(stats.pending_payment_earnings)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {timesheetStats.pending_payment_hours.toFixed(1)} hrs approved, not paid
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stripe Balance & Payment Info */}
                    <div className="mb-6">
                        {stripeConnected && stripeOnboardingComplete && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <CreditCard className="h-5 w-5" />
                                                Stripe Payment Account
                                            </CardTitle>
                                            <CardDescription>
                                                Your earnings are paid directly to your Stripe account
                                            </CardDescription>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Active
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {stripeBalance ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-green-50 rounded-lg">
                                                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                                                <p className="text-3xl font-bold text-green-600">
                                                    {formatCurrency(getStripeAvailableBalance())}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Ready for payout</p>
                                            </div>
                                            <div className="p-4 bg-orange-50 rounded-lg">
                                                <p className="text-sm text-gray-600 mb-1">Pending</p>
                                                <p className="text-3xl font-bold text-orange-600">
                                                    {formatCurrency(getStripePendingBalance())}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Processing</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                                            <p className="mb-2">Your Stripe account is connected.</p>
                                            <p className="text-xs text-gray-500">Balance will appear once payments are processed.</p>
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            onClick={handleAccessStripeDashboard}
                                            className="flex-1"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Stripe Dashboard
                                        </Button>
                                        <Link href={route('worker.stripe')}>
                                            <Button variant="outline">
                                                Settings
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Earnings Summary & Recent Work */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Earnings Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Earnings Summary</CardTitle>
                                <CardDescription>
                                    Your payment breakdown
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* This Month */}
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                This Month
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {timesheetStats.hours_this_month.toFixed(1)} hours worked
                                            </p>
                                        </div>
                                        <div className="text-xl font-bold text-blue-600">
                                            {formatCurrency(stats.monthly_earnings)}
                                        </div>
                                    </div>

                                    {/* Last Month */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Last Month
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {timesheetStats.hours_last_month.toFixed(1)} hours worked
                                            </p>
                                        </div>
                                        <div className="text-xl font-bold text-gray-600">
                                            {formatCurrency(stats.last_month_earnings)}
                                        </div>
                                    </div>

                                    {/* Total Lifetime */}
                                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Total Lifetime Earnings
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {stats.total_approved_timesheets} completed shifts
                                            </p>
                                        </div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatCurrency(stats.total_earned)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Work */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Recent Work</CardTitle>
                                        <CardDescription>
                                            Your latest timesheets
                                        </CardDescription>
                                    </div>
                                    <Link href={route('worker.timesheets')}>
                                        <Button variant="ghost" size="sm">
                                            View All
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentTimesheets.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">No timesheets yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentTimesheets.slice(0, 5).map((timesheet) => (
                                            <div 
                                                key={timesheet.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {timesheet.shift.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {timesheet.shift.care_home.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {format(new Date(timesheet.shift.shift_date), 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(timesheet.total_pay)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {timesheet.total_hours}h
                                                    </div>
                                                    <Badge 
                                                        variant="outline"
                                                        className={
                                                            timesheet.status === 'approved'
                                                                ? 'bg-green-100 text-green-800 border-green-200'
                                                                : 'bg-blue-100 text-blue-800 border-blue-200'
                                                        }
                                                    >
                                                        {timesheet.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
