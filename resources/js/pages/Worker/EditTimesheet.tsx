import { Head, Link, useForm, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    Coins, 
    Building2,
    Save,
    Send,
    AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ROLE_LABELS } from '@/constants/roles';

interface Shift {
    id: string;
    title: string;
    role: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    hourly_rate: number;
    ends_next_day?: boolean;
    start_date_time?: string;
    end_date_time?: string;
    care_home: {
        id: string;
        name: string;
    };
}

interface Timesheet {
    id: string;
    status: string;
    clock_in_time: string;
    clock_out_time: string;
    break_duration_minutes: number;
    total_hours: number;
    total_pay: number;
    has_overtime: boolean;
    overtime_hours: number;
    worker_notes?: string;
    manager_notes?: string;
    shift: Shift;
}

interface EditTimesheetPageProps extends SharedData {
    timesheet: Timesheet;
}

const statusColors = {
    'draft': 'bg-gray-100 text-gray-800',
    'queried': 'bg-yellow-100 text-yellow-800',
};

export default function EditTimesheet({ timesheet }: EditTimesheetPageProps) {
    // The Timesheet model accessor returns time strings like "20:00"
    const clockInTime = timesheet.clock_in_time;
    const clockOutTime = timesheet.clock_out_time;

    const { data, setData, patch, processing, errors } = useForm({
        clock_in_time: clockInTime,
        clock_out_time: clockOutTime,
        break_duration_minutes: timesheet.break_duration_minutes,
        worker_notes: timesheet.worker_notes || '',
    });

    const [calculatedHours, setCalculatedHours] = useState<number>(0);
    const [calculatedPay, setCalculatedPay] = useState<number>(0);
    const [hasOvertime, setHasOvertime] = useState<boolean>(false);
    const [overtimeHours, setOvertimeHours] = useState<number>(0);

    // Calculate hours and pay when times change
    useEffect(() => {
        if (data.clock_in_time && data.clock_out_time) {
            // Create proper timestamps using shift date + times
            const clockInTimestamp = new Date(`${timesheet.shift.shift_date}T${data.clock_in_time}`);
            let clockOutTimestamp = new Date(`${timesheet.shift.shift_date}T${data.clock_out_time}`);
            
            // If clock out time is less than or equal to clock in time, it's overnight
            if (clockOutTimestamp <= clockInTimestamp) {
                clockOutTimestamp.setDate(clockOutTimestamp.getDate() + 1);
            }
            
            // Calculate work duration using timestamps
            const totalWorkMinutes = (clockOutTimestamp.getTime() - clockInTimestamp.getTime()) / (1000 * 60);
            const workMinutesAfterBreak = totalWorkMinutes - data.break_duration_minutes;
            const totalHours = Math.max(0, workMinutesAfterBreak / 60);
            
            setCalculatedHours(parseFloat(totalHours.toFixed(2)));
            
            // Calculate scheduled shift duration using the datetime fields directly
            let scheduledHours = timesheet.shift.duration_hours || 8; // fallback
            
            if (timesheet.shift.start_datetime && timesheet.shift.end_datetime) {
                const scheduledStart = new Date(timesheet.shift.start_datetime);
                const scheduledEnd = new Date(timesheet.shift.end_datetime);
                const scheduledMinutes = (scheduledEnd.getTime() - scheduledStart.getTime()) / (1000 * 60);
                scheduledHours = scheduledMinutes / 60;
            }
            
            // Calculate overtime (only if worked more than scheduled hours)
            const overtime = Math.max(0, totalHours - scheduledHours);
            setHasOvertime(overtime > 0);
            setOvertimeHours(parseFloat(overtime.toFixed(2)));
            
            // Calculate pay
            let pay = 0;
            if (overtime > 0) {
                const regularPay = scheduledHours * timesheet.shift.hourly_rate;
                const overtimePay = overtime * (timesheet.shift.hourly_rate * 1.5);
                pay = regularPay + overtimePay;
            } else {
                pay = totalHours * timesheet.shift.hourly_rate;
            }
            
            setCalculatedPay(parseFloat(pay.toFixed(2)));
        }
    }, [data.clock_in_time, data.clock_out_time, data.break_duration_minutes, timesheet.shift.hourly_rate, timesheet.shift.shift_date]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (time: string) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const handleSubmit = (submitForApproval = false) => {
        const submitData = {
            ...data,
            submit_for_approval: submitForApproval,
            // Send calculated values from frontend
            calculated_hours: calculatedHours,
            calculated_pay: calculatedPay,
            has_overtime: hasOvertime,
            overtime_hours: overtimeHours
        };
        
        router.patch(`/worker/timesheets/${timesheet.id}`, submitData, {
            onError: (errors) => {
                console.log('Edit validation errors:', errors);
            }
        });
    };

    return (
        <AppLayout title="Edit Timesheet">
            <Head title="Edit Timesheet" />

            <div className="container mx-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/worker/timesheets">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Timesheets
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Edit Timesheet</h1>
                                <p className="text-muted-foreground">
                                    Update your working hours
                                </p>
                            </div>
                        </div>
                        <Badge className={statusColors[timesheet.status as keyof typeof statusColors]}>
                            {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                        </Badge>
                    </div>

                    {/* Manager Notes (if queried) */}
                    {timesheet.status === 'queried' && timesheet.manager_notes && (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-800">
                                    <AlertTriangle className="h-5 w-5" />
                                    Manager Query
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-yellow-700">{timesheet.manager_notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Shift Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Shift Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Role</div>
                                    <div className="font-medium">
                                        {ROLE_LABELS[timesheet.shift.role as keyof typeof ROLE_LABELS] || timesheet.shift.role}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Care Home</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        {timesheet.shift.care_home.name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Date</div>
                                    <div className="font-medium">
                                        {formatDate(timesheet.shift.shift_date)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Scheduled Time</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatTime(timesheet.shift.start_time)} - {formatTime(timesheet.shift.end_time)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timesheet Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Working Hours</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Clock In Time */}
                                <div>
                                    <Label htmlFor="clock_in_time">Clock In Time *</Label>
                                    <Input
                                        id="clock_in_time"
                                        type="time"
                                        value={data.clock_in_time}
                                        onChange={(e) => setData('clock_in_time', e.target.value)}
                                        className={errors.clock_in_time ? 'border-red-500' : ''}
                                    />
                                    {errors.clock_in_time && (
                                        <p className="text-sm text-red-500 mt-1">{errors.clock_in_time}</p>
                                    )}
                                </div>

                                {/* Clock Out Time */}
                                <div>
                                    <Label htmlFor="clock_out_time">Clock Out Time *</Label>
                                    <Input
                                        id="clock_out_time"
                                        type="time"
                                        value={data.clock_out_time}
                                        onChange={(e) => setData('clock_out_time', e.target.value)}
                                        className={errors.clock_out_time ? 'border-red-500' : ''}
                                    />
                                    {errors.clock_out_time && (
                                        <p className="text-sm text-red-500 mt-1">{errors.clock_out_time}</p>
                                    )}
                                </div>

                                {/* Break Duration */}
                                <div>
                                    <Label htmlFor="break_duration_minutes">Break Duration (minutes) *</Label>
                                    <Input
                                        id="break_duration_minutes"
                                        type="number"
                                        min="0"
                                        max="480"
                                        value={data.break_duration_minutes}
                                        onChange={(e) => setData('break_duration_minutes', parseInt(e.target.value) || 0)}
                                        className={errors.break_duration_minutes ? 'border-red-500' : ''}
                                    />
                                    {errors.break_duration_minutes && (
                                        <p className="text-sm text-red-500 mt-1">{errors.break_duration_minutes}</p>
                                    )}
                                </div>
                            </div>

                            {/* Calculated Summary */}
                            {calculatedHours > 0 && (
                                <div className="bg-muted/50 rounded-lg p-4">
                                    <h3 className="font-medium mb-3">Calculated Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">Total Hours</div>
                                            <div className="font-medium text-lg flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {calculatedHours}h
                                                {hasOvertime && (
                                                    <span className="text-orange-600 text-sm ml-2">
                                                        (includes {overtimeHours}h overtime)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Hourly Rate</div>
                                            <div className="font-medium text-lg flex items-center gap-1">
                                                <Coins className="h-4 w-4" />
                                                £{timesheet.shift.hourly_rate}
                                                {hasOvertime && (
                                                    <span className="text-orange-600 text-sm ml-2">
                                                        (£{(timesheet.shift.hourly_rate * 1.5).toFixed(2)} OT)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Total Pay</div>
                                            <div className="font-bold text-xl text-green-600 flex items-center gap-1">
                                                <Coins className="h-5 w-5" />
                                                £{calculatedPay}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Worker Notes */}
                            <div>
                                <Label htmlFor="worker_notes">Additional Notes (Optional)</Label>
                                <Textarea
                                    id="worker_notes"
                                    placeholder="Add any additional notes about your shift..."
                                    value={data.worker_notes}
                                    onChange={(e) => setData('worker_notes', e.target.value)}
                                    className={errors.worker_notes ? 'border-red-500' : ''}
                                    rows={3}
                                />
                                {errors.worker_notes && (
                                    <p className="text-sm text-red-500 mt-1">{errors.worker_notes}</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleSubmit(false)}
                                    disabled={processing}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleSubmit(true)}
                                    disabled={processing}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit for Approval
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}