<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\SkillResource;
use App\Models\Skill;
use Illuminate\Http\Request;

class SkillController extends BaseApiController
{
    /**
     * Get skills
     */
    public function index(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $skills = $user->skills()->orderBy('category')->orderBy('name')->get();
        
        return response()->json(SkillResource::collection($skills));
    }

    /**
     * Create skill
     */
    public function store(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'proficiency_level' => 'required|in:Beginner,Intermediate,Advanced,Expert',
            'years_experience' => 'required|integer|min:0|max:50',
        ]);

        $skill = $user->skills()->create($request->all());
        
        return response()->json(SkillResource::make($skill), 201);
    }

    /**
     * Update skill
     */
    public function update(Request $request, $id)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $skill = $user->skills()->findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'proficiency_level' => 'sometimes|required|in:Beginner,Intermediate,Advanced,Expert',
            'years_experience' => 'sometimes|required|integer|min:0|max:50',
        ]);

        $skill->update($request->all());
        
        return response()->json(SkillResource::make($skill));
    }

    /**
     * Delete skill
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $skill = $user->skills()->findOrFail($id);
        $skill->delete();
        
        return response()->json(['message' => 'Skill deleted successfully']);
    }
}