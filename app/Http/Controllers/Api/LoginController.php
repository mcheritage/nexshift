<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class LoginController extends Controller
{

    public function me(Request $request)
    {
        return response()->json($request->user()->person);
    }

    public function login(LoginRequest $request)
    {
        $request->authenticate();

        /** @var User $user */
        $user = auth()->user();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => UserResource::make($user)
        ]);

    }

}
