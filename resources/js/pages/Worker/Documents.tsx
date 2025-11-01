import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    FileText, 
    Upload,
    Download,
    Trash2,
    Info
} from 'lucide-react';
import { useState, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'My Documents',
        href: '/worker/documents',
    },
];

interface Document {
    id: number;
    document_type: string;
    original_name: string;
    file_size: number;
    status: 'pending' | 'approved' | 'rejected' | 'requires_attention';
    status_display: string;
    status_color: string;
    status_icon: string;
    rejection_reason?: string;
    action_required?: string;
    uploaded_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
}

interface DocumentType {
    type: string;
    display_name: string;
    description: string;
}

interface Props {
    documents: Document[];
    requiredDocuments: DocumentType[];
    optionalDocuments: DocumentType[];
}

const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    requires_attention: AlertTriangle,
};

export default function WorkerDocuments({ documents, requiredDocuments, optionalDocuments }: Props) {
    const [selectedDocType, setSelectedDocType] = useState<string>('');
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        document_type: '',
        file: null as File | null,
    });

    const getDocumentByType = (type: string) => {
        return documents.find(doc => doc.document_type === type);
    };

    const handleUploadClick = (docType: string) => {
        setSelectedDocType(docType);
        setData('document_type', docType);
        setIsUploadDialogOpen(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setData('file', file);
        }
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.file) {
            return;
        }

        post(route('worker.documents.store'), {
            onSuccess: () => {
                setIsUploadDialogOpen(false);
                setSelectedFile(null);
                reset();
            },
        });
    };

    const handleDownload = (documentId: number) => {
        window.location.href = route('worker.documents.download', documentId);
    };

    const handleDelete = (documentId: number) => {
        if (confirm('Are you sure you want to delete this document?')) {
            router.delete(route('worker.documents.destroy', documentId));
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderDocumentCard = (docType: DocumentType, isRequired: boolean) => {
        const document = getDocumentByType(docType.type);
        const StatusIcon = document ? statusIcons[document.status] : FileText;

        return (
            <Card key={docType.type} className="relative">
                {isRequired && (
                    <Badge className="absolute top-4 right-4" variant="secondary">
                        Required
                    </Badge>
                )}
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {docType.display_name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                        {docType.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {document ? (
                        <>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <StatusIcon className={`h-5 w-5 ${document.status_color}`} />
                                    <div>
                                        <p className="font-medium text-sm">{document.original_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(document.file_size)} • Uploaded {formatDate(document.uploaded_at)}
                                        </p>
                                    </div>
                                </div>
                                <Badge className={document.status_color}>
                                    {document.status_display}
                                </Badge>
                            </div>

                            {document.status === 'rejected' && document.rejection_reason && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm text-red-900 dark:text-red-100">
                                            Rejection Reason
                                        </p>
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            {document.rejection_reason}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {document.status === 'requires_attention' && document.action_required && (
                                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm text-amber-900 dark:text-amber-100">
                                            Action Required
                                        </p>
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            {document.action_required}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {document.reviewed_at && document.reviewed_by && (
                                <p className="text-xs text-muted-foreground">
                                    Reviewed by {document.reviewed_by} on {formatDate(document.reviewed_at)}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(document.id)}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                                {document.status !== 'approved' && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUploadClick(docType.type)}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Replace
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(document.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                No document uploaded yet
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUploadClick(docType.type)}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Document
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Documents" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Documents</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Upload and manage your professional documents for verification
                    </p>
                </div>

                {/* Required Documents */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Required Documents</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        {requiredDocuments.map(docType => renderDocumentCard(docType, true))}
                    </div>
                </div>

                {/* Optional Documents */}
                {optionalDocuments.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Optional Documents</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            {optionalDocuments.map(docType => renderDocumentCard(docType, false))}
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                            Select a file to upload. Maximum file size: 10MB
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUploadSubmit}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="file">Select File</Label>
                                <input
                                    ref={fileInputRef}
                                    id="file"
                                    type="file"
                                    onChange={handleFileSelect}
                                    className="mt-2 block w-full text-sm text-slate-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-primary file:text-primary-foreground
                                        hover:file:bg-primary/90"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                />
                                {selectedFile && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                    </p>
                                )}
                                {errors.file && (
                                    <p className="mt-2 text-sm text-red-600">{errors.file}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsUploadDialogOpen(false);
                                    setSelectedFile(null);
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || !selectedFile}>
                                {processing ? 'Uploading...' : 'Upload'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
