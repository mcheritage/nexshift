<?php

namespace App\Services;

use App\Dtos\LoginUserDto;
use App\Dtos\RegisterCareHomeDto;
use App\Dtos\RegisterUserDto;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\CareHome;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function registerCareHome(RegisterCareHomeDto $payload): User
    {
        return \DB::transaction(function () use ($payload) {
            /** @var CareHome $care_home */
            $care_home = CareHome::create([
                'name' => $payload->name,
                'status' => 'pending',
            ]);

            $user = $this->registerUser(new RegisterUserDto(
                first_name: 'Admin',
                last_name: explode(' ', $care_home->name)[0],
                other_names: '',
                gender: null,
                email: $payload->email,
                password: $payload->password
            ), 'care_home_admin');

            $user->care_home_id = $care_home->id;
            $user->save();

            // Ensure the relationship is loaded
            $user->load('care_home');

            return $user;
        });
    }

    public function registerUser(RegisterUserDto $payload, string $role = 'health_worker'): User
    {
        $user = User::create([
            'first_name' => $payload->first_name,
            'last_name' => $payload->last_name,
            'other_names' => $payload->other_names,
            'gender' => $payload->gender,
            'email' => $payload->email,
            'password' => Hash::make($payload->password),
            'role' => $role,
            'status' => $role === 'health_worker' ? 'pending' : 'approved',
        ]);

        event(new Registered($user));

        return $user;
    }

    public function loginUser(LoginUserDto $data, bool $remember = false): bool
    {
        if (! Auth::attempt(['email'=> $data->email, 'password' => $data->password], $remember)) {

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        return true;
    }


    public function apiLoginUser(User $user): \Illuminate\Http\JsonResponse
    {
        $auth_token = $this->generateAuthToken($user);

        return response()->json([
            'access_token' => $auth_token,
            'user' => $user,
        ]);
    }


    public function generateAuthToken(User $user): string
    {
        return $user->createToken('auth_token')->plainTextToken;
    }
}
