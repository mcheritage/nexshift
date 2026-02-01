import { Head, Link, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, ExternalLink, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface StripePageProps extends SharedData {
    stripeConnected: boolean;
    stripeAccountId?: string;
}

export default function Stripe({ stripeConnected, stripeAccountId }: StripePageProps) {
    const handleConnectStripe = () => {
        // Use form submission to handle the redirect to Stripe
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('worker.stripe.connect');
        
        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }
        
        document.body.appendChild(form);
        form.submit();
    };

    const handleStripeDashboard = () => {
        if (!stripeConnected || !stripeAccountId) {
            alert('No Stripe account connected. Please connect your Stripe account first.');
            return;
        }
        
        window.location.href = route('worker.stripe.dashboard');
    };

    return (
        <AppLayout>
            <Head title="Payment Setup" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Payment Setup</h1>
                        <p className="text-muted-foreground">Manage your payment settings with Stripe</p>
                    </div>
                    
                    <Link href={route('worker.dashboard')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                </div>

                {stripeConnected ? (
                    <div className="space-y-6">
                        <Alert className="border-green-500 bg-green-50">
                            <CheckCircle className="text-green-600" />
                            <AlertDescription className="text-green-700">
                                <strong>Payment method connected!</strong> Your Stripe account is set up and ready to receive payments.
                            </AlertDescription>
                        </Alert>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="inline w-5 h-5 mr-2" />
                                    Stripe Account
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Your Stripe account is active. You can access your Stripe dashboard to:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                                        <li>View your payment history</li>
                                        <li>Update your bank account details</li>
                                        <li>Transfer funds to your bank account</li>
                                        <li>View transaction details</li>
                                    </ul>
                                </div>

                                <Button onClick={handleStripeDashboard} className="w-full">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Access Stripe Dashboard
                                </Button>

                                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <h4 className="font-medium text-sm mb-2">How payments work:</h4>
                                    <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <li>Complete your shifts and submit timesheets</li>
                                        <li>Care homes approve your timesheets</li>
                                        <li>Care homes pay invoices via Stripe</li>
                                        <li>Payments are automatically transferred to your Stripe account</li>
                                        <li>You can transfer funds from Stripe to your bank account</li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Alert className="border-orange-500 bg-orange-50">
                            <AlertCircle className="text-orange-600" />
                            <AlertDescription className="text-orange-700">
                                <strong>Payment setup required!</strong> Connect your Stripe account to receive payments for completed shifts.
                            </AlertDescription>
                        </Alert>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="inline w-5 h-5 mr-2" />
                                    Connect Stripe
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        To receive payments for your work, you need to connect a Stripe account. This allows care homes to pay you directly and securely.
                                    </p>
                                    <h4 className="font-medium mb-2">Why Stripe?</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-6">
                                        <li>Fast and secure payments</li>
                                        <li>Direct transfers to your bank account</li>
                                        <li>Track all your earnings in one place</li>
                                        <li>Industry-leading security and fraud protection</li>
                                    </ul>
                                </div>

                                <Button onClick={handleConnectStripe} className="w-full" size="lg">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Connect with Stripe
                                </Button>

                                <p className="text-xs text-gray-500 text-center">
                                    By connecting, you agree to Stripe's Terms of Service
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
