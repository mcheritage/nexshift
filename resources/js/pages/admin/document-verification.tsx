import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    FileText, 
    Building2,
    UserCheck,
    Eye,
    Download,
    User
} from 'lucide-react';
import { format } from 'date-fns';

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

interface PendingDocument {
    id: number;
    document_type: string;
    document_type_display: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    status: string;
    status_display: string;
    status_color: string;
    status_icon: string;
    uploaded_at: string;
    owner: {
        id: string;
        name: string;
        email: string;
    };
    owner_type: 'care_home' | 'healthcare_worker';
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
    pendingDocuments: PendingDocument[];
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

export default function AdminDocumentVerification({ pendingDocuments, careHomes, documentStats, verificationStatuses }: Props) {
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

    const formatFileSize = (bytes: number | string) => {
        const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
        if (numBytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(numBytes) / Math.log(k));
        return Math.round(numBytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const viewDocument = (docId: number) => {
        window.open(`/admin/documents/${docId}/view`, '_blank');
    };

    const downloadDocument = (docId: number) => {
        window.location.href = `/admin/documents/${docId}/download`;
    };

    const goToOwner = (doc: PendingDocument) => {
        if (doc.owner_type === 'care_home') {
            router.visit(`/admin/carehomes/${doc.owner.id}/documents`);
        } else {
            router.visit(`/admin/workers/${doc.owner.id}/documents`);
        }
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

                {/* Stats Cards - same as before */}
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

                {/* Pending Documents Table */}
                {pendingDocuments && pendingDocuments.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Documents for Review</CardTitle>
                            <CardDescription>
                                All documents awaiting verification from care homes and healthcare workers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document Type</TableHead>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingDocuments.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium">
                                                {doc.document_type_display}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {doc.original_name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{doc.owner.name}</span>
                                                    <span className="text-xs text-muted-foreground">{doc.owner.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1">
                                                    {doc.owner_type === 'care_home' ? (
                                                        <><Building2 className="h-3 w-3" /> Care Home</>
                                                    ) : (
                                                        <><User className="h-3 w-3" /> Worker</>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatFileSize(doc.file_size)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => viewDocument(doc.id)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => downloadDocument(doc.id)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => goToOwner(doc)}
                                                    >
                                                        Review
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Pending Documents</CardTitle>
                            <CardDescription>
                                All documents have been reviewed
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

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
