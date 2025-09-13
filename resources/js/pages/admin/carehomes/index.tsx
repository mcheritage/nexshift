import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Building2, 
    Plus, 
    Eye, 
    Edit, 
    Trash2,
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

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
    created_at: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    documents_count: number;
    approved_documents_count: number;
}

interface Props {
    careHomes: CareHome[];
}

export default function CareHomesIndex({ careHomes }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        admin_first_name: '',
        admin_last_name: '',
        admin_email: '',
        admin_password: '',
    });

    const handleCreate = () => {
        router.post('/admin/carehomes', formData, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                setFormData({
                    name: '',
                    admin_first_name: '',
                    admin_last_name: '',
                    admin_email: '',
                    admin_password: '',
                });
            },
        });
    };

    const handleDelete = (careHomeId: string) => {
        if (confirm('Are you sure you want to delete this care home? This action cannot be undone.')) {
            router.delete(`/admin/carehomes/${careHomeId}`);
        }
    };

    const getCompletionPercentage = (careHome: CareHome) => {
        const totalRequired = 18; // Based on DocumentType::getAllRequired()
        return Math.round((careHome.approved_documents_count / totalRequired) * 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Care Homes Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Care Homes Management</h1>
                        <p className="text-muted-foreground">
                            Manage care homes and their administrators
                        </p>
                    </div>
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
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter care home name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin_first_name">Administrator First Name</Label>
                                    <Input
                                        id="admin_first_name"
                                        value={formData.admin_first_name}
                                        onChange={(e) => setFormData({ ...formData, admin_first_name: e.target.value })}
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin_last_name">Administrator Last Name</Label>
                                    <Input
                                        id="admin_last_name"
                                        value={formData.admin_last_name}
                                        onChange={(e) => setFormData({ ...formData, admin_last_name: e.target.value })}
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin_email">Administrator Email</Label>
                                    <Input
                                        id="admin_email"
                                        type="email"
                                        value={formData.admin_email}
                                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin_password">Administrator Password</Label>
                                    <Input
                                        id="admin_password"
                                        type="password"
                                        value={formData.admin_password}
                                        onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                                        placeholder="Enter password"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    Create Care Home
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Care Homes List */}
                <div className="grid gap-4">
                    {careHomes.map((careHome) => (
                        <Card key={careHome.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
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
                                        <div className="text-xs text-muted-foreground">
                                            {careHome.approved_documents_count} of 18 documents approved
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>Documents: {careHome.documents_count}</span>
                                        <span>Approved: {careHome.approved_documents_count}</span>
                                        <span>Created: {new Date(careHome.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/carehomes/${careHome.id}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/carehomes/${careHome.id}/documents`}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Documents
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleDelete(careHome.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {careHomes.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Care Homes Found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Get started by creating your first care home.
                            </p>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Care Home
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
