import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface TestInertiaProps {
    message: string;
}

export default function TestInertia({ message }: TestInertiaProps) {
    return (
        <AppLayout>
            <Head title="Test Inertia" />
            
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">Inertia Test Page</h1>
                <p className="text-lg">{message}</p>
                <div className="mt-4">
                    <p className="text-gray-600">If you can see this page, Inertia.js is working correctly.</p>
                </div>
            </div>
        </AppLayout>
    );
}