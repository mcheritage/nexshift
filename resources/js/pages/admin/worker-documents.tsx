import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import axios from 'axios';

interface Worker {
    id: number;
    name: string;
    email: string;
    phone: string;
}

const breadcrumbs = (worker: Worker): BreadcrumbItem[] => [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Health Care Workers',
        href: '/admin/healthcare-workers',
    },
    {
        title: worker.name,
        href: `/admin/healthcare-workers/${worker.id}`,
    },
];

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
    worker: Worker;
    requiredDocuments: RequiredDocument[];
    optionalDocuments: RequiredDocument[];
    verificationStatuses: VerificationStatus[];
}

const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    requires_attention: AlertTriangle,
};

const statusColors = {
    pending: 'text-amber-600',
    approved: 'text-green-600',
    rejected: 'text-red-600',
    requires_attention: 'text-orange-600',
};

export default function WorkerDocuments({ worker, requiredDocuments, optionalDocuments, verificationStatuses }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionRequired, setActionRequired] = useState('');

    const getStatusIcon = (status: Document['status']) => {
        const Icon = statusIcons[status];
        return <Icon className="h-4 w-4" />;
    };

    const getStatusColor = (status: Document['status']) => {
        return statusColors[status];
    };

    const openStatusDialog = (document: Document) => {
        setSelectedDocument(document);
        setNewStatus(document.status);
        setRejectionReason(document.rejection_reason || '');
        setActionRequired(document.action_required || '');
        setIsDialogOpen(true);
    };

    const handleStatusUpdate = async () => {
        if (!selectedDocument) return;

        try {
            await axios.post(`/admin/documents/${selectedDocument.id}/update-status`, {
                status: newStatus,
                rejection_reason: rejectionReason,
                action_required: actionRequired,
            });

            // Reload the page to show updated status
            router.reload();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to update document status:', error);
            alert('Failed to update document status. Please try again.');
        }
    };

    const getCompletionStats = () => {
        const total = requiredDocuments.length;
        const uploaded = requiredDocuments.filter(rd => rd.document).length;
        const approved = requiredDocuments.filter(rd => rd.document?.status === 'approved').length;
        
        return { total, uploaded, approved };
    };

    const stats = getCompletionStats();

    const renderDocumentSection = (documents: RequiredDocument[], title: string, isRequired: boolean) => (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
                {title}
                {isRequired && <Badge variant="secondary">Required</Badge>}
            </h2>
            
            <div className="grid gap-4">
                {documents.map((requiredDoc) => (
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
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs(worker)}>
            <Head title={`${worker.name} - Document Verification`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <Button asChild variant="outline" className="mb-2">
                        <Link href={`/admin/healthcare-workers/${worker.id}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Worker Profile
                        </Link>
                    </Button>
                    <a href={`/admin/healthcare-workers/${worker.id}`} className="text-3xl font-bold text-gray-900 dark:text-white hover:underline cursor-pointer block">
                        {worker.name}
                    </a>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {worker.email} • {worker.phone}
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

                {/* Required Documents */}
                {renderDocumentSection(requiredDocuments, 'Required Documents', true)}

                {/* Optional Documents */}
                {optionalDocuments.length > 0 && optionalDocuments.some(doc => doc.document) && (
                    <div className="mt-6">
                        {renderDocumentSection(optionalDocuments, 'Optional Documents', false)}
                    </div>
                )}

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
                                            placeholder="What action does the worker need to take?"
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
