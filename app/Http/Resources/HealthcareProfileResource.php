<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HealthcareProfileResource extends JsonResource
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
            'user_id' => $this->user_id,
            'work_experiences' => WorkExperienceResource::collection($this->workExperiences),
            'skills' => SkillResource::collection($this->skills),
            'bank_details' => $this->bankDetails ? BankDetailsResource::make($this->bankDetails) : null,
            'is_profile_complete' => $this->is_profile_complete,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}