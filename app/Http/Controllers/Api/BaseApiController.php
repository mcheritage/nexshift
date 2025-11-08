<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

abstract class BaseApiController extends Controller
{
    /**
     * Get the authenticated user from either sanctum or web guard
     */
    protected function getAuthenticatedUser(Request $request): ?User
    {
        return auth('sanctum')->user() ?? auth('web')->user();
    }

    /**
     * Get the authenticated user or return 401 response
     */
    protected function requireAuthenticatedUser(Request $request): User
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            abort(401, 'Unauthenticated');
        }
        
        return $user;
    }
}
