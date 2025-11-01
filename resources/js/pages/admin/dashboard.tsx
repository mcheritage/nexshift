import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Building2, 
    Users, 
    FileText, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    UserCheck,
    UserCog,
    Shield
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
];

interface Stats {
    total_care_homes: number;
    total_users: number;
    total_documents: number;
    pending_documents: number;
    approved_documents: number;
    rejected_documents: number;
    requires_attention_documents: number;
    admin_users: number;
    care_home_admins: number;
    health_care_workers: number;
}

interface RecentDocument {
    id: number;
    document_type: string;
    original_name: string;
    status: string;
    created_at: string;
    care_home?: {
        id: string;
        name: string;
    } | null;
    user?: {
        id: string;
        first_name: string;
        last_name: string;
    } | null;
    reviewer?: {
        id: string;
        name: string;
    };
}

interface RecentCareHome {
    id: string;
    name: string;
    created_at: string;
    users: Array<{
        id: string;
        name: string;
        email: string;
    }>;
}

interface RecentUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    created_at: string;
    care_home?: {
        id: string;
        name: string;
    };
}

interface Props {
    stats: Stats;
    recentDocuments: RecentDocument[];
    recentCareHomes: RecentCareHome[];
    recentUsers: RecentUser[];
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    requires_attention: 'bg-orange-100 text-orange-800',
};

const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    care_home_admin: 'bg-blue-100 text-blue-800',
    health_care_worker: 'bg-green-100 text-green-800',
};

export default function AdminDashboard({ stats, recentDocuments, recentCareHomes, recentUsers }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage care homes, health care workers, and document verification
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Care Homes</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_care_homes}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_documents}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Health Care Workers</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.health_care_workers}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Document Status Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_documents}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approved_documents}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.rejected_documents}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Requires Attention</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.requires_attention_documents}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Care Home Management
                            </CardTitle>
                            <CardDescription>
                                Manage care homes and their administrators
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button asChild className="w-full">
                                    <Link href="/admin/carehomes">
                                        View All Care Homes
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/admin/carehomes">
                                        Add New Care Home
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5" />
                                Health Care Workers
                            </CardTitle>
                            <CardDescription>
                                Manage health care workers across all care homes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button asChild className="w-full">
                                    <Link href="/admin/healthcare-workers">
                                        View All Workers
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/admin/healthcare-workers">
                                        Add New Worker
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Document Verification
                            </CardTitle>
                            <CardDescription>
                                Review and verify care home documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button asChild className="w-full">
                                    <Link href="/admin/documents">
                                        Review Documents
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/admin/documents">
                                        Pending Reviews
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Recent Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Documents</CardTitle>
                            <CardDescription>
                                Latest document uploads and status changes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentDocuments.slice(0, 5).map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">{doc.original_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {doc.care_home?.name || (doc.user ? `${doc.user.first_name} ${doc.user.last_name}` : 'Unknown')}
                                            </p>
                                        </div>
                                        <Badge className={statusColors[doc.status as keyof typeof statusColors]}>
                                            {doc.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Care Homes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Care Homes</CardTitle>
                            <CardDescription>
                                Newly registered care homes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentCareHomes.slice(0, 5).map((careHome) => (
                                    <div key={careHome.id} className="space-y-1">
                                        <p className="text-sm font-medium">{careHome.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Admin{careHome.users?.length > 1 ? 's' : ''}: {careHome.users?.map(u => u.name).join(', ') || 'No admins'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Users</CardTitle>
                            <CardDescription>
                                Newly registered users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentUsers.slice(0, 5).map((user) => (
                                    <div key={user.id} className="space-y-1">
                                        <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                                                {user.role.replace('_', ' ')}
                                            </Badge>
                                            {user.care_home?.name && (
                                                <span className="text-xs text-muted-foreground">
                                                    {user.care_home.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
