<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\HealthcareProfileResource;
use App\Models\HealthcareProfile;
use Illuminate\Http\Request;

class ProfileController extends BaseApiController
{
    /**
     * Get healthcare profile
     */
    public function getHealthcareProfile(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $profile = HealthcareProfile::with(['workExperiences', 'skills', 'bankDetails'])
            ->where('user_id', $user->id)
            ->first();
            
        if (!$profile) {
            // Create profile if it doesn't exist
            $profile = HealthcareProfile::create([
                'user_id' => $user->id,
                'is_profile_complete' => false,
            ]);
            
            $profile->load(['workExperiences', 'skills', 'bankDetails']);
        }
        
        return response()->json(HealthcareProfileResource::make($profile));
    }

    /**
     * Update healthcare profile
     */
    public function updateHealthcareProfile(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $request->validate([
            'work_experiences' => 'nullable|array',
            'work_experiences.*.company_name' => 'required_with:work_experiences|string|max:255',
            'work_experiences.*.position' => 'required_with:work_experiences|string|max:255',
            'work_experiences.*.start_date' => 'required_with:work_experiences|date',
            'work_experiences.*.end_date' => 'nullable|date|after:work_experiences.*.start_date',
            'work_experiences.*.is_current' => 'boolean',
            'work_experiences.*.description' => 'nullable|string',
            
            'skills' => 'nullable|array',
            'skills.*.name' => 'required_with:skills|string|max:255',
            'skills.*.category' => 'required_with:skills|string|max:255',
            'skills.*.proficiency_level' => 'required_with:skills|in:Beginner,Intermediate,Advanced,Expert',
            'skills.*.years_experience' => 'required_with:skills|integer|min:0|max:50',
            
            'bank_details' => 'nullable|array',
            'bank_details.account_holder_name' => 'required_with:bank_details|string|max:255',
            'bank_details.sort_code' => 'required_with:bank_details|string|size:6|regex:/^\d{6}$/',
            'bank_details.account_number' => 'required_with:bank_details|string|size:8|regex:/^\d{8}$/',
            'bank_details.bank_name' => 'nullable|string|max:255',
        ]);

        $profile = HealthcareProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['is_profile_complete' => false]
        );

        // Update work experiences if provided
        if ($request->has('work_experiences')) {
            $user->workExperiences()->delete();
            foreach ($request->work_experiences as $experience) {
                $user->workExperiences()->create($experience);
            }
        }

        // Update skills if provided
        if ($request->has('skills')) {
            $user->skills()->delete();
            foreach ($request->skills as $skill) {
                $user->skills()->create($skill);
            }
        }

        // Update bank details if provided
        if ($request->has('bank_details')) {
            $user->bankDetails()->delete();
            $user->bankDetails()->create($request->bank_details);
        }

        // Check if profile is complete
        $hasWorkExperience = $user->workExperiences()->exists();
        $hasSkills = $user->skills()->exists();
        $hasBankDetails = $user->bankDetails()->exists();
        
        $profile->update([
            'is_profile_complete' => $hasWorkExperience && $hasSkills && $hasBankDetails
        ]);

        $profile->load(['workExperiences', 'skills', 'bankDetails']);
        
        return response()->json(HealthcareProfileResource::make($profile));
    }
}