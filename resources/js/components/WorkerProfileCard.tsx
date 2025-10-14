import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    MessageSquare,
    Eye
} from 'lucide-react';
import { useState } from 'react';

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

interface WorkerProfileCardProps {
    application: Application;
    shiftStatus: string;
    onAccept: (applicationId: string) => void;
    onReject: (applicationId: string) => void;
    onViewProfile: (application: Application) => void;
    isRejecting?: boolean;
    rejectionReason?: string;
    onRejectionReasonChange?: (reason: string) => void;
}

export default function WorkerProfileCard({ 
    application, 
    shiftStatus, 
    onAccept, 
    onReject, 
    onViewProfile,
    isRejecting,
    rejectionReason,
    onRejectionReasonChange
}: WorkerProfileCardProps) {
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
            console.error('Error formatting date:', error);
            return dateTimeString;
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'accepted': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'withdrawn': 'bg-gray-100 text-gray-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
        <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Header with photo and basic info */}
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            {worker.profile_photo ? (
                                <img 
                                    src={worker.profile_photo} 
                                    alt={`${worker.first_name} ${worker.last_name}`}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {worker.first_name} {worker.last_name}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        <Mail className="h-4 w-4 mr-1" />
                                        {worker.email}
                                    </div>
                                    {worker.phone_number && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                                            <Phone className="h-4 w-4 mr-1" />
                                            {worker.phone_number}
                                        </div>
                                    )}
                                </div>
                                
                                {application.status !== 'pending' && (
                                    <Badge className={getStatusColor(application.status)}>
                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Experience and rate info */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                            <Award className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{getExperienceLevel(worker.years_experience)}</span>
                        </div>
                        
                        {worker.years_experience && (
                            <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                                <span>{worker.years_experience} years exp.</span>
                            </div>
                        )}
                        
                        {(worker.hourly_rate_min || worker.hourly_rate_max) && (
                            <div className="flex items-center text-gray-600">
                                <span className="font-medium">Rate:</span>
                                <span className="ml-1">
                                    £{worker.hourly_rate_min || '?'}-{worker.hourly_rate_max || '?'}/hr
                                </span>
                            </div>
                        )}
                        
                        <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-purple-500" />
                            <span>Applied {formatDateTime(application.applied_at)}</span>
                        </div>
                    </div>

                    {/* Skills and qualifications */}
                    {(worker.skills && worker.skills.length > 0) && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {worker.skills.slice(0, 6).map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                                {worker.skills.length > 6 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{worker.skills.length - 6} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Qualifications */}
                    {(worker.qualifications && worker.qualifications.length > 0) && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Qualifications</h4>
                            <div className="space-y-1">
                                {worker.qualifications.slice(0, 3).map((qualification, index) => (
                                    <div key={index} className="flex items-center text-sm text-gray-600">
                                        <Star className="h-3 w-3 mr-2 text-yellow-500" />
                                        {qualification}
                                    </div>
                                ))}
                                {worker.qualifications.length > 3 && (
                                    <div className="text-xs text-gray-500">
                                        +{worker.qualifications.length - 3} more qualifications
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Application message */}
                    {application.message && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Cover Message
                            </div>
                            <p className="text-sm text-gray-600">{application.message}</p>
                        </div>
                    )}

                    {/* Review notes (for rejected applications) */}
                    {application.review_notes && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                                Review Notes
                            </h4>
                            <p className="text-sm text-red-600">{application.review_notes}</p>
                            {application.reviewed_at && (
                                <p className="text-xs text-red-500 mt-2">
                                    Reviewed {formatDateTime(application.reviewed_at)}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Rejection form */}
                    {isRejecting && (
                        <div className="border-t pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason *
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => onRejectionReasonChange?.(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
                                rows={3}
                            />
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <Button
                            onClick={() => onViewProfile(application)}
                            variant="outline"
                            size="sm"
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            View Full Profile
                        </Button>
                        
                        {application.status === 'pending' && shiftStatus !== 'filled' && (
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => onAccept(application.id)}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accept
                                </Button>
                                <Button
                                    onClick={() => onReject(application.id)}
                                    variant="destructive"
                                    size="sm"
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                </Button>
                            </div>
                        )}
                        
                        {shiftStatus === 'filled' && application.status === 'pending' && (
                            <Badge variant="secondary" className="text-xs">
                                Position filled
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}