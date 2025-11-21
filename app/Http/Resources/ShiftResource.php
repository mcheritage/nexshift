<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShiftResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'role' => $this->role,
            'role_display' => $this->role_display,
            'shift_date' => $this->start_datetime ? Carbon::parse($this->start_datetime)->format('Y-m-d') : '',
            'start_time' => $this->start_datetime ? Carbon::parse($this->start_datetime)->format('H:i:s') : '',
            'end_time' => $this->end_datetime ? Carbon::parse($this->end_datetime)->format('H:i:s') : '',
            'duration_hours' => (float) $this->duration_hours,
            'hourly_rate' => (float) $this->hourly_rate,
            'total_pay' => (float) $this->total_pay,
            'required_skills' => $this->required_skills,
            'required_qualifications' => $this->required_qualifications,
            'special_requirements' => $this->special_requirements,
            'status' => $this->status,
            'status_display' => $this->status_display,
            'max_applicants' => $this->max_applicants,
            'is_urgent' => $this->is_urgent,
            'is_recurring' => $this->is_recurring,
            'recurrence_pattern' => $this->recurrence_pattern,
            'application_deadline' => $this->application_deadline ? Carbon::parse($this->application_deadline)->format('Y-m-d H:i:s') : null,
            'published_at' => $this->published_at ? Carbon::parse($this->published_at)->format('Y-m-d H:i:s') : null,
            'created_at' => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : '',
            'updated_at' => $this->updated_at ? Carbon::parse($this->updated_at)->format('Y-m-d H:i:s') : '',
            
            // Relationships
            'care_home' => [
                'id' => $this->careHome->id,
                'name' => $this->careHome->name,
            ],
            
            'selected_worker' => $this->when($this->selectedWorker, [
                'id' => $this->selectedWorker?->id,
                'name' => $this->selectedWorker?->first_name . ' ' . $this->selectedWorker?->last_name,
                'email' => $this->selectedWorker?->email,
            ]),
            
            // Computed fields
            'is_available' => $this->isAvailable(),
            'can_accept_applications' => $this->canAcceptApplications(),
            'is_urgent_by_time' => $this->isUrgent(),
            'start_date_time' => $this->start_datetime ? Carbon::parse($this->start_datetime)->format('Y-m-d\TH:i:s') : '',
            'end_date_time' => $this->end_datetime ? Carbon::parse($this->end_datetime)->format('Y-m-d\TH:i:s') : '',
        ];
    }
}
