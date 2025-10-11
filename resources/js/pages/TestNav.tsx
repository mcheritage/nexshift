import { Head, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface TestNavProps extends SharedData {
    testData: string;
}

export default function TestNav({ testData }: TestNavProps) {
    const { auth } = usePage<SharedData>().props;
    
    return (
        <AppLayout>
            <Head title="Navigation Test" />
            
            <div className="max-w-4xl mx-auto space-y-6 p-6">
                <h1 className="text-3xl font-bold">Navigation Debug Test</h1>
                
                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="text-xl font-semibold mb-2">User Data:</h2>
                    <pre className="text-sm">{JSON.stringify(auth.user, null, 2)}</pre>
                </div>
                
                <div className="bg-blue-100 p-4 rounded">
                    <h2 className="text-xl font-semibold mb-2">Role Analysis:</h2>
                    <p><strong>Role:</strong> {auth.user?.role || 'undefined'}</p>
                    <p><strong>Expected Menu:</strong> {auth.user?.role === 'care_home_admin' ? 'Should see Shifts menu' : 'Will not see Shifts menu'}</p>
                </div>
            </div>
        </AppLayout>
    );
}