import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    AlertTriangle,
    ArrowUpDown,
    Building2,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    User,
    UserCheck,
    XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Documents', href: '/admin/documents' },
];

interface FilteredDocument {
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
    owner: { id: string; name: string; email: string };
    owner_type: 'care_home' | 'healthcare_worker';
}

interface DocumentStats {
    total_documents: number;
    pending_documents: number;
    approved_documents: number;
    rejected_documents: number;
    requires_attention_documents: number;
}

interface Props {
    documents: FilteredDocument[];
    currentFilter: string;
    documentStats: DocumentStats;
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

const tableLabels: Record<string, { title: string; description: string }> = {
    pending: {
        title: 'Pending Documents',
        description: 'Documents awaiting verification from care homes and healthcare workers',
    },
    approved: {
        title: 'Approved Documents',
        description: 'Documents that have been verified and approved',
    },
    rejected: {
        title: 'Rejected Documents',
        description: 'Documents that were rejected during verification',
    },
    requires_attention: {
        title: 'Documents Requiring Attention',
        description: 'Documents flagged for re-submission or further action',
    },
    all: {
        title: 'All Documents',
        description: 'All document submissions across care homes and healthcare workers (up to 1,000)',
    },
};

function formatFileSize(bytes: number | string) {
    const n = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (!n) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(n) / Math.log(k));
    return (n / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

export default function AdminDocumentVerification({ documents, currentFilter, documentStats }: Props) {
    const goToOwner = (doc: FilteredDocument) => {
        if (doc.owner_type === 'care_home') {
            router.visit(`/admin/carehomes/${doc.owner.id}/documents?highlight=${doc.document_type}`);
        } else {
            router.visit(`/admin/workers/${doc.owner.id}/documents?highlight=${doc.document_type}`);
        }
    };

    const cardClass = (filter: string) =>
        `cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
            currentFilter === filter ? 'ring-2 ring-primary border-primary' : ''
        }`;

    const showStatusCol = currentFilter === 'all';

    const columns: ColumnDef<FilteredDocument>[] = [
        {
            accessorKey: 'document_type_display',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Document Type <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-medium">{row.original.document_type_display}</span>,
        },
        {
            id: 'owner_name',
            accessorFn: (row) => row.owner.name,
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Owner <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.owner.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.owner.email}</span>
                </div>
            ),
        },
        {
            accessorKey: 'owner_type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="outline" className="gap-1">
                    {row.original.owner_type === 'care_home' ? (
                        <><Building2 className="h-3 w-3" /> Care Home</>
                    ) : (
                        <><User className="h-3 w-3" /> Worker</>
                    )}
                </Badge>
            ),
        },
        ...(showStatusCol ? [{
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }: { row: { original: FilteredDocument } }) => {
                const Icon = statusIcons[row.original.status as keyof typeof statusIcons];
                return (
                    <Badge className={`${statusColors[row.original.status as keyof typeof statusColors] ?? 'bg-gray-100 text-gray-800'} flex items-center gap-1 w-fit`}>
                        {Icon && <Icon className="h-3 w-3" />}
                        {row.original.status_display}
                    </Badge>
                );
            },
        } as ColumnDef<FilteredDocument>] : []),
        {
            accessorKey: 'file_size',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Size <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-muted-foreground">{formatFileSize(row.original.file_size)}</span>,
        },
        {
            accessorKey: 'uploaded_at',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Uploaded <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {format(new Date(row.original.uploaded_at), 'MMM d, yyyy')}
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/admin/documents/${row.original.id}/view`, '_blank')}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { window.location.href = `/admin/documents/${row.original.id}/download`; }}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="sm" onClick={() => goToOwner(row.original)}>
                        Review
                    </Button>
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];

    const tableInfo = tableLabels[currentFilter] ?? tableLabels.pending;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground">
                        Overview of all document submissions and verification status
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Link href="/admin/documents?status=all">
                        <Card className={cardClass('all')}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{documentStats.total_documents}</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/documents?status=pending">
                        <Card className={cardClass('pending')}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{documentStats.pending_documents}</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/documents?status=approved">
                        <Card className={cardClass('approved')}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{documentStats.approved_documents}</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/documents?status=rejected">
                        <Card className={cardClass('rejected')}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{documentStats.rejected_documents}</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/documents?status=requires_attention">
                        <Card className={cardClass('requires_attention')}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Requires Attention</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{documentStats.requires_attention_documents}</div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Documents DataTable */}
                <Card>
                    <CardHeader>
                        <CardTitle>{tableInfo.title}</CardTitle>
                        <CardDescription>{tableInfo.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={documents}
                            searchKey="owner_name"
                            searchPlaceholder="Search by owner name..."
                        />
                    </CardContent>
                </Card>

                {/* Document Management Links */}
                <Card>
                    <CardHeader>
                        <CardTitle>Document Management</CardTitle>
                        <CardDescription>
                            Review and manage all document submissions from care homes and healthcare workers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                    <Link href="/admin/carehomes">View Care Homes</Link>
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
                                    <Link href="/admin/healthcare-workers">View Healthcare Workers</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
