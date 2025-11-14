import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    UserCheck, 
    Plus,
    Trash2,
    Download,
    FileText,
    Search,
    Clock,
    CheckCircle,
    XCircle,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown
} from 'lucide-react';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Health Care Workers',
        href: '/admin/healthcare-workers',
    },
];

interface HealthCareWorker {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    role: string;
    status: string;
    created_at: string;
    documents_count: number;
    pending_documents_count: number;
    approved_documents_count: number;
    rejected_documents_count: number;
}

interface CareHome {
    id: string;
    name: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface Props {
    healthCareWorkers: HealthCareWorker[];
    careHomes: CareHome[];
}

const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

export default function HealthCareWorkersIndex({ healthCareWorkers, careHomes }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        care_home_id: '',
        gender: '',
    });

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (column: string) => {
        if (sortColumn !== column) {
            return <ChevronsUpDown className="h-4 w-4" />;
        }
        return sortDirection === 'asc' 
            ? <ChevronUp className="h-4 w-4" /> 
            : <ChevronDown className="h-4 w-4" />;
    };

    const filteredWorkers = useMemo(() => {
        return healthCareWorkers.filter(worker => {
            const searchLower = searchTerm.toLowerCase();
            return (
                worker.first_name.toLowerCase().includes(searchLower) ||
                worker.last_name.toLowerCase().includes(searchLower) ||
                worker.email.toLowerCase().includes(searchLower)
            );
        });
    }, [healthCareWorkers, searchTerm]);

    const sortedWorkers = useMemo(() => {
        if (!sortColumn) return filteredWorkers;

        return [...filteredWorkers].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortColumn) {
                case 'name':
                    aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
                    bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'gender':
                    aValue = a.gender.toLowerCase();
                    bValue = b.gender.toLowerCase();
                    break;
                case 'status':
                    aValue = a.status.toLowerCase();
                    bValue = b.status.toLowerCase();
                    break;
                case 'documents':
                    aValue = a.documents_count;
                    bValue = b.documents_count;
                    break;
                case 'joined':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredWorkers, sortColumn, sortDirection]);

    const paginatedWorkers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedWorkers.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedWorkers, currentPage]);

    const totalPages = Math.ceil(sortedWorkers.length / itemsPerPage);

    const handleCreate = () => {
        router.post('/admin/healthcare-workers', formData, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    care_home_id: '',
                    gender: '',
                });
            },
        });
    };

    const handleDelete = (workerId: string) => {
        if (confirm('Are you sure you want to delete this health care worker? This action cannot be undone.')) {
            router.delete(`/admin/healthcare-workers/${workerId}`);
        }
    };

    const handleApprove = (workerId: string) => {
        if (confirm('Are you sure you want to approve this healthcare worker?')) {
            router.patch(`/admin/healthcare-workers/${workerId}/approve`);
        }
    };

    const handleReject = (workerId: string) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            router.patch(`/admin/healthcare-workers/${workerId}/reject`, { reason });
        }
    };

    const handleExport = () => {
        const csvContent = [
            ['Name', 'Email', 'Gender', 'Total Documents', 'Pending', 'Approved', 'Rejected', 'Joined Date'],
            ...healthCareWorkers.map(worker => [
                `${worker.first_name} ${worker.last_name}`,
                worker.email,
                worker.gender,
                worker.documents_count.toString(),
                worker.pending_documents_count.toString(),
                worker.approved_documents_count.toString(),
                worker.rejected_documents_count.toString(),
                new Date(worker.created_at).toLocaleDateString()
            ])
        ]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthcare-workers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const stats = useMemo(() => {
        const totalWorkers = healthCareWorkers.length;
        const totalPending = healthCareWorkers.reduce((sum, worker) => sum + worker.pending_documents_count, 0);
        const totalApproved = healthCareWorkers.reduce((sum, worker) => sum + worker.approved_documents_count, 0);
        const totalRejected = healthCareWorkers.reduce((sum, worker) => sum + worker.rejected_documents_count, 0);
        
        return {
            totalWorkers,
            totalPending,
            totalApproved,
            totalRejected,
        };
    }, [healthCareWorkers]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Health Care Workers Management" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Care Workers</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage health care workers and their document verification
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Worker
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Health Care Worker</DialogTitle>
                                    <DialogDescription>
                                        Create a new health care worker account.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name">First Name</Label>
                                        <Input
                                            id="first_name"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Enter password"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {genderOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreate}>
                                        Create Worker
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalWorkers}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved Documents</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.totalApproved}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected Documents</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.totalRejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Data Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead 
                                            className="cursor-pointer select-none"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Name
                                                {getSortIcon('name')}
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer select-none"
                                            onClick={() => handleSort('email')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Email
                                                {getSortIcon('email')}
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer select-none"
                                            onClick={() => handleSort('gender')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Gender
                                                {getSortIcon('gender')}
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer select-none"
                                            onClick={() => handleSort('status')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Status
                                                {getSortIcon('status')}
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer select-none"
                                            onClick={() => handleSort('documents')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Documents
                                                {getSortIcon('documents')}
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer select-none"
                                            onClick={() => handleSort('joined')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Joined
                                                {getSortIcon('joined')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedWorkers.length > 0 ? (
                                        paginatedWorkers.map((worker) => (
                                            <TableRow key={worker.id} className="h-12">
                                                <TableCell className="py-2">
                                                    <a 
                                                        href={`/admin/healthcare-workers/${worker.id}`}
                                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        <UserCheck className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            {worker.first_name} {worker.last_name}
                                                        </span>
                                                    </a>
                                                </TableCell>
                                                <TableCell className="py-2">{worker.email}</TableCell>
                                                <TableCell className="py-2 capitalize">{worker.gender}</TableCell>
                                                <TableCell className="py-2">
                                                    <Badge 
                                                        variant={
                                                            worker.status === 'approved' ? 'default' : 
                                                            worker.status === 'pending' ? 'secondary' : 
                                                            'destructive'
                                                        }
                                                        className={
                                                            worker.status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                                                            worker.status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                                            'bg-red-600 hover:bg-red-700'
                                                        }
                                                    >
                                                        {worker.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                        {worker.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                                        {worker.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                                        {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-2">
                                                    <div className="inline-flex flex-col border rounded-md overflow-hidden min-w-[140px]">
                                                        <div className="flex items-center justify-between px-2 py-1 bg-muted border-b">
                                                            <span className="font-medium text-xs">Total</span>
                                                            <span className="font-bold text-xs">{worker.documents_count}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-2 py-0.5 border-b">
                                                            <span className="text-xs text-muted-foreground">Pending</span>
                                                            <span className="text-xs font-medium tabular-nums">{worker.pending_documents_count}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-2 py-0.5 border-b bg-green-50 dark:bg-green-950/20">
                                                            <span className="text-xs text-green-700 dark:text-green-400">Approved</span>
                                                            <span className="text-xs font-medium text-green-700 dark:text-green-400 tabular-nums">{worker.approved_documents_count}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-2 py-0.5 bg-red-50 dark:bg-red-950/20">
                                                            <span className="text-xs text-red-700 dark:text-red-400">Rejected</span>
                                                            <span className="text-xs font-medium text-red-700 dark:text-red-400 tabular-nums">{worker.rejected_documents_count}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-2">{new Date(worker.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="py-2">
                                                    <div className="flex gap-2 justify-end">
                                                        {worker.status === 'pending' && (
                                                            <>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => handleApprove(worker.id)}
                                                                    className="text-green-600 hover:text-green-700"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => handleReject(worker.id)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button asChild variant="outline" size="sm">
                                                            <a href={`/admin/workers/${worker.id}/documents`}>
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                Documents
                                                            </a>
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleDelete(worker.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No healthcare workers found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t px-6 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedWorkers.length)} of {sortedWorkers.length} workers
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                return page === 1 || 
                                                       page === totalPages || 
                                                       (page >= currentPage - 1 && page <= currentPage + 1);
                                            })
                                            .map((page, index, array) => (
                                                <div key={page} className="flex items-center">
                                                    {index > 0 && array[index - 1] !== page - 1 && (
                                                        <span className="px-2">...</span>
                                                    )}
                                                    <Button
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page)}
                                                        className="w-10"
                                                    >
                                                        {page}
                                                    </Button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
