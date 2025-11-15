<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    /**
     * Log an activity
     */
    public static function log(
        string $action,
        string $description,
        ?Model $subject = null,
        ?string $userId = null,
        ?string $careHomeId = null,
        ?array $properties = []
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $userId ?? auth()->id(),
            'care_home_id' => $careHomeId,
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->id,
            'description' => $description,
            'properties' => $properties,
        ]);
    }

    /**
     * Log user creation
     */
    public static function logUserCreated(Model $user, ?string $careHomeId = null): void
    {
        self::log(
            action: 'user_created',
            description: "User {$user->first_name} {$user->last_name} ({$user->email}) was created",
            subject: $user,
            careHomeId: $careHomeId,
            properties: [
                'user_id' => $user->id,
                'user_name' => "{$user->first_name} {$user->last_name}",
                'user_email' => $user->email,
                'user_role' => $user->role,
            ]
        );
    }

    /**
     * Log user update
     */
    public static function logUserUpdated(Model $user, array $changes): void
    {
        self::log(
            action: 'user_updated',
            description: "User {$user->first_name} {$user->last_name} was updated",
            subject: $user,
            properties: [
                'user_id' => $user->id,
                'user_name' => "{$user->first_name} {$user->last_name}",
                'changes' => $changes,
            ]
        );
    }

    /**
     * Log user deletion
     */
    public static function logUserDeleted(string $userName, string $userEmail, string $userId): void
    {
        self::log(
            action: 'user_deleted',
            description: "User {$userName} ({$userEmail}) was deleted",
            properties: [
                'user_id' => $userId,
                'user_name' => $userName,
                'user_email' => $userEmail,
            ]
        );
    }

    /**
     * Log status change
     */
    public static function logStatusChange(
        Model $model,
        string $oldStatus,
        string $newStatus,
        string $action,
        ?string $reason = null,
        ?string $careHomeId = null
    ): void {
        $modelName = class_basename($model);
        $name = $model->name ?? ($model->first_name . ' ' . $model->last_name);
        
        self::log(
            action: "status_{$action}",
            description: "{$modelName} '{$name}' status changed from {$oldStatus} to {$newStatus}",
            subject: $model,
            careHomeId: $careHomeId,
            properties: [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'action' => $action,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Log care home creation
     */
    public static function logCareHomeCreated(Model $careHome): void
    {
        self::log(
            action: 'care_home_created',
            description: "Care home '{$careHome->name}' was created",
            subject: $careHome,
            careHomeId: $careHome->id,
            properties: [
                'care_home_id' => $careHome->id,
                'care_home_name' => $careHome->name,
            ]
        );
    }

    /**
     * Log care home update
     */
    public static function logCareHomeUpdated(Model $careHome, array $changes): void
    {
        self::log(
            action: 'care_home_updated',
            description: "Care home '{$careHome->name}' was updated",
            subject: $careHome,
            careHomeId: $careHome->id,
            properties: [
                'care_home_id' => $careHome->id,
                'care_home_name' => $careHome->name,
                'changes' => $changes,
            ]
        );
    }

    /**
     * Log care home deletion
     */
    public static function logCareHomeDeleted(string $careHomeName, string $careHomeId): void
    {
        self::log(
            action: 'care_home_deleted',
            description: "Care home '{$careHomeName}' was deleted",
            properties: [
                'care_home_id' => $careHomeId,
                'care_home_name' => $careHomeName,
            ]
        );
    }

    /**
     * Log document upload
     */
    public static function logDocumentUploaded(Model $document, ?string $careHomeId = null): void
    {
        self::log(
            action: 'document_uploaded',
            description: "Document '{$document->type}' was uploaded",
            subject: $document,
            careHomeId: $careHomeId,
            properties: [
                'document_id' => $document->id,
                'document_type' => $document->type,
                'file_name' => $document->file_name,
            ]
        );
    }

    /**
     * Log document status change
     */
    public static function logDocumentStatusChange(
        Model $document,
        string $oldStatus,
        string $newStatus,
        ?string $reason = null,
        ?string $careHomeId = null
    ): void {
        self::log(
            action: 'document_status_changed',
            description: "Document '{$document->type}' status changed from {$oldStatus} to {$newStatus}",
            subject: $document,
            careHomeId: $careHomeId,
            properties: [
                'document_id' => $document->id,
                'document_type' => $document->type,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Log shift creation
     */
    public static function logShiftCreated(Model $shift, string $careHomeId): void
    {
        self::log(
            action: 'shift_created',
            description: "Shift '{$shift->title}' was created for {$shift->shift_date}",
            subject: $shift,
            careHomeId: $careHomeId,
            properties: [
                'shift_id' => $shift->id,
                'shift_title' => $shift->title,
                'shift_date' => $shift->shift_date,
                'shift_time' => "{$shift->start_time} - {$shift->end_time}",
            ]
        );
    }

    /**
     * Log shift update
     */
    public static function logShiftUpdated(Model $shift, array $changes, string $careHomeId): void
    {
        self::log(
            action: 'shift_updated',
            description: "Shift '{$shift->title}' was updated",
            subject: $shift,
            careHomeId: $careHomeId,
            properties: [
                'shift_id' => $shift->id,
                'shift_title' => $shift->title,
                'changes' => $changes,
            ]
        );
    }

    /**
     * Log shift deletion
     */
    public static function logShiftDeleted(string $shiftTitle, string $shiftId, string $careHomeId): void
    {
        self::log(
            action: 'shift_deleted',
            description: "Shift '{$shiftTitle}' was deleted",
            careHomeId: $careHomeId,
            properties: [
                'shift_id' => $shiftId,
                'shift_title' => $shiftTitle,
            ]
        );
    }

    /**
     * Log application status change
     */
    public static function logApplicationStatusChange(
        Model $application,
        string $oldStatus,
        string $newStatus,
        string $careHomeId
    ): void {
        self::log(
            action: 'application_status_changed',
            description: "Application for shift '{$application->shift->title}' changed from {$oldStatus} to {$newStatus}",
            subject: $application,
            careHomeId: $careHomeId,
            properties: [
                'application_id' => $application->id,
                'shift_id' => $application->shift_id,
                'shift_title' => $application->shift->title,
                'worker_name' => "{$application->user->first_name} {$application->user->last_name}",
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ]
        );
    }

    /**
     * Log timesheet submission
     */
    public static function logTimesheetSubmitted(Model $timesheet, string $careHomeId): void
    {
        self::log(
            action: 'timesheet_submitted',
            description: "Timesheet for shift '{$timesheet->shift->title}' was submitted",
            subject: $timesheet,
            careHomeId: $careHomeId,
            properties: [
                'timesheet_id' => $timesheet->id,
                'shift_id' => $timesheet->shift_id,
                'shift_title' => $timesheet->shift->title,
                'worker_name' => "{$timesheet->healthcareWorker->first_name} {$timesheet->healthcareWorker->last_name}",
            ]
        );
    }

    /**
     * Log timesheet approval
     */
    public static function logTimesheetApproved(Model $timesheet, string $careHomeId): void
    {
        self::log(
            action: 'timesheet_approved',
            description: "Timesheet for shift '{$timesheet->shift->title}' was approved",
            subject: $timesheet,
            careHomeId: $careHomeId,
            properties: [
                'timesheet_id' => $timesheet->id,
                'shift_id' => $timesheet->shift_id,
                'shift_title' => $timesheet->shift->title,
                'worker_name' => "{$timesheet->healthcareWorker->first_name} {$timesheet->healthcareWorker->last_name}",
            ]
        );
    }
}
