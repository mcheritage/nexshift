import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    Search
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
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        care_home_id: '',
        gender: '',
    });

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
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Documents</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredWorkers.length > 0 ? (
                                        filteredWorkers.map((worker) => (
                                            <TableRow key={worker.id}>
                                                <TableCell>
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
                                                <TableCell>{worker.email}</TableCell>
                                                <TableCell className="capitalize">{worker.gender}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{worker.documents_count} Total</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 text-xs">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {worker.pending_documents_count} Pending
                                                            </Badge>
                                                            <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                                                                {worker.approved_documents_count} Approved
                                                            </Badge>
                                                            <Badge variant="destructive" className="text-xs">
                                                                {worker.rejected_documents_count} Rejected
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{new Date(worker.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 justify-end">
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
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No healthcare workers found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
