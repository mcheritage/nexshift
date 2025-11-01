import { Head, Link, useForm, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    ArrowLeft, 
    User, 
    Calendar, 
    CheckCircle, 
    XCircle, 
    Clock,
    MessageSquare,
    Search,
    Filter,
    Users
} from 'lucide-react';
import { useState } from 'react';
import WorkerProfileCard from '@/components/WorkerProfileCard';
import WorkerProfileModal from '@/components/WorkerProfileModal';

interface Worker {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    bio?: string;
    qualifications?: string[];
    certifications?: string[];
    years_experience?: number;
    skills?: string[];
    profile_photo?: string;
    hourly_rate_min?: number;
    hourly_rate_max?: number;
    available_weekends?: boolean;
    available_nights?: boolean;
    additional_notes?: string;
}

interface Application {
    id: string;
    status: string;
    message?: string;
    applied_at: string;
    reviewed_at?: string;
    review_notes?: string;
    worker: Worker;
}

interface Shift {
    id: string;
    title: string;
    role: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    location: string;
    hourly_rate: number;
    status: string;
    selected_worker_id?: string;
    applications?: Application[];
}

interface ApplicationsIndexProps extends SharedData {
    shift: Shift;
    applications: Application[];
}

const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'withdrawn': 'bg-gray-100 text-gray-800',
};

const roleLabels = {
    'registered_nurse': 'Registered Nurse',
    'healthcare_assistant': 'Healthcare Assistant',
    'support_worker': 'Support Worker',
    'senior_care_worker': 'Senior Care Worker',
    'night_shift_worker': 'Night Shift Worker',
    'domestic_staff': 'Domestic Staff',
    'kitchen_staff': 'Kitchen Staff',
    'maintenance_staff': 'Maintenance Staff'
};

export default function ApplicationsIndex({ shift, applications }: ApplicationsIndexProps) {
    const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [experienceFilter, setExperienceFilter] = useState('all');
    const [selectedProfileApplication, setSelectedProfileApplication] = useState<Application | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    const { patch } = useForm();
    const rejectForm = useForm({
        review_notes: ''
    });

    const handleAccept = (applicationId: string) => {
        patch(`/applications/${applicationId}/accept`);
    };

    const handleReject = (applicationId: string) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        
        // Use router.patch directly with explicit data
        router.patch(`/applications/${applicationId}/reject`, {
            review_notes: rejectionReason
        }, {
            onSuccess: () => {
                setSelectedApplication(null);
                setRejectionReason('');
            },
            onError: (errors) => {
                console.error('Rejection failed:', errors);
            }
        });
    };

    const handleViewProfile = (application: Application) => {
        setSelectedProfileApplication(application);
        setIsProfileModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedProfileApplication(null);
    };

    const handleRejectFromModal = (applicationId: string) => {
        setSelectedApplication(applicationId);
        handleCloseProfileModal();
    };

    // Filter applications based on search and filters
    const filteredApplications = applications.filter(application => {
        const { worker } = application;
        const fullName = `${worker.first_name} ${worker.last_name}`.toLowerCase();
        const matchesSearch = searchTerm === '' || 
            fullName.includes(searchTerm.toLowerCase()) ||
            worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (worker.skills && worker.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));

        const matchesExperience = experienceFilter === 'all' || 
            (experienceFilter === 'entry' && (!worker.years_experience || worker.years_experience < 1)) ||
            (experienceFilter === 'junior' && worker.years_experience && worker.years_experience >= 1 && worker.years_experience < 3) ||
            (experienceFilter === 'mid' && worker.years_experience && worker.years_experience >= 3 && worker.years_experience < 5) ||
            (experienceFilter === 'senior' && worker.years_experience && worker.years_experience >= 5);

        return matchesSearch && matchesExperience;
    });

    const isShiftFilled = shift.status === 'filled';

    const formatDateTime = (dateTimeString: string) => {
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateTimeString;
        }
    };

    const pendingApplications = filteredApplications.filter(app => app.status === 'pending');
    const reviewedApplications = filteredApplications.filter(app => app.status !== 'pending');

    return (
        <AppLayout>
            <Head title={`Applications - ${shift.title}`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    <Link href={`/shifts/${shift.id}`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Shift
                        </Button>
                    </Link>
                    
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Applications</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Review applications for "{shift.title}"
                        </p>
                    </div>
                </div>

                {/* Shift Status Banner */}
                {shift.status === 'filled' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            <div>
                                <p className="font-medium text-green-800">Position Filled</p>
                                <p className="text-sm text-green-700">
                                    This shift has been filled and is no longer accepting new applications.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shift Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shift Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Role:</span>
                                <div>{roleLabels[shift.role as keyof typeof roleLabels] || shift.role}</div>
                            </div>
                            <div>
                                <span className="font-medium">Date & Time:</span>
                                <div>{shift.shift_date} • {shift.start_time} - {shift.end_time}</div>
                            </div>
                            <div>
                                <span className="font-medium">Location:</span>
                                <div>{shift.location}</div>
                            </div>
                            <div>
                                <span className="font-medium">Rate:</span>
                                <div>£{shift.hourly_rate}/hour</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Search and Filter Section */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name, email, or skills..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <select
                                    value={experienceFilter}
                                    onChange={(e) => setExperienceFilter(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="all">All Experience Levels</option>
                                    <option value="entry">Entry Level (&lt;1 year)</option>
                                    <option value="junior">Junior (1-3 years)</option>
                                    <option value="mid">Mid-level (3-5 years)</option>
                                    <option value="senior">Senior (5+ years)</option>
                                </select>
                            </div>
                        </div>
                        
                        {(searchTerm || experienceFilter !== 'all') && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                Showing {filteredApplications.length} of {applications.length} applications
                                {filteredApplications.length !== applications.length && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setExperienceFilter('all');
                                        }}
                                        className="text-blue-600 hover:text-blue-800 p-1 h-auto"
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Applications Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</div>
                            <div className="text-sm text-gray-600">Pending Review</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {applications.filter(app => app.status === 'accepted').length}
                            </div>
                            <div className="text-sm text-gray-600">Accepted</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-gray-600">{applications.length}</div>
                            <div className="text-sm text-gray-600">Total Applications</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Applications */}
                {pendingApplications.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Pending Applications ({pendingApplications.length})
                            </h2>
                        </div>
                        
                        <div className="space-y-4">
                            {pendingApplications.map(application => (
                                <div key={application.id} className="space-y-4">
                                    <WorkerProfileCard
                                        application={application}
                                        shiftStatus={shift.status}
                                        onAccept={handleAccept}
                                        onReject={() => setSelectedApplication(application.id)}
                                        onViewProfile={handleViewProfile}
                                        isRejecting={selectedApplication === application.id}
                                        rejectionReason={rejectionReason}
                                        onRejectionReasonChange={setRejectionReason}
                                    />
                                    
                                    {/* Rejection confirmation */}
                                    {selectedApplication === application.id && (
                                        <Card className="border-red-200">
                                            <CardContent className="p-4">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        onClick={() => handleReject(application.id)}
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        Confirm Rejection
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedApplication(null);
                                                            setRejectionReason('');
                                                        }}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviewed Applications */}
                {reviewedApplications.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Reviewed Applications ({reviewedApplications.length})
                            </h2>
                        </div>
                        
                        <div className="space-y-4">
                            {reviewedApplications.map(application => (
                                <WorkerProfileCard
                                    key={application.id}
                                    application={application}
                                    shiftStatus={shift.status}
                                    onAccept={handleAccept}
                                    onReject={() => setSelectedApplication(application.id)}
                                    onViewProfile={handleViewProfile}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {filteredApplications.length === 0 && applications.length > 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Applications Match Your Filters
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Try adjusting your search terms or filters to see more applications.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {applications.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Applications Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                This shift hasn't received any applications yet. 
                                Healthcare workers will be able to apply once the shift is published.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Worker Profile Modal */}
            <WorkerProfileModal
                isOpen={isProfileModalOpen}
                onClose={handleCloseProfileModal}
                application={selectedProfileApplication}
                onAccept={handleAccept}
                onReject={handleRejectFromModal}
                shiftStatus={shift.status}
            />
        </AppLayout>
    );
}