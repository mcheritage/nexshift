import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    UserCheck, 
    Plus, 
    Eye, 
    Edit, 
    Trash2,
    Building2
} from 'lucide-react';
import { useState } from 'react';

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
    care_home: {
        id: string;
        name: string;
    };
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
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        care_home_id: '',
        gender: '',
    });

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Health Care Workers Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Health Care Workers</h1>
                        <p className="text-muted-foreground">
                            Manage health care workers across all care homes
                        </p>
                    </div>
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
                                    <Label htmlFor="care_home_id">Care Home</Label>
                                    <Select value={formData.care_home_id} onValueChange={(value) => setFormData({ ...formData, care_home_id: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select care home" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {careHomes.map((careHome) => (
                                                <SelectItem key={careHome.id} value={careHome.id}>
                                                    {careHome.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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

                {/* Health Care Workers List */}
                <div className="grid gap-4">
                    {healthCareWorkers.map((worker) => (
                        <Card key={worker.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserCheck className="h-5 w-5" />
                                            {worker.first_name} {worker.last_name}
                                        </CardTitle>
                                        <CardDescription>
                                            {worker.email} • {worker.gender}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">
                                        Health Care Worker
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Building2 className="h-4 w-4" />
                                            <span>{worker.care_home.name}</span>
                                        </div>
                                        <span>Joined: {new Date(worker.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/healthcare-workers/${worker.id}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleDelete(worker.id)}
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

                {healthCareWorkers.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Health Care Workers Found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Get started by adding health care workers to care homes.
                            </p>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Worker
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
