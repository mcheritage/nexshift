import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { 
    Building2, 
    Plus, 
    Eye, 
    Trash2,
    FileText,
    Download,
    Search,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Care Homes',
        href: '/admin/carehomes',
    },
];

interface CareHome {
    id: string;
    name: string;
    status: string;
    created_at: string;
    users: {
        id: string;
        name: string;
        email: string;
    }[];
    documents_count: number;
    approved_documents_count: number;
}

interface Props {
    careHomes: CareHome[];
}

export default function CareHomesIndex({ careHomes }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const form = useForm({ name: '', phone_number: '', admin_first_name: '', admin_last_name: '', admin_email: '', admin_phone_number: '', admin_password: '', admin_password_confirmation: '' });

    const filteredCareHomes = useMemo(() => {
        return careHomes.filter(careHome => {
            const searchLower = searchTerm.toLowerCase();
            return (
                careHome.name.toLowerCase().includes(searchLower) ||
                careHome.users.some(user => 
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower)
                )
            );
        });
    }, [careHomes, searchTerm]);

    const handleCreate = () => {
        form.post('/admin/carehomes', {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                form.reset();
            },
        });
    };

    const handleDelete = (careHomeId: string) => {
        if (confirm('Are you sure you want to delete this care home? This will also delete all associated users and documents.')) {
            router.delete(`/admin/carehomes/${careHomeId}`);
        }
    };

    const handleApprove = (careHomeId: string) => {
        if (confirm('Are you sure you want to approve this care home?')) {
            router.patch(`/admin/carehomes/${careHomeId}/approve`);
        }
    };

    const handleReject = (careHomeId: string) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            router.patch(`/admin/carehomes/${careHomeId}/reject`, { reason });
        }
    };

    const handleSuspend = (careHomeId: string) => {
        const reason = prompt('Please provide a reason for suspension:');
        if (reason) {
            router.patch(`/admin/carehomes/${careHomeId}/suspend`, { reason });
        }
    };

    const handleUnsuspend = (careHomeId: string) => {
        if (confirm('Are you sure you want to unsuspend this care home?')) {
            router.patch(`/admin/carehomes/${careHomeId}/unsuspend`);
        }
    };    const getCompletionPercentage = (careHome: CareHome) => {
        const totalRequired = 18; // Based on DocumentType::getAllRequired()
        return Math.round((careHome.approved_documents_count / totalRequired) * 100);
    };

    const handleExport = () => {
        const csvContent = [
            ['Care Home Name', 'Administrators', 'Emails', 'Total Documents', 'Approved Documents', 'Completion %', 'Created Date'],
            ...careHomes.map(careHome => [
                careHome.name,
                careHome.users.map(u => u.name).join('; '),
                careHome.users.map(u => u.email).join('; '),
                careHome.documents_count.toString(),
                careHome.approved_documents_count.toString(),
                getCompletionPercentage(careHome).toString() + '%',
                new Date(careHome.created_at).toLocaleDateString()
            ])
        ]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `care-homes-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Care Homes Management" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Care Homes</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage care homes and their administrators
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
                                    Add Care Home
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Care Home</DialogTitle>
                                <DialogDescription>
                                    Create a new care home and its administrator account.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Care Home Name</Label>
                                    <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Enter care home name" />
                                    {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone_number">Care Home Phone Number</Label>
                                    <Input id="phone_number" type="tel" value={form.data.phone_number} onChange={(e) => form.setData('phone_number', e.target.value)} placeholder="Enter phone number" />
                                    {form.errors.phone_number && <p className="text-xs text-red-500">{form.errors.phone_number}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="admin_first_name">Admin First Name</Label>
                                        <Input id="admin_first_name" value={form.data.admin_first_name} onChange={(e) => form.setData('admin_first_name', e.target.value)} placeholder="First name" />
                                        {form.errors.admin_first_name && <p className="text-xs text-red-500">{form.errors.admin_first_name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="admin_last_name">Admin Last Name</Label>
                                        <Input id="admin_last_name" value={form.data.admin_last_name} onChange={(e) => form.setData('admin_last_name', e.target.value)} placeholder="Last name" />
                                        {form.errors.admin_last_name && <p className="text-xs text-red-500">{form.errors.admin_last_name}</p>}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin_email">Admin Email</Label>
                                    <Input id="admin_email" type="email" value={form.data.admin_email} onChange={(e) => form.setData('admin_email', e.target.value)} placeholder="Enter email address" />
                                    {form.errors.admin_email && <p className="text-xs text-red-500">{form.errors.admin_email}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin_phone_number">Admin Phone Number</Label>
                                    <Input id="admin_phone_number" type="tel" value={form.data.admin_phone_number} onChange={(e) => form.setData('admin_phone_number', e.target.value)} placeholder="Enter phone number" />
                                    {form.errors.admin_phone_number && <p className="text-xs text-red-500">{form.errors.admin_phone_number}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin_password">Admin Password</Label>
                                    <Input id="admin_password" type="password" value={form.data.admin_password} onChange={(e) => form.setData('admin_password', e.target.value)} placeholder="Enter password" />
                                    {form.errors.admin_password && <p className="text-xs text-red-500">{form.errors.admin_password}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin_password_confirmation">Confirm Password</Label>
                                    <Input id="admin_password_confirmation" type="password" value={form.data.admin_password_confirmation} onChange={(e) => form.setData('admin_password_confirmation', e.target.value)} placeholder="Confirm password" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); form.clearErrors(); }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate} disabled={form.processing}>
                                    {form.processing ? 'Creating...' : 'Create Care Home'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name, administrator..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Care Homes Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Care Home</TableHead>
                                    <TableHead>Administrator</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total Documents</TableHead>
                                    <TableHead>Approved Documents</TableHead>
                                    <TableHead>Completion</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCareHomes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="flex flex-col items-center">
                                                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Care Homes Found</h3>
                                                <p className="text-muted-foreground">
                                                    {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first care home.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCareHomes.map((careHome) => (
                                        <TableRow key={careHome.id}>
                                            <TableCell>
                                                <a
                                                    href={`/admin/carehomes/${careHome.id}`}
                                                    className="flex items-center gap-2 font-medium hover:underline"
                                                >
                                                    <Building2 className="h-4 w-4" />
                                                    <span>{careHome.name}</span>
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {careHome.users.length > 0 ? (
                                                        careHome.users.map((user, index) => (
                                                            <div key={user.id}>
                                                                <div className="font-medium">{user.name}</div>
                                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                                                {index < careHome.users.length - 1 && (
                                                                    <div className="h-2" />
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">No administrator</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={
                                                        careHome.status === 'approved' ? 'default' : 
                                                        careHome.status === 'pending' ? 'secondary' : 
                                                        careHome.status === 'suspended' ? 'secondary' :
                                                        'destructive'
                                                    }
                                                    className={
                                                        careHome.status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                                                        careHome.status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                                        careHome.status === 'suspended' ? 'bg-orange-600 hover:bg-orange-700' :
                                                        'bg-red-600 hover:bg-red-700'
                                                    }
                                                >
                                                    {careHome.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                    {careHome.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                                    {careHome.status === 'suspended' && <XCircle className="h-3 w-3 mr-1" />}
                                                    {careHome.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                                    {careHome.status.charAt(0).toUpperCase() + careHome.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{careHome.documents_count}</TableCell>
                                            <TableCell>
                                                <span className="text-green-600 font-medium">
                                                    {careHome.approved_documents_count} / 18
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full"
                                                            style={{ width: `${getCompletionPercentage(careHome)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{getCompletionPercentage(careHome)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(careHome.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 justify-end">
                                                    {careHome.status === 'pending' && (
                                                        <>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleApprove(careHome.id)}
                                                                className="text-green-600 hover:text-green-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleReject(careHome.id)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {careHome.status === 'approved' && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleSuspend(careHome.id)}
                                                            className="text-orange-600 hover:text-orange-700"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Suspend
                                                        </Button>
                                                    )}
                                                    {careHome.status === 'suspended' && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleUnsuspend(careHome.id)}
                                                            className="text-green-600 hover:text-green-700"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Unsuspend
                                                        </Button>
                                                    )}
                                                    <Button asChild variant="outline" size="sm">
                                                        <a href={`/admin/carehomes/${careHome.id}/documents`}>
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Documents
                                                        </a>
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDelete(careHome.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
