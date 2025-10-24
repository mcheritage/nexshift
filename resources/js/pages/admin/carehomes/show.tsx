import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Building2, 
    Mail, 
    Calendar,
    ArrowLeft,
    FileText,
    User,
    Phone,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Care Homes',
        href: '/admin/carehomes',
    },
    {
        title: 'Care Home Details',
        href: '#',
    },
];

interface CareHome {
    id: string;
    name: string;
    created_at: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        created_at: string;
    } | null;
}

interface DocumentStats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    requires_attention: number;
}

interface Props {
    careHome: CareHome;
    documentStats: DocumentStats;
}

export default function CareHomeShow({ careHome, documentStats }: Props) {
    const completionPercentage = documentStats.total > 0 
        ? Math.round((documentStats.approved / documentStats.total) * 100) 
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={careHome.name} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button asChild variant="outline" className="mb-2">
                            <Link href="/admin/carehomes">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Care Homes
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {careHome.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Care Home Profile
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={`/admin/carehomes/${careHome.id}/documents`}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Documents
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Document Stats Summary */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{documentStats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{documentStats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{documentStats.approved}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{documentStats.rejected}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Requires Attention</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{documentStats.requires_attention}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Care Home Information</CardTitle>
                            <CardDescription>Basic details about the care home</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Care Home Name</p>
                                    <p className="font-medium">{careHome.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Registered Date</p>
                                    <p className="font-medium">
                                        {new Date(careHome.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Document Completion</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Progress value={completionPercentage} className="flex-1" />
                                        <span className="text-sm font-medium">{completionPercentage}%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Administrator Details</CardTitle>
                            <CardDescription>Primary contact and administrator</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {careHome.user ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Full Name</p>
                                            <p className="font-medium">
                                                {careHome.user.first_name} {careHome.user.last_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="font-medium">{careHome.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="font-medium">{careHome.user.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Account Created</p>
                                            <p className="font-medium">
                                                {new Date(careHome.user.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No administrator assigned</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage this care home's documents and settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <Button asChild variant="outline">
                                <Link href={`/admin/carehomes/${careHome.id}/documents`}>
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
