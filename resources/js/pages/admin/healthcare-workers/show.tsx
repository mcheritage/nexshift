import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    UserCheck, 
    Mail, 
    Calendar,
    ArrowLeft,
    FileText,
    Building2
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Health Care Workers',
        href: '/admin/healthcare-workers',
    },
    {
        title: 'Worker Details',
        href: '#',
    },
];

interface HealthCareWorker {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    role: string;
    created_at: string;
    care_home: {
        id: string;
        name: string;
    } | null;
}

interface Props {
    healthCareWorker: HealthCareWorker;
}

export default function HealthCareWorkerShow({ healthCareWorker }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${healthCareWorker.first_name} ${healthCareWorker.last_name}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button asChild variant="outline" className="mb-2">
                            <Link href="/admin/healthcare-workers">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Workers
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {healthCareWorker.first_name} {healthCareWorker.last_name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Health Care Worker Profile
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={`/admin/workers/${healthCareWorker.id}/documents`}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Documents
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic details about the worker</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">
                                        {healthCareWorker.first_name} {healthCareWorker.last_name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{healthCareWorker.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium capitalize">{healthCareWorker.gender}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Joined Date</p>
                                    <p className="font-medium">
                                        {new Date(healthCareWorker.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Work Information</CardTitle>
                            <CardDescription>Employment and assignment details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-sm">
                                    {healthCareWorker.role.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            {healthCareWorker.care_home && (
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Assigned Care Home</p>
                                        <p className="font-medium">{healthCareWorker.care_home.name}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage this worker's account and documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <Button asChild variant="outline">
                                <Link href={`/admin/workers/${healthCareWorker.id}/documents`}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Verify Documents
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
