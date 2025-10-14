import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    User, 
    Phone, 
    Mail, 
    Calendar, 
    Award, 
    Star,
    Clock,
    CheckCircle,
    XCircle,
    MapPin,
    FileText
} from 'lucide-react';

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

interface WorkerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: Application | null;
    onAccept?: (applicationId: string) => void;
    onReject?: (applicationId: string) => void;
    shiftStatus?: string;
}

export default function WorkerProfileModal({ 
    isOpen, 
    onClose, 
    application,
    onAccept,
    onReject,
    shiftStatus 
}: WorkerProfileModalProps) {
    if (!application) return null;

    const { worker } = application;
    
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
            return dateTimeString;
        }
    };

    const getExperienceLevel = (years?: number) => {
        if (!years) return 'Not specified';
        if (years < 1) return 'Entry level';
        if (years < 3) return 'Junior';
        if (years < 5) return 'Mid-level';
        if (years < 10) return 'Senior';
        return 'Expert';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="w-[85vw] max-w-none h-[85vh] overflow-y-auto p-6"
                style={{
                    width: '85vw',
                    maxWidth: '85vw',
                    height: '85vh',
                    margin: 'auto'
                }}
            >
                <DialogHeader>
                    <DialogTitle>Worker Profile</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            {worker.profile_photo ? (
                                <img 
                                    src={worker.profile_photo} 
                                    alt={`${worker.first_name} ${worker.last_name}`}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                                    <User className="h-12 w-12 text-gray-400" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {worker.first_name} {worker.last_name}
                            </h2>
                            
                            <div className="space-y-2 mt-3">
                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {worker.email}
                                </div>
                                {worker.phone_number && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {worker.phone_number}
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center">
                                    <Award className="h-4 w-4 mr-2 text-blue-500" />
                                    <span className="text-sm text-gray-600">
                                        {getExperienceLevel(worker.years_experience)}
                                    </span>
                                </div>
                                {worker.years_experience && (
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-green-500" />
                                        <span className="text-sm text-gray-600">
                                            {worker.years_experience} years experience
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    {worker.bio && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                About
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {worker.bio}
                            </p>
                        </div>
                    )}

                    {/* Rate and Availability */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Rate Information */}
                        {(worker.hourly_rate_min || worker.hourly_rate_max) && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Rate Information</h3>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        £{worker.hourly_rate_min || '?'} - £{worker.hourly_rate_max || '?'}
                                    </div>
                                    <div className="text-sm text-green-600 dark:text-green-400">per hour</div>
                                </div>
                            </div>
                        )}

                        {/* Availability */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Availability</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Weekend shifts</span>
                                    <Badge variant={worker.available_weekends ? "default" : "secondary"}>
                                        {worker.available_weekends ? 'Available' : 'Not available'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Night shifts</span>
                                    <Badge variant={worker.available_nights ? "default" : "secondary"}>
                                        {worker.available_nights ? 'Available' : 'Not available'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    {worker.skills && worker.skills.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Skills & Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {worker.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Qualifications Section */}
                    {worker.qualifications && worker.qualifications.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Qualifications</h3>
                            <div className="space-y-2">
                                {worker.qualifications.map((qualification, index) => (
                                    <div key={index} className="flex items-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                        <Star className="h-4 w-4 mr-3 text-blue-500" />
                                        <span className="text-gray-700 dark:text-gray-300">{qualification}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications Section */}
                    {worker.certifications && worker.certifications.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Certifications</h3>
                            <div className="space-y-2">
                                {worker.certifications.map((certification, index) => (
                                    <div key={index} className="flex items-center bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                        <Award className="h-4 w-4 mr-3 text-green-500" />
                                        <span className="text-gray-700 dark:text-gray-300">{certification}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Application Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Application Details</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <Clock className="h-4 w-4 mr-2" />
                                Applied on {formatDateTime(application.applied_at)}
                            </div>
                            
                            {application.message && (
                                <div>
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Message:</h4>
                                    <p className="text-gray-600 dark:text-gray-400">{application.message}</p>
                                </div>
                            )}
                            
                            {application.review_notes && (
                                <div>
                                    <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">Review Notes:</h4>
                                    <p className="text-red-600 dark:text-red-400">{application.review_notes}</p>
                                    {application.reviewed_at && (
                                        <p className="text-xs text-red-500 mt-2">
                                            Reviewed on {formatDateTime(application.reviewed_at)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    {worker.additional_notes && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Additional Notes</h3>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <p className="text-gray-700 dark:text-gray-300">{worker.additional_notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {application.status === 'pending' && shiftStatus !== 'filled' && onAccept && onReject && (
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button
                                onClick={() => onReject(application.id)}
                                variant="destructive"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Application
                            </Button>
                            <Button
                                onClick={() => onAccept(application.id)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Application
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}