<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class AuthController extends BaseApiController
{

    public function me(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        return response()->json(
            UserResource::make($user)
        );
    }

    public function updateProfile(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'avatar' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'phone_number' => 'nullable|string|max:20',
            'gender' => 'nullable|string|in:male,female,other',
            'bio' => 'nullable|string|max:1000',
            'hourly_rate_min' => 'nullable|numeric|min:0|max:1000',
            'hourly_rate_max' => 'nullable|numeric|min:0|max:1000',
            'available_weekends' => 'nullable|boolean',
            'available_nights' => 'nullable|boolean',
            'metadata' => 'nullable|array',
        ]);

        // Update user fields
        $user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'phone_number' => $request->phone_number,
            'gender' => $request->gender,
            'bio' => $request->bio,
            'hourly_rate_min' => $request->hourly_rate_min,
            'hourly_rate_max' => $request->hourly_rate_max,
            'available_weekends' => $request->available_weekends,
            'available_nights' => $request->available_nights,
            'profile_photo' => $request->avatar ?? $user->profile_photo,
        ]);

        return response()->json(
            UserResource::make($user->fresh())
        );
    }

    public function deleteAccount(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $request->validate([
            'password' => 'required|string',
            'confirmation_text' => 'required|string|in:DELETE MY ACCOUNT',
        ]);

        // Verify password before deletion
        if (!\Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid password provided.'
            ], 422);
        }

        // Log the deletion for audit purposes
        \Log::info('User account deletion initiated', [
            'user_id' => $user->id,
            'email' => $user->email,
            'timestamp' => now(),
        ]);

        // Revoke all tokens for this user
        $user->tokens()->delete();



        // Finally, soft delete the user
        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully.'
        ]);
    }

}
