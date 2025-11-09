<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

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

        if(!$user->isHealthCareWorker()) {
            auth()->logout();
            abort(403, 'User must be a Health Care Worker!');
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => UserResource::make($user)
        ]);

    }

}
