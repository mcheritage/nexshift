<?php

namespace App\Console\Commands;

use App\Models\Shift;
use App\Models\Timesheet;
use App\Services\PushNotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendShiftReminders extends Command
{
    protected $signature = 'shifts:send-reminders';

    protected $description = 'Send push reminders for upcoming shifts and clock in/out';

    public function handle(PushNotificationService $push): int
    {
        $now = Carbon::now('UTC');

        // Pre-start reminders: 60 minutes and 15 minutes before
        $this->sendPreStartReminders($push, $now, 60);
        $this->sendPreStartReminders($push, $now, 15);

        // Clock-in at start time if not clocked in
        $this->sendClockInReminders($push, $now);

        // Clock-out near end time if not clocked out
        $this->sendClockOutReminders($push, $now);

        return self::SUCCESS;
    }

    protected function sendPreStartReminders(PushNotificationService $push, Carbon $now, int $minutesBefore): void
    {
        $windowStart = $now->copy()->subMinutes(2); // 2-minute window to avoid missing due to schedule drift
        $targetStart = $now->copy()->addMinutes($minutesBefore);
        $windowEnd = $targetStart->copy()->addMinutes(2);

        $shifts = Shift::query()
            ->whereNotNull('selected_worker_id')
            ->whereBetween('start_datetime', [$windowStart, $windowEnd])
            ->get();

        foreach ($shifts as $shift) {
            $title = 'Upcoming shift reminder';
            $message = "Your shift '{$shift->title}' starts in {$minutesBefore} minutes.";
            $data = [
                'type' => 'shift_reminder',
                'shift_id' => $shift->id,
                'start_datetime' => optional($shift->start_datetime)->toIso8601String(),
            ];

            $push->sendToUser($shift->selected_worker_id, $title, $message, $data);
        }
    }

    protected function sendClockInReminders(PushNotificationService $push, Carbon $now): void
    {
        $windowStart = $now->copy()->subMinutes(2);
        $windowEnd = $now->copy()->addMinutes(2);

        $shifts = Shift::query()
            ->whereNotNull('selected_worker_id')
            ->whereBetween('start_datetime', [$windowStart, $windowEnd])
            ->get();

        foreach ($shifts as $shift) {
            $hasTimesheet = Timesheet::query()
                ->where('shift_id', $shift->id)
                ->where('worker_id', $shift->selected_worker_id)
                ->exists();

            if (!$hasTimesheet) {
                $title = 'Time to clock in';
                $message = "Please clock in for your shift '{$shift->title}'.";
                $data = [
                    'type' => 'clock_in_reminder',
                    'shift_id' => $shift->id,
                    'start_datetime' => optional($shift->start_datetime)->toIso8601String(),
                ];
                $push->sendToUser($shift->selected_worker_id, $title, $message, $data);
            }
        }
    }

    protected function sendClockOutReminders(PushNotificationService $push, Carbon $now): void
    {
        // Send a reminder in the last 10 minutes of the shift and 5 minutes after
        $windowStart = $now->copy()->subMinutes(5);
        $windowEnd = $now->copy()->addMinutes(10);

        $shifts = Shift::query()
            ->whereNotNull('selected_worker_id')
            ->whereBetween('end_datetime', [$windowStart, $windowEnd])
            ->get();

        foreach ($shifts as $shift) {
            $openTimesheet = Timesheet::query()
                ->where('shift_id', $shift->id)
                ->where('worker_id', $shift->selected_worker_id)
                ->whereNull('clock_out_time')
                ->first();

            if ($openTimesheet) {
                $title = 'Don\'t forget to clock out';
                $message = "Please clock out for your shift '{$shift->title}'.";
                $data = [
                    'type' => 'clock_out_reminder',
                    'shift_id' => $shift->id,
                    'end_datetime' => optional($shift->end_datetime)->toIso8601String(),
                ];
                $push->sendToUser($shift->selected_worker_id, $title, $message, $data);
            }
        }
    }
}


