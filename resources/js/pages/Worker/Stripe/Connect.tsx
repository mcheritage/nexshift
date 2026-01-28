import { Head, Link, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
    CreditCard, 
    ExternalLink, 
    CheckCircle2, 
    AlertCircle,
    ArrowRight,
    RefreshCw,
    XCircle,
    ArrowLeft
} from 'lucide-react';
import { useState } from 'react';

interface AccountStatus {
    connected: boolean;
    onboarding_complete: boolean;
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
    requirements?: {
        currently_due?: string[];
        eventually_due?: string[];
    };
}

interface StripeConnectProps extends SharedData {
    stripeConnected: boolean;
    onboardingComplete: boolean;
    accountStatus?: AccountStatus | null;
    error?: string;
}

export default function Connect({ auth, stripeConnected, onboardingComplete, accountStatus, error }: StripeConnectProps) {
    const [isConnecting, setIsConnecting] = useState(false);

    // Helper function to convert technical field names to user-friendly text
    const formatRequirement = (requirement: string): string => {
        const requirementMap: Record<string, string> = {
            'business.profile.mcc': 'Business category',
            'business.profile.url': 'Business website',
            'external_account': 'Bank account details',
            'individual.address.city': 'City',
            'individual.address.line1': 'Street address',
            'individual.address.postal_code': 'Postal code',
            'individual.dob.day': 'Date of birth (day)',
            'individual.dob.month': 'Date of birth (month)',
            'individual.dob.year': 'Date of birth (year)',
            'individual.phone': 'Phone number',
            'tos_acceptance.date': 'Terms of service acceptance',
            'tos_acceptance.ip': 'Terms of service IP address',
            'individual.id_number': 'ID number',
            'individual.verification.document': 'Identity document',
            'individual.verification.additional_document': 'Additional identity document',
            'business_profile.mcc': 'Business category',
            'business_profile.url': 'Business website',
        };

        return requirementMap[requirement] || requirement.replace(/_/g, ' ').replace(/\./g, ' - ');
    };

    const handleConnect = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsConnecting(true);
        
        try {
            const response = await fetch('/worker/stripe/connect');
            const data = await response.json();
            
            if (data.success && data.url) {
                // Redirect to Stripe onboarding
                window.location.href = data.url;
            } else {
                setIsConnecting(false);
                if (data.redirect) {
                    router.visit(data.redirect);
                }
            }
        } catch (error) {
            setIsConnecting(false);
            console.error('Error connecting to Stripe:', error);
        }
    };

    const handleRefresh = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsConnecting(true);
        
        try {
            const response = await fetch('/worker/stripe/refresh');
            const data = await response.json();
            
            if (data.success && data.url) {
                window.location.href = data.url;
            } else {
                setIsConnecting(false);
                if (data.redirect) {
                    router.visit(data.redirect);
                }
            }
        } catch (error) {
            setIsConnecting(false);
            console.error('Error refreshing Stripe connection:', error);
        }
    };

    const handleDashboard = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/worker/stripe/dashboard');
            const data = await response.json();
            
            if (data.success && data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Error accessing Stripe dashboard:', error);
        }
    };

    const handleDisconnect = () => {
        if (confirm('Are you sure you want to disconnect your Stripe account? This will prevent you from receiving payments.')) {
            router.post(route('worker.stripe.disconnect'));
        }
    };

    const getStatusBadge = () => {
        if (!stripeConnected) {
            return <Badge variant="secondary">Not Connected</Badge>;
        }
        if (!onboardingComplete) {
            return <Badge className="bg-yellow-500">Pending Setup</Badge>;
        }
        if (accountStatus?.charges_enabled && accountStatus?.payouts_enabled) {
            return <Badge className="bg-green-500">Active</Badge>;
        }
        return <Badge className="bg-orange-500">Incomplete</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Payment Setup" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-4">
                            <Link href="/worker/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Setup</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Connect your Stripe account to receive payments for completed shifts
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Stripe Account Status
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Manage your payment account
                                </CardDescription>
                            </div>
                            {getStatusBadge()}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                            {!stripeConnected ? (
                                <>
                                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                                    Connect your Stripe account to get paid
                                                </h3>
                                                <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                                                    You'll be redirected to Stripe to set up your account. This is required to receive payments for your shifts.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white">What you'll need:</h4>
                                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>Personal identification (passport or driver's license)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>Bank account details for receiving payments</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>Your address and date of birth</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <Button 
                                        onClick={handleConnect}
                                        disabled={isConnecting}
                                        size="lg"
                                        className="w-full sm:w-auto"
                                    >
                                        {isConnecting ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                Connect with Stripe
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : !onboardingComplete ? (
                                <>
                                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                                                    Complete your Stripe setup
                                                </h3>
                                                <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                                                    Your Stripe account is created but you need to complete the onboarding process to start receiving payments.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {accountStatus?.requirements?.currently_due && accountStatus.requirements.currently_due.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white">Required information:</h4>
                                            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                {accountStatus.requirements.currently_due.map((requirement) => (
                                                    <li key={requirement} className="flex items-start gap-2">
                                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                        <span>{formatRequirement(requirement)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button 
                                            onClick={handleRefresh}
                                            disabled={isConnecting}
                                            size="lg"
                                        >
                                            {isConnecting ? (
                                                <>
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    Continue Setup
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-semibold text-green-900 dark:text-green-100">
                                                    Your Stripe account is active!
                                                </h3>
                                                <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                                                    You're all set to receive payments for your completed shifts.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Charges</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                {accountStatus?.charges_enabled ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Enabled</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Disabled</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Payouts</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                {accountStatus?.payouts_enabled ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Enabled</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Disabled</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button 
                                            onClick={handleDashboard}
                                            variant="default"
                                        >
                                            Open Stripe Dashboard
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </Button>
                                        <Button 
                                            onClick={handleDisconnect}
                                            variant="outline"
                                        >
                                            Disconnect Account
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                {/* Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>About Stripe Connect</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                            Stripe Connect is a secure payment platform that enables you to receive payments directly for your completed shifts.
                        </p>
                        <p>
                            Your payment information is securely stored by Stripe, and we never have direct access to your sensitive financial data.
                        </p>
                        <p>
                            Payments are typically processed within 2-3 business days after approval of your timesheets.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
