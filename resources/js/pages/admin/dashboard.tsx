import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Building2,
    Clock,
    AlertTriangle,
    UserCheck,
    ChevronRight,
    Plus,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
];

interface Stats {
    total_care_homes: number;
    pending_care_homes: number;
    health_care_workers: number;
    pending_workers: number;
    pending_documents: number;
    requires_attention_documents: number;
}

interface RecentDocument {
    id: number;
    original_name: string;
    status: string;
    care_home?: { id: string; name: string } | null;
    user?: { id: string; first_name: string; last_name: string } | null;
}

interface RecentCareHome {
    id: string;
    name: string;
    status: string;
    users: Array<{ id: string; name: string }>;
}

interface RecentUser {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
    care_home?: { id: string; name: string };
}

interface Props {
    stats: Stats;
    recentDocuments: RecentDocument[];
    recentCareHomes: RecentCareHome[];
    recentUsers: RecentUser[];
}

const documentStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    requires_attention: 'bg-orange-100 text-orange-800',
};

const entityStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-gray-100 text-gray-800',
};

interface StatCardAction {
    label: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'outline';
    href?: string;
    onClick?: () => void;
}

interface StatCardProps {
    title: string;
    description: string;
    value: number;
    href: string;
    icon: React.ReactNode;
    valueColor?: string;
    urgent?: boolean;
    actions?: StatCardAction[];
}

function StatCard({ title, description, value, href, icon, valueColor = 'text-gray-900 dark:text-white', urgent = false, actions }: StatCardProps) {
    return (
        <Card className={`h-full transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 ${urgent && value > 0 ? 'border-orange-200 dark:border-orange-800' : ''}`}>
            <Link href={href} className="block group">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
                        <CardDescription className="text-xs">{description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        {icon}
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
                </CardContent>
            </Link>
            {actions && actions.length > 0 && (
                <div className="px-6 pb-6 flex gap-2">
                    {actions.map((action, i) =>
                        action.href ? (
                            <Button key={i} asChild variant={action.variant ?? 'default'} size="sm">
                                <Link href={action.href}>
                                    {action.icon}{action.label}
                                </Link>
                            </Button>
                        ) : (
                            <Button key={i} variant={action.variant ?? 'default'} size="sm" onClick={action.onClick}>
                                {action.icon}{action.label}
                            </Button>
                        )
                    )}
                </div>
            )}
        </Card>
    );
}

export default function AdminDashboard({ stats, recentDocuments, recentCareHomes, recentUsers }: Props) {
    const [careHomeDialogOpen, setCareHomeDialogOpen] = useState(false);
    const [workerDialogOpen, setWorkerDialogOpen] = useState(false);

    const careHomeForm = useForm({ name: '', phone_number: '', admin_first_name: '', admin_last_name: '', admin_email: '', admin_phone_number: '', admin_password: '', admin_password_confirmation: '' });
    const workerForm = useForm({ first_name: '', last_name: '', email: '', phone_number: '', password: '', password_confirmation: '', gender: '' });

    const handleCreateCareHome = () => {
        careHomeForm.post('/admin/carehomes', {
            onSuccess: () => {
                setCareHomeDialogOpen(false);
                careHomeForm.reset();
            },
        });
    };

    const handleCreateWorker = () => {
        workerForm.post('/admin/healthcare-workers', {
            onSuccess: () => {
                setWorkerDialogOpen(false);
                workerForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Overview of care homes, health care workers, and documents
                    </p>
                </div>

                {/* Overview Stats */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Overview</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <StatCard
                            title="Total Care Homes"
                            description="All registered care homes"
                            value={stats.total_care_homes}
                            href="/admin/carehomes"
                            icon={<Building2 className="h-4 w-4" />}
                            actions={[
                                { label: 'View All', href: '/admin/carehomes' },
                                { label: 'Add New', variant: 'outline', icon: <Plus className="h-3 w-3 mr-1" />, onClick: () => setCareHomeDialogOpen(true) },
                            ]}
                        />
                        <StatCard
                            title="Health Care Workers"
                            description="All registered health care workers"
                            value={stats.health_care_workers}
                            href="/admin/healthcare-workers"
                            icon={<UserCheck className="h-4 w-4" />}
                            actions={[
                                { label: 'View All', href: '/admin/healthcare-workers' },
                                { label: 'Add New', variant: 'outline', icon: <Plus className="h-3 w-3 mr-1" />, onClick: () => setWorkerDialogOpen(true) },
                            ]}
                        />
                    </div>
                </div>

                {/* Pending Actions */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Needs Action</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Pending Care Homes"
                            description="Care homes awaiting approval"
                            value={stats.pending_care_homes}
                            href="/admin/carehomes?status=pending"
                            icon={<Building2 className="h-4 w-4 text-yellow-600" />}
                            valueColor={stats.pending_care_homes > 0 ? 'text-yellow-600' : 'text-gray-900 dark:text-white'}
                            urgent
                        />
                        <StatCard
                            title="Pending Workers"
                            description="Health care workers awaiting approval"
                            value={stats.pending_workers}
                            href="/admin/healthcare-workers?status=pending"
                            icon={<UserCheck className="h-4 w-4 text-yellow-600" />}
                            valueColor={stats.pending_workers > 0 ? 'text-yellow-600' : 'text-gray-900 dark:text-white'}
                            urgent
                        />
                        <StatCard
                            title="Pending Documents"
                            description="Documents awaiting review"
                            value={stats.pending_documents}
                            href="/admin/documents?status=pending"
                            icon={<Clock className="h-4 w-4 text-yellow-600" />}
                            valueColor={stats.pending_documents > 0 ? 'text-yellow-600' : 'text-gray-900 dark:text-white'}
                            urgent
                        />
                        <StatCard
                            title="Documents Needing Attention"
                            description="Documents flagged for re-submission"
                            value={stats.requires_attention_documents}
                            href="/admin/documents?status=requires_attention"
                            icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
                            valueColor={stats.requires_attention_documents > 0 ? 'text-orange-600' : 'text-gray-900 dark:text-white'}
                            urgent
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Recent Activity</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base">Recent Documents</CardTitle>
                                    <CardDescription>Latest uploads and status changes</CardDescription>
                                </div>
                                <Link href="/admin/documents" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                                    View all <ChevronRight className="h-3 w-3" />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentDocuments.slice(0, 5).map((doc) => (
                                        <Link key={doc.id} href="/admin/documents" className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1 rounded transition-colors">
                                            <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                                                <p className="text-sm font-medium truncate">{doc.original_name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {doc.care_home?.name || (doc.user ? `${doc.user.first_name} ${doc.user.last_name}` : 'Unknown')}
                                                </p>
                                            </div>
                                            <Badge className={`shrink-0 text-xs ${documentStatusColors[doc.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                                {doc.status.replace('_', ' ')}
                                            </Badge>
                                        </Link>
                                    ))}
                                    {recentDocuments.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">No documents yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base">Recent Care Homes</CardTitle>
                                    <CardDescription>Newly registered care homes</CardDescription>
                                </div>
                                <Link href="/admin/carehomes" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                                    View all <ChevronRight className="h-3 w-3" />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentCareHomes.slice(0, 5).map((careHome) => (
                                        <Link key={careHome.id} href={`/admin/carehomes/${careHome.id}`} className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1 rounded transition-colors">
                                            <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                                                <p className="text-sm font-medium truncate">{careHome.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {careHome.users?.length > 0 ? careHome.users.map(u => u.name).join(', ') : 'No admins'}
                                                </p>
                                            </div>
                                            <Badge className={`shrink-0 text-xs ${entityStatusColors[careHome.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                                {careHome.status}
                                            </Badge>
                                        </Link>
                                    ))}
                                    {recentCareHomes.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">No care homes yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base">Recent Workers</CardTitle>
                                    <CardDescription>Newly registered health care workers</CardDescription>
                                </div>
                                <Link href="/admin/healthcare-workers" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                                    View all <ChevronRight className="h-3 w-3" />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentUsers.slice(0, 5).map((user) => (
                                        <Link key={user.id} href={`/admin/healthcare-workers/${user.id}`} className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1 rounded transition-colors">
                                            <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                                                <p className="text-sm font-medium truncate">{user.first_name} {user.last_name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {user.care_home?.name ?? 'No care home'}
                                                </p>
                                            </div>
                                            <Badge className={`shrink-0 text-xs ${entityStatusColors[user.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                                {user.status}
                                            </Badge>
                                        </Link>
                                    ))}
                                    {recentUsers.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">No workers yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Create Care Home Dialog */}
            <Dialog open={careHomeDialogOpen} onOpenChange={(open) => { setCareHomeDialogOpen(open); if (!open) careHomeForm.clearErrors(); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Care Home</DialogTitle>
                        <DialogDescription>Create a new care home and its administrator account.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="ch-name">Care Home Name</Label>
                            <Input id="ch-name" value={careHomeForm.data.name} onChange={(e) => careHomeForm.setData('name', e.target.value)} placeholder="Enter care home name" />
                            {careHomeForm.errors.name && <p className="text-xs text-red-500">{careHomeForm.errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ch-phone">Care Home Phone Number</Label>
                            <Input id="ch-phone" type="tel" value={careHomeForm.data.phone_number} onChange={(e) => careHomeForm.setData('phone_number', e.target.value)} placeholder="Enter phone number" />
                            {careHomeForm.errors.phone_number && <p className="text-xs text-red-500">{careHomeForm.errors.phone_number}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="ch-admin-first">Admin First Name</Label>
                                <Input id="ch-admin-first" value={careHomeForm.data.admin_first_name} onChange={(e) => careHomeForm.setData('admin_first_name', e.target.value)} placeholder="First name" />
                                {careHomeForm.errors.admin_first_name && <p className="text-xs text-red-500">{careHomeForm.errors.admin_first_name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ch-admin-last">Admin Last Name</Label>
                                <Input id="ch-admin-last" value={careHomeForm.data.admin_last_name} onChange={(e) => careHomeForm.setData('admin_last_name', e.target.value)} placeholder="Last name" />
                                {careHomeForm.errors.admin_last_name && <p className="text-xs text-red-500">{careHomeForm.errors.admin_last_name}</p>}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ch-admin-email">Admin Email</Label>
                            <Input id="ch-admin-email" type="email" value={careHomeForm.data.admin_email} onChange={(e) => careHomeForm.setData('admin_email', e.target.value)} placeholder="Enter email address" />
                            {careHomeForm.errors.admin_email && <p className="text-xs text-red-500">{careHomeForm.errors.admin_email}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ch-admin-phone">Admin Phone Number</Label>
                            <Input id="ch-admin-phone" type="tel" value={careHomeForm.data.admin_phone_number} onChange={(e) => careHomeForm.setData('admin_phone_number', e.target.value)} placeholder="Enter phone number" />
                            {careHomeForm.errors.admin_phone_number && <p className="text-xs text-red-500">{careHomeForm.errors.admin_phone_number}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ch-admin-password">Admin Password</Label>
                            <Input id="ch-admin-password" type="password" value={careHomeForm.data.admin_password} onChange={(e) => careHomeForm.setData('admin_password', e.target.value)} placeholder="Enter password" />
                            {careHomeForm.errors.admin_password && <p className="text-xs text-red-500">{careHomeForm.errors.admin_password}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ch-admin-password-confirm">Confirm Password</Label>
                            <Input id="ch-admin-password-confirm" type="password" value={careHomeForm.data.admin_password_confirmation} onChange={(e) => careHomeForm.setData('admin_password_confirmation', e.target.value)} placeholder="Confirm password" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCareHomeDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCareHome} disabled={careHomeForm.processing}>
                            {careHomeForm.processing ? 'Creating...' : 'Create Care Home'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Worker Dialog */}
            <Dialog open={workerDialogOpen} onOpenChange={(open) => { setWorkerDialogOpen(open); if (!open) workerForm.clearErrors(); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Health Care Worker</DialogTitle>
                        <DialogDescription>Create a new health care worker account.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="w-first">First Name</Label>
                                <Input id="w-first" value={workerForm.data.first_name} onChange={(e) => workerForm.setData('first_name', e.target.value)} placeholder="First name" />
                                {workerForm.errors.first_name && <p className="text-xs text-red-500">{workerForm.errors.first_name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="w-last">Last Name</Label>
                                <Input id="w-last" value={workerForm.data.last_name} onChange={(e) => workerForm.setData('last_name', e.target.value)} placeholder="Last name" />
                                {workerForm.errors.last_name && <p className="text-xs text-red-500">{workerForm.errors.last_name}</p>}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="w-email">Email</Label>
                            <Input id="w-email" type="email" value={workerForm.data.email} onChange={(e) => workerForm.setData('email', e.target.value)} placeholder="Enter email address" />
                            {workerForm.errors.email && <p className="text-xs text-red-500">{workerForm.errors.email}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="w-phone">Phone Number</Label>
                            <Input id="w-phone" type="tel" value={workerForm.data.phone_number} onChange={(e) => workerForm.setData('phone_number', e.target.value)} placeholder="Enter phone number" />
                            {workerForm.errors.phone_number && <p className="text-xs text-red-500">{workerForm.errors.phone_number}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="w-gender">Gender</Label>
                            <Select value={workerForm.data.gender} onValueChange={(v) => workerForm.setData('gender', v)}>
                                <SelectTrigger id="w-gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {workerForm.errors.gender && <p className="text-xs text-red-500">{workerForm.errors.gender}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="w-password">Password</Label>
                            <Input id="w-password" type="password" value={workerForm.data.password} onChange={(e) => workerForm.setData('password', e.target.value)} placeholder="Enter password" />
                            {workerForm.errors.password && <p className="text-xs text-red-500">{workerForm.errors.password}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="w-password-confirm">Confirm Password</Label>
                            <Input id="w-password-confirm" type="password" value={workerForm.data.password_confirmation} onChange={(e) => workerForm.setData('password_confirmation', e.target.value)} placeholder="Confirm password" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setWorkerDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateWorker} disabled={workerForm.processing}>
                            {workerForm.processing ? 'Creating...' : 'Create Worker'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
