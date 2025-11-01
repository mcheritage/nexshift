<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\WorkExperienceResource;
use App\Models\WorkExperience;
use Illuminate\Http\Request;

class WorkExperienceController extends BaseApiController
{
    /**
     * Get work experiences
     */
    public function index(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $experiences = $user->workExperiences()->orderBy('start_date', 'desc')->get();
        
        return response()->json(WorkExperienceResource::collection($experiences));
    }

    /**
     * Create work experience
     */
    public function store(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $request->validate([
            'company_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $experience = $user->workExperiences()->create($request->all());
        
        return response()->json(WorkExperienceResource::make($experience), 201);
    }

    /**
     * Update work experience
     */
    public function update(Request $request, $id)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $experience = $user->workExperiences()->findOrFail($id);
        
        $request->validate([
            'company_name' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $experience->update($request->all());
        
        return response()->json(WorkExperienceResource::make($experience));
    }

    /**
     * Delete work experience
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $experience = $user->workExperiences()->findOrFail($id);
        $experience->delete();
        
        return response()->json(['message' => 'Work experience deleted successfully']);
    }
}