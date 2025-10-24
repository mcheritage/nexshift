import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    FileText, 
    Building2,
    UserCheck
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Documents',
        href: '/admin/documents',
    },
];

interface CareHome {
    id: string;
    name: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    documents: Document[];
}

interface Document {
    id: number;
    document_type: string;
    original_name: string;
    status: 'pending' | 'approved' | 'rejected' | 'requires_attention';
    uploaded_at: string;
}

interface DocumentStats {
    total_documents: number;
    pending_documents: number;
    approved_documents: number;
    rejected_documents: number;
    requires_attention_documents: number;
}

interface VerificationStatus {
    value: string;
    displayName: string;
    description: string;
    color: string;
    icon: string;
}

interface Props {
    careHomes: CareHome[];
    documentStats: DocumentStats;
    verificationStatuses: VerificationStatus[];
}

const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    requires_attention: AlertTriangle,
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    requires_attention: 'bg-orange-100 text-orange-800',
};

export default function AdminDocumentVerification({ careHomes, documentStats, verificationStatuses }: Props) {
    const getStatusIcon = (status: string) => {
        const IconComponent = statusIcons[status as keyof typeof statusIcons];
        return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
    };

    const getStatusColor = (status: string) => {
        return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    };

    const getCompletionPercentage = (careHome: CareHome) => {
        const totalRequired = 18; // Based on DocumentType::getAllRequired()
        const approvedCount = careHome.documents.filter(doc => doc.status === 'approved').length;
        return Math.round((approvedCount / totalRequired) * 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents - Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                        <p className="text-muted-foreground">
                            Overview of all document submissions and verification status
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{documentStats.total_documents}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{documentStats.pending_documents}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{documentStats.approved_documents}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{documentStats.rejected_documents}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Requires Attention</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{documentStats.requires_attention_documents}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Document Management</CardTitle>
                        <CardDescription>
                            Review and manage all document submissions from care homes and healthcare workers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Care Home Documents
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Access care home documents through the Care Homes page. Each care home's documents can be reviewed from their profile.
                                </p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/admin/carehomes">
                                        View Care Homes
                                    </Link>
                                </Button>
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    Healthcare Worker Documents
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Access healthcare worker documents through the Healthcare Workers page. Each worker's documents can be reviewed from their profile.
                                </p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/admin/healthcare-workers">
                                        View Healthcare Workers
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
