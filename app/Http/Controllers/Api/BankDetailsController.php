<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\BankDetailsResource;
use App\Models\BankDetails;
use Illuminate\Http\Request;

class BankDetailsController extends BaseApiController
{
    /**
     * Get bank details
     */
    public function index(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $bankDetails = $user->bankDetails;
        
        if (!$bankDetails) {
            return response()->json(null);
        }
        
        return response()->json(BankDetailsResource::make($bankDetails));
    }

    /**
     * Create bank details
     */
    public function store(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        // Check if user already has bank details
        if ($user->bankDetails) {
            return response()->json(['message' => 'Bank details already exist. Use PUT to update.'], 409);
        }
        
        $request->validate([
            'account_holder_name' => 'required|string|max:255',
            'sort_code' => 'required|string|size:6|regex:/^\d{6}$/',
            'account_number' => 'required|string|size:8|regex:/^\d{8}$/',
            'bank_name' => 'nullable|string|max:255',
        ]);

        $bankDetails = $user->bankDetails()->create($request->all());
        
        return response()->json(BankDetailsResource::make($bankDetails), 201);
    }

    /**
     * Update bank details
     */
    public function update(Request $request, $id)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $bankDetails = $user->bankDetails()->findOrFail($id);
        
        $request->validate([
            'account_holder_name' => 'sometimes|required|string|max:255',
            'sort_code' => 'sometimes|required|string|size:6|regex:/^\d{6}$/',
            'account_number' => 'sometimes|required|string|size:8|regex:/^\d{8}$/',
            'bank_name' => 'nullable|string|max:255',
        ]);

        $bankDetails->update($request->all());
        
        return response()->json(BankDetailsResource::make($bankDetails));
    }

    /**
     * Delete bank details
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $bankDetails = $user->bankDetails()->findOrFail($id);
        $bankDetails->delete();
        
        return response()->json(['message' => 'Bank details deleted successfully']);
    }
}