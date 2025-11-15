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

        // Refresh the user to ensure the care_home relationship is loaded
        $user->refresh();
        $user->load('care_home');

        Auth::login($user);
        
        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', 'Care home registered successfully. Your account is pending approval.');
    }
}
