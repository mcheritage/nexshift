<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var User $this */
        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar_url' => $this->avatar_url,
//            'is_completed_onboarding' => (bool) $this->is_completed_onboarding,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => $this->is_active,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'ethnicity' => $this->ethnicity,
            'country_of_residence' => $this->country_of_residence,
            'phone_number' => $this->phone_number,
            'gender' => $this->gender,
            'bio' => $this->bio,
            'hourly_rate_min' => $this->hourly_rate_min,
            'hourly_rate_max' => $this->hourly_rate_max,
            'available_weekends' => $this->available_weekends,
            'available_nights' => $this->available_nights,
            'preferences' => $this->preferences,
            'created_at' => $this->created_at,
            'last_login_at' => $this->last_login_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
