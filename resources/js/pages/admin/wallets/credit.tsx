import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, TrendingUp, Upload, AlertCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Owner {
    id: string;
    name: string;
    email?: string;
}

interface WalletData {
    id: number;
    balance: number;
    owner: Owner;
}

interface Props {
    owner: Owner;
    ownerType: 'care_home' | 'user';
    wallet: WalletData;
}

export default function CreditWallet({ owner, ownerType, wallet }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        owner_type: ownerType,
        owner_id: owner.id,
        amount: '',
        reason: '',
        proof_file: null as File | null,
    });

    const [fileName, setFileName] = useState<string>('');

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.wallets.credit'));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('proof_file', file);
            setFileName(file.name);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title={`Credit Wallet - ${owner.name}`} />

            <div className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.wallets.show', wallet.id)}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Wallet
                            </Button>
                        </Link>
                        
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Credit Wallet</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Add funds to {owner.name}'s wallet
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Current Balance Alert */}
                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            Current wallet balance: <strong>{formatCurrency(wallet.balance)}</strong>
                        </AlertDescription>
                    </Alert>

                    {/* Credit Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Credit Details</CardTitle>
                            <CardDescription>
                                Enter the amount and reason for crediting this wallet
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Amount */}
                                <div className="space-y-2">
                                    <Label htmlFor="amount">
                                        Amount (GBP) <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            £
                                        </span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max="1000000"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="pl-8"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    {errors.amount && (
                                        <p className="text-sm text-red-600">{errors.amount}</p>
                                    )}
                                </div>

                                {/* Reason */}
                                <div className="space-y-2">
                                    <Label htmlFor="reason">
                                        Reason <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="Enter the reason for crediting this wallet..."
                                        rows={4}
                                        maxLength={500}
                                        required
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>This will be visible in transaction history</span>
                                        <span>{data.reason.length}/500</span>
                                    </div>
                                    {errors.reason && (
                                        <p className="text-sm text-red-600">{errors.reason}</p>
                                    )}
                                </div>

                                {/* Proof File Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="proof_file">
                                        Proof Document (Optional)
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <label
                                            htmlFor="proof_file"
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                                        >
                                            <Upload className="h-4 w-4 text-gray-600" />
                                            <span className="text-sm text-gray-700">
                                                {fileName || 'Choose file'}
                                            </span>
                                        </label>
                                        <input
                                            id="proof_file"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Upload proof document (PDF, JPG, PNG - Max 5MB)
                                    </p>
                                    {errors.proof_file && (
                                        <p className="text-sm text-red-600">{errors.proof_file}</p>
                                    )}
                                </div>

                                {/* Preview New Balance */}
                                {data.amount && parseFloat(data.amount) > 0 && (
                                    <Alert className="bg-green-50 border-green-200">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-800">
                                            New balance after credit: <strong>
                                                {formatCurrency(wallet.balance + parseFloat(data.amount))}
                                            </strong>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Error Messages */}
                                {errors.error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errors.error}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-4 pt-4 border-t">
                                    <Link href={route('admin.wallets.show', wallet.id)}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {processing ? 'Processing...' : 'Credit Wallet'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
