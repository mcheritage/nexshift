import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, MapPin, Coins, Users, AlertTriangle, Plus, X } from 'lucide-react';
import { ROLE_OPTIONS } from '@/constants/roles';

interface CreateShiftProps extends SharedData {}

const commonSkills = [
    'Medication Administration',
    'Dementia Care',
    'Manual Handling',
    'First Aid',
    'End of Life Care',
    'Infection Control',
    'Personal Care',
    'Wound Care',
    'Catheter Care',
    'Diabetes Management',
    'Mental Health Support',
    'Moving and Handling'
];

// Generate hour options (0-23)
const generateHourOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        const hourString = hour.toString().padStart(2, '0');
        options.push({ 
            value: hourString, 
            label: hourString 
        });
    }
    return options;
};

// Generate minute options (0-59)
const generateMinuteOptions = () => {
    const options = [];
    for (let minute = 0; minute < 60; minute++) {
        const minuteString = minute.toString().padStart(2, '0');
        options.push({ 
            value: minuteString, 
            label: minuteString 
        });
    }
    return options;
};

const hourOptions = generateHourOptions();
const minuteOptions = generateMinuteOptions();

export default function CreateShift({}: CreateShiftProps) {
    const [customSkill, setCustomSkill] = useState('');
    
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        role: '',
        shift_date: '',
        start_time: '',
        end_time: '',
        start_hour: '',
        start_minute: '00',
        end_hour: '',
        end_minute: '00',
        ends_next_day: false,
        hourly_rate: '',
        break_duration: 0,
        break_paid: true,
        location: '',
        required_skills: [] as string[],
        preferred_skills: [] as string[],
        additional_requirements: '',
        notes: '',
        is_urgent: false,
        status: 'draft',
        quantity: 1
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate that all time fields are set
        if (!data.start_time || !data.end_time) {
            alert('Please select both start and end times');
            return;
        }
        
        console.log('Submitting form data:', data);
        
        post('/shifts', {
            onSuccess: () => {
                console.log('Shift created successfully');
            },
            onError: (errors) => {
                console.error('Shift creation errors:', errors);
            }
        });
    };

    const addSkill = (skill: string, type: 'required' | 'preferred') => {
        if (type === 'required' && !data.required_skills.includes(skill)) {
            setData('required_skills', [...data.required_skills, skill]);
        } else if (type === 'preferred' && !data.preferred_skills.includes(skill)) {
            setData('preferred_skills', [...data.preferred_skills, skill]);
        }
    };

    const removeSkill = (skill: string, type: 'required' | 'preferred') => {
        if (type === 'required') {
            setData('required_skills', data.required_skills.filter(s => s !== skill));
        } else {
            setData('preferred_skills', data.preferred_skills.filter(s => s !== skill));
        }
    };

    const addCustomSkill = (type: 'required' | 'preferred') => {
        if (customSkill.trim()) {
            addSkill(customSkill.trim(), type);
            setCustomSkill('');
        }
    };

    // Helper functions to work with separate hour/minute fields
    const getStartTime = () => {
        return (data.start_hour && data.start_minute) ? `${data.start_hour}:${data.start_minute}` : '';
    };

    const getEndTime = () => {
        return (data.end_hour && data.end_minute) ? `${data.end_hour}:${data.end_minute}` : '';
    };

    // Auto-detect night shifts and suggest ends_next_day
    const handleTimeChange = (timeType: 'start' | 'end', component: 'hour' | 'minute', value: string) => {
        let newData = { ...data };
        
        if (timeType === 'start') {
            if (component === 'hour') {
                newData.start_hour = value;
                setData('start_hour', value);
            } else {
                newData.start_minute = value;
                setData('start_minute', value);
            }
        } else {
            if (component === 'hour') {
                newData.end_hour = value;
                setData('end_hour', value);
            } else {
                newData.end_minute = value;
                setData('end_minute', value);
            }
        }

        // Update the combined time fields
        setTimeout(() => {
            if (newData.start_hour && newData.start_minute) {
                const startTime = `${newData.start_hour}:${newData.start_minute}`;
                setData('start_time', startTime);
            }
            
            if (newData.end_hour && newData.end_minute) {
                const endTime = `${newData.end_hour}:${newData.end_minute}`;
                setData('end_time', endTime);
            }

            // Auto-detect night shift pattern after both times are set
            if (newData.start_hour && newData.start_minute && newData.end_hour && newData.end_minute) {
                const startHour = parseInt(newData.start_hour);
                const startMinute = parseInt(newData.start_minute);
                const endHour = parseInt(newData.end_hour);
                const endMinute = parseInt(newData.end_minute);
                
                // Convert times to minutes for easier comparison
                const startMinutes = startHour * 60 + startMinute;
                const endMinutes = endHour * 60 + endMinute;
                
                // If end time is earlier than start time, automatically set ends_next_day
                if (endMinutes < startMinutes) {
                    if (!data.ends_next_day) {
                        setData('ends_next_day', true);
                    }
                } else {
                    // If end time is later than start time, clear ends_next_day
                    if (data.ends_next_day) {
                        setData('ends_next_day', false);
                    }
                }
            }
        }, 0);
    };

    const calculateShiftDuration = () => {
        const startTime = getStartTime();
        const endTime = getEndTime();
        
        if (data.shift_date && startTime && endTime) {
            const start = new Date(`${data.shift_date}T${startTime}`);
            let end = new Date(`${data.shift_date}T${endTime}`);
            
            // If ends_next_day is checked, add one day to end time
            if (data.ends_next_day) {
                end.setDate(end.getDate() + 1);
            }
            
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return hours > 0 ? `${hours.toFixed(1)} hours` : '';
        }
        return '';
    };

    const calculateEstimatedPay = () => {
        const startTime = getStartTime();
        const endTime = getEndTime();
        
        if (data.shift_date && startTime && endTime && data.hourly_rate) {
            const start = new Date(`${data.shift_date}T${startTime}`);
            let end = new Date(`${data.shift_date}T${endTime}`);
            
            // If ends_next_day is checked, add one day to end time
            if (data.ends_next_day) {
                end.setDate(end.getDate() + 1);
            }
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            const rate = parseFloat(data.hourly_rate);
            return hours > 0 && rate > 0 ? `£${(hours * rate).toFixed(2)}` : '';
        }
        return '';
    };

    return (
        <AppLayout>
            <Head title="Post New Shift" />
            
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    <Link href="/shifts">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Shifts
                        </Button>
                    </Link>
                    
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Post New Shift</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Create a new shift posting to attract qualified healthcare workers</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Shift Title *</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g., Night Shift Healthcare Assistant - Dementia Unit"
                                        required
                                    />
                                    {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="role">Role Required *</Label>
                                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLE_OPTIONS.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="location">Location *</Label>
                                    <Input
                                        id="location"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="e.g., Ward 3, Ground Floor"
                                    />
                                    {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_urgent"
                                    checked={data.is_urgent}
                                    onCheckedChange={(checked) => setData('is_urgent', !!checked)}
                                />
                                <Label htmlFor="is_urgent" className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    Mark as Urgent Shift
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule & Pay */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Schedule & Pay
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="shift_date">Shift Date *</Label>
                                    <Input
                                        id="shift_date"
                                        type="date"
                                        value={data.shift_date}
                                        onChange={(e) => setData('shift_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.shift_date && <p className="text-sm text-red-600 mt-1">{errors.shift_date}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>Start Time *</Label>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1">
                                                <Select value={data.start_hour} onValueChange={(value) => handleTimeChange('start', 'hour', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Hour" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60">
                                                        {hourOptions.map((hour) => (
                                                            <SelectItem key={hour.value} value={hour.value}>
                                                                {hour.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <span className="text-gray-500 font-medium">:</span>
                                            <div className="flex-1">
                                                <Select value={data.start_minute} onValueChange={(value) => handleTimeChange('start', 'minute', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Min" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60">
                                                        {minuteOptions.map((minute) => (
                                                            <SelectItem key={minute.value} value={minute.value}>
                                                                {minute.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            💡 Select exact hour and minute (e.g., 08:10)
                                        </p>
                                        {errors.start_time && <p className="text-sm text-red-600 mt-1">{errors.start_time}</p>}
                                    </div>

                                    <div>
                                        <Label>End Time *</Label>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1">
                                                <Select value={data.end_hour} onValueChange={(value) => handleTimeChange('end', 'hour', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Hour" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60">
                                                        {hourOptions.map((hour) => (
                                                            <SelectItem key={hour.value} value={hour.value}>
                                                                {hour.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <span className="text-gray-500 font-medium">:</span>
                                            <div className="flex-1">
                                                <Select value={data.end_minute} onValueChange={(value) => handleTimeChange('end', 'minute', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Min" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60">
                                                        {minuteOptions.map((minute) => (
                                                            <SelectItem key={minute.value} value={minute.value}>
                                                                {minute.label}
                                                            </SelectItem>
                                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            💡 Select exact hour and minute (e.g., 16:25)
                        </p>
                        {errors.end_time && <p className="text-sm text-red-600 mt-1">{errors.end_time}</p>}
                    </div>
                </div>

                                <div className="space-y-3">
                                    {data.ends_next_day && (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="ends_next_day"
                                                checked={data.ends_next_day}
                                                disabled
                                            />
                                            <Label htmlFor="ends_next_day" className="flex items-center gap-2 text-gray-600">
                                                <Clock className="h-4 w-4 text-blue-500" />
                                                Shift ends the next day (Night shift)
                                            </Label>
                                        </div>
                                    )}

                                    {data.shift_date && getStartTime() && getEndTime() && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                            <div className="font-medium text-blue-900 mb-1">Shift Schedule:</div>
                                            <div className="text-blue-700">
                                                <div>Start: {data.shift_date} at {getStartTime()}</div>
                                                <div>
                                                    End: {data.ends_next_day 
                                                        ? new Date(new Date(data.shift_date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                                        : data.shift_date
                                                    } at {getEndTime()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Row 1: Hourly Rate and Break */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="hourly_rate">Hourly Rate (£) *</Label>
                                        <div className="relative">
                                            <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                id="hourly_rate"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.hourly_rate}
                                                onChange={(e) => setData('hourly_rate', e.target.value)}
                                                placeholder="15.00"
                                                className="pl-9"
                                            />
                                        </div>
                                        {errors.hourly_rate && <p className="text-sm text-red-600 mt-1">{errors.hourly_rate}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="break_duration">Break (minutes)</Label>
                                        <Input
                                            id="break_duration"
                                            type="number"
                                            step="1"
                                            min="0"
                                            max="720"
                                            value={data.break_duration}
                                            onChange={(e) => setData('break_duration', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Checkbox
                                                id="break_paid"
                                                checked={data.break_paid}
                                                onCheckedChange={(checked) => setData('break_paid', !!checked)}
                                            />
                                            <Label htmlFor="break_paid" className="text-xs cursor-pointer">
                                                Paid break
                                            </Label>
                                        </div>
                                        {errors.break_duration && <p className="text-sm text-red-600 mt-1">{errors.break_duration}</p>}
                                    </div>
                                </div>

                                {/* Row 2: Duration and Estimated Pay */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-gray-600">Duration</Label>
                                        <div className="p-3 bg-gray-50 rounded-md text-sm font-medium text-green-700">
                                            {calculateShiftDuration() || 'Set start and end times'}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm text-gray-600">Estimated Pay</Label>
                                        <div className="p-3 bg-green-50 rounded-md text-sm font-medium text-green-700">
                                            {calculateEstimatedPay() || 'Set rate and duration'}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Number of Shifts */}
                                <div>
                                    <Label htmlFor="quantity" className="text-sm text-gray-600">Create multiple identical shifts at once</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', parseInt(e.target.value) || 1)}
                                        placeholder="1"
                                        className="mt-2"
                                    />
                                    {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills & Requirements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills & Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Required Skills */}
                            <div>
                                <Label className="text-base font-medium">Required Skills</Label>
                                <p className="text-sm text-gray-600 mb-3">Essential skills that applicants must have</p>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {commonSkills.map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant={data.required_skills.includes(skill) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => 
                                                data.required_skills.includes(skill) 
                                                    ? removeSkill(skill, 'required')
                                                    : addSkill(skill, 'required')
                                            }
                                        >
                                            {skill}
                                            {data.required_skills.includes(skill) && (
                                                <X className="h-3 w-3 ml-1" />
                                            )}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex gap-2 mb-3">
                                    <Input
                                        value={customSkill}
                                        onChange={(e) => setCustomSkill(e.target.value)}
                                        placeholder="Add custom skill"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => addCustomSkill('required')}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {data.required_skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-sm text-gray-600">Selected:</span>
                                        {data.required_skills.map((skill) => (
                                            <Badge key={skill} variant="default" className="text-xs">
                                                {skill}
                                                <X 
                                                    className="h-3 w-3 ml-1 cursor-pointer" 
                                                    onClick={() => removeSkill(skill, 'required')}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Additional Requirements */}
                            <div>
                                <Label htmlFor="additional_requirements">Additional Requirements</Label>
                                <Textarea
                                    id="additional_requirements"
                                    value={data.additional_requirements}
                                    onChange={(e) => setData('additional_requirements', e.target.value)}
                                    placeholder="Any additional requirements, certifications, or special instructions..."
                                    rows={3}
                                />
                            </div>

                            {/* Shift Notes */}
                            <div>
                                <Label htmlFor="notes">Shift Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Any additional information about this shift that workers should know..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-between">
                        <Link href="/shifts">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={processing}
                                onClick={() => setData('status', 'draft')}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                onClick={() => setData('status', 'published')}
                            >
                                {processing ? 'Publishing...' : 'Publish Shift'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}