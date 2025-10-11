import { Head, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { getMainNavItems } from '@/lib/sidenav-menu';

export default function DebugNav() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.role;
    const navItems = getMainNavItems(userRole);
    
    console.log('Debug Nav - User:', auth.user);
    console.log('Debug Nav - Role:', userRole);
    console.log('Debug Nav - Nav Items:', navItems);
    
    return (
        <AppLayout>
            <Head title="Debug Navigation" />
            
            <div className="max-w-4xl mx-auto space-y-6 p-6">
                <h1 className="text-3xl font-bold">Navigation Debug</h1>
                
                <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded">
                        <h3 className="font-bold">Current User:</h3>
                        <pre className="text-sm mt-2">{JSON.stringify(auth.user, null, 2)}</pre>
                    </div>
                    
                    <div className="bg-blue-100 p-4 rounded">
                        <h3 className="font-bold">User Role:</h3>
                        <p className="text-lg">{userRole || 'undefined'}</p>
                    </div>
                    
                    <div className="bg-green-100 p-4 rounded">
                        <h3 className="font-bold">Navigation Items:</h3>
                        <pre className="text-sm mt-2">{JSON.stringify(navItems, null, 2)}</pre>
                    </div>
                    
                    <div className="bg-yellow-100 p-4 rounded">
                        <h3 className="font-bold">Should See Shifts Menu:</h3>
                        <p className="text-lg">{userRole === 'care_home_admin' ? 'YES - Shifts should appear' : 'NO - Wrong role'}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}