<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterCareHomeRequest;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredCareHomeController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(RegisterCareHomeRequest $request, AuthService $authService): RedirectResponse
    {
        $payload = $request->requestDataObject();

        $user = $authService->registerCareHome($payload);

        // Don't auto-login - user must verify email first
        return redirect()->route('login')->with('status', 'Care home registered successfully! We\'ve sent a verification email to ' . $user->email . '. Please check your inbox and click the verification link before logging in.');
    }
}
