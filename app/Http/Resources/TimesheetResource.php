<?php

namespace App\Http\Resources;

use App\Models\Timesheet;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class TimesheetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Timesheet $timesheet */
        $timesheet = $this->resource;

        $clockInRaw = $timesheet->getRawOriginal('clock_in_time');
        $clockOutRaw = $timesheet->getRawOriginal('clock_out_time');

        return [
            'id' => $timesheet->id,
            'shift_id' => $timesheet->shift_id,
            'worker_id' => $timesheet->worker_id,
            'care_home_id' => $timesheet->care_home_id,
            'clock_in_time' => $clockInRaw ? Carbon::parse($clockInRaw)->toIso8601String() : null,
            'clock_out_time' => $clockOutRaw ? Carbon::parse($clockOutRaw)->toIso8601String() : null,
            'break_duration_minutes' => $timesheet->break_duration_minutes,
            'total_hours' => (float) ($timesheet->total_hours ?? 0),
            'hourly_rate' => (float) ($timesheet->hourly_rate ?? 0),
            'total_pay' => (float) ($timesheet->total_pay ?? 0),
            'status' => $timesheet->status,
            'status_display' => Timesheet::getStatuses()[$timesheet->status] ?? ucfirst($timesheet->status),
            'worker_notes' => $timesheet->worker_notes,
            'manager_notes' => $timesheet->manager_notes,
            'approved_by' => $timesheet->approved_by,
            'approved_at' => $timesheet->approved_at?->toIso8601String(),
            'submitted_at' => $timesheet->submitted_at?->toIso8601String(),
            'has_overtime' => (bool) $timesheet->has_overtime,
            'overtime_hours' => $timesheet->overtime_hours ? (float) $timesheet->overtime_hours : null,
            'overtime_rate' => $timesheet->overtime_rate ? (float) $timesheet->overtime_rate : null,
            'is_editable' => $timesheet->isEditable(),
            'can_submit' => in_array($timesheet->status, [Timesheet::STATUS_DRAFT, Timesheet::STATUS_QUERIED]),
            'can_clock_out' => $timesheet->clock_in_time && !$timesheet->clock_out_time && $timesheet->status === Timesheet::STATUS_DRAFT,
            'created_at' => $timesheet->created_at?->toIso8601String(),
            'updated_at' => $timesheet->updated_at?->toIso8601String(),
            'shift' => ShiftResource::make($this->whenLoaded('shift')),
            'care_home' => $this->when($this->relationLoaded('careHome'), function () use ($timesheet) {
                return [
                    'id' => $timesheet->careHome?->id,
                    'name' => $timesheet->careHome?->name,
                ];
            }),
        ];
    }
}


