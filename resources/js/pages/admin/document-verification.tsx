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
    Users,
    Eye,
    Download
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Document Verification',
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
            <Head title="Document Verification - Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Document Verification</h1>
                        <p className="text-muted-foreground">
                            Manage and review care home document submissions
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

                {/* Care Homes List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Care Homes</h2>
                    
                    <div className="grid gap-4">
                        {careHomes.map((careHome) => (
                            <Card key={careHome.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                {careHome.name}
                                            </CardTitle>
                                            <CardDescription>
                                                Administrator: {careHome.user.name} ({careHome.user.email})
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {getCompletionPercentage(careHome)}% Complete
                                            </div>
                                            <Progress 
                                                value={getCompletionPercentage(careHome)} 
                                                className="w-24 mt-1" 
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {/* Document Status Summary */}
                                        <div className="flex flex-wrap gap-2">
                                            {verificationStatuses.map((status) => {
                                                const count = careHome.documents.filter(
                                                    doc => doc.status === status.value
                                                ).length;
                                                
                                                if (count === 0) return null;
                                                
                                                return (
                                                    <Badge 
                                                        key={status.value}
                                                        variant="secondary"
                                                        className={`${getStatusColor(status.value)} flex items-center gap-1`}
                                                    >
                                                        {getStatusIcon(status.value)}
                                                        {status.displayName}: {count}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/admin/carehomes/${careHome.id}/documents`}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Documents
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
