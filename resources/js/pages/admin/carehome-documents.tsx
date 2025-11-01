import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    FileText, 
    Users,
    Download,
    ArrowLeft,
    Save
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Document Verification',
        href: '/admin/documents',
    },
    {
        title: 'Care Home Documents',
        href: '#',
    },
];

interface CareHome {
    id: string;
    name: string;
    users: {
        id: string;
        name: string;
        email: string;
    }[];
}

interface Document {
    id: number;
    original_name: string;
    file_size: number;
    mime_type: string;
    status: 'pending' | 'approved' | 'rejected' | 'requires_attention';
    status_display: string;
    status_color: string;
    status_icon: string;
    rejection_reason?: string;
    action_required?: string;
    reviewed_by?: number;
    reviewed_at?: string;
    uploaded_at: string;
    reviewer?: {
        id: number;
        name: string;
        email: string;
    };
}

interface RequiredDocument {
    type: {
        value: string;
        displayName: string;
        description: string;
    };
    document: Document | null;
}

interface VerificationStatus {
    value: string;
    displayName: string;
    description: string;
    color: string;
    icon: string;
}

interface Props {
    careHome: CareHome;
    requiredDocuments: RequiredDocument[];
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

export default function CareHomeDocuments({ careHome, requiredDocuments, verificationStatuses }: Props) {
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [actionRequired, setActionRequired] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const getStatusIcon = (status: string) => {
        const IconComponent = statusIcons[status as keyof typeof statusIcons];
        return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
    };

    const getStatusColor = (status: string) => {
        return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    };

    const handleStatusUpdate = () => {
        if (!selectedDocument) return;

        router.post(`/admin/documents/${selectedDocument.id}/update-status`, {
            status: newStatus,
            rejection_reason: rejectionReason || null,
            action_required: actionRequired || null,
        }, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setSelectedDocument(null);
                setNewStatus('');
                setRejectionReason('');
                setActionRequired('');
            },
        });
    };

    const openStatusDialog = (document: Document) => {
        setSelectedDocument(document);
        setNewStatus(document.status);
        setRejectionReason(document.rejection_reason || '');
        setActionRequired(document.action_required || '');
        setIsDialogOpen(true);
    };

    const getCompletionStats = () => {
        const total = requiredDocuments.length;
        const uploaded = requiredDocuments.filter(rd => rd.document).length;
        const approved = requiredDocuments.filter(rd => rd.document?.status === 'approved').length;
        
        return { total, uploaded, approved };
    };

    const stats = getCompletionStats();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${careHome.name} - Document Verification`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div>
                    <Button asChild variant="outline" size="sm" className="mb-2">
                        <Link href={`/admin/carehomes/${careHome.id}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Care Home Profile
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">{careHome.name}</h1>
                    <p className="text-muted-foreground">
                        Administrators: {careHome.users.map(u => `${u.name} (${u.email})`).join(', ')}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Required</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Uploaded</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.uploaded}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Documents List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Required Documents</h2>
                    
                    <div className="grid gap-4">
                        {requiredDocuments.map((requiredDoc) => (
                            <Card key={requiredDoc.type.value}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{requiredDoc.type.displayName}</span>
                                        {requiredDoc.document && (
                                            <Badge 
                                                className={`${getStatusColor(requiredDoc.document.status)} flex items-center gap-1`}
                                            >
                                                {getStatusIcon(requiredDoc.document.status)}
                                                {requiredDoc.document.status_display}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {requiredDoc.type.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {requiredDoc.document ? (
                                        <div className="space-y-4">
                                            <div className="grid gap-2 text-sm">
                                                <div><strong>File:</strong> {requiredDoc.document.original_name}</div>
                                                <div><strong>Size:</strong> {(requiredDoc.document.file_size / 1024).toFixed(1)} KB</div>
                                                <div><strong>Uploaded:</strong> {new Date(requiredDoc.document.uploaded_at).toLocaleDateString()}</div>
                                                {requiredDoc.document.reviewed_at && (
                                                    <div><strong>Reviewed:</strong> {new Date(requiredDoc.document.reviewed_at).toLocaleDateString()}</div>
                                                )}
                                                {requiredDoc.document.reviewer && (
                                                    <div><strong>Reviewed by:</strong> {requiredDoc.document.reviewer.name}</div>
                                                )}
                                            </div>
                                            
                                            {(requiredDoc.document.rejection_reason || requiredDoc.document.action_required) && (
                                                <div className="space-y-2">
                                                    {requiredDoc.document.rejection_reason && (
                                                        <div>
                                                            <strong className="text-red-600">Rejection Reason:</strong>
                                                            <p className="text-sm text-red-600">{requiredDoc.document.rejection_reason}</p>
                                                        </div>
                                                    )}
                                                    {requiredDoc.document.action_required && (
                                                        <div>
                                                            <strong className="text-orange-600">Action Required:</strong>
                                                            <p className="text-sm text-orange-600">{requiredDoc.document.action_required}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={`/admin/documents/${requiredDoc.document.id}/download`}>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </a>
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => openStatusDialog(requiredDoc.document!)}
                                                >
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Update Status
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground">
                                            No document uploaded yet
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Status Update Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Update Document Status</DialogTitle>
                            <DialogDescription>
                                Update the verification status for {selectedDocument?.original_name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {verificationStatuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.displayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {(newStatus === 'rejected' || newStatus === 'requires_attention') && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="rejection_reason">Reason for Rejection</Label>
                                        <Textarea
                                            id="rejection_reason"
                                            placeholder="Explain why the document was rejected..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="grid gap-2">
                                        <Label htmlFor="action_required">Action Required</Label>
                                        <Textarea
                                            id="action_required"
                                            placeholder="What action does the care home need to take?"
                                            value={actionRequired}
                                            onChange={(e) => setActionRequired(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleStatusUpdate}>
                                Update Status
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
