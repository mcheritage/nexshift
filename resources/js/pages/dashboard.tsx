import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Notification } from '@/types';
import { type Document, type DocumentVerificationStatus } from '@/types/document';
import { Head, Link } from '@inertiajs/react';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    FileText, 
    Upload,
    Eye,
    AlertCircle,
    Bell
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface CareHome {
    id: string;
    name: string;
}

interface Props {
    careHome: CareHome;
    documents: Document[];
    notifications: Notification[];
    verificationStatuses: Array<{
        value: DocumentVerificationStatus;
        displayName: string;
        description: string;
        color: string;
        icon: string;
        isActionRequired: boolean;
    }>;
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

export default function Dashboard({ careHome, documents, notifications, verificationStatuses }: Props) {
    const getStatusIcon = (status: string) => {
        const IconComponent = statusIcons[status as keyof typeof statusIcons];
        return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
    };

    const getStatusColor = (status: string) => {
        return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    };

    const getCompletionStats = () => {
        const totalRequired = 18; // Based on DocumentType::getAllRequired()
        const uploaded = documents.length;
        const approved = documents.filter(doc => doc.status === 'approved').length;
        const pending = documents.filter(doc => doc.status === 'pending').length;
        const rejected = documents.filter(doc => doc.status === 'rejected').length;
        const requiresAttention = documents.filter(doc => doc.status === 'requires_attention').length;
        
        return { totalRequired, uploaded, approved, pending, rejected, requiresAttention };
    };

    const stats = getCompletionStats();
    const completionPercentage = Math.round((stats.approved / stats.totalRequired) * 100);

    const getDocumentsByStatus = (status: DocumentVerificationStatus) => {
        return documents.filter(doc => doc.status === status);
    };

    const hasActionRequired = documents.some(doc => 
        doc.status === 'rejected' || doc.status === 'requires_attention'
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome to Nexshift</h1>
                        <p className="text-muted-foreground">
                            {careHome.name} - Document Verification Dashboard
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/documents/">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Documents
                        </Link>
                    </Button>
                </div>

                {/* Action Required Alert */}
                {hasActionRequired && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-800">
                                <AlertCircle className="h-5 w-5" />
                                Action Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-orange-700">
                                Some of your documents require attention. Please review the status below and take the necessary action.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Notifications */}
                {notifications.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Recent Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {notifications.slice(0, 5).map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-3 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-medium">{notification.title}</div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {notification.message}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Required</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalRequired}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Uploaded</CardTitle>
                            <Upload className="h-4 w-4 text-blue-600" />
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
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.rejected + stats.requiresAttention}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle>Document Verification Progress</CardTitle>
                        <CardDescription>
                            {completionPercentage}% of required documents have been approved
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={completionPercentage} className="w-full" />
                        <div className="mt-2 text-sm text-muted-foreground">
                            {stats.approved} of {stats.totalRequired} documents approved
                        </div>
                    </CardContent>
                </Card>

                {/* Document Status Overview */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Document Status Overview</h2>
                    
                    <div className="grid gap-4">
                        {verificationStatuses.map((status) => {
                            const docsWithStatus = getDocumentsByStatus(status.value);
                            
                            if (docsWithStatus.length === 0) return null;
                            
                            return (
                                <Card key={status.value}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(status.value)}
                                                {status.displayName}
                                            </div>
                                            <Badge 
                                                className={`${getStatusColor(status.value)} flex items-center gap-1`}
                                            >
                                                {docsWithStatus.length} document{docsWithStatus.length !== 1 ? 's' : ''}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            {status.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {docsWithStatus.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <div className="font-medium">{doc.original_name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                                        </div>
                                                        {doc.rejection_reason && (
                                                            <div className="text-sm text-red-600 mt-1">
                                                                <strong>Reason:</strong> {doc.rejection_reason}
                                                            </div>
                                                        )}
                                                        {doc.action_required && (
                                                            <div className="text-sm text-orange-600 mt-1">
                                                                <strong>Action Required:</strong> {doc.action_required}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href="/documents/">
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </div>
                                            ))}
                    </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
