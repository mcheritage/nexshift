<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Get the intended URL before clearing it
        $intended = $request->session()->pull('url.intended');

        // Redirect based on user role/type
        $user = $request->user();
        
        if ($user->isAdmin()) {
            // Admin should always go to admin dashboard, ignore intended URL
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'health_care_worker') {
            // Healthcare workers should go to worker dashboard
            return redirect()->route('worker.dashboard');
        }
        
        // For care home admins, check if intended URL is valid, otherwise use dashboard
        // Only use intended URL if it's not a guest-only route (like register routes)
        if ($intended) {
            // Parse the intended URL to get just the path
            $intendedPath = parse_url($intended, PHP_URL_PATH) ?? $intended;
            
            // Don't redirect to guest-only routes
            $guestRoutes = ['/register', '/login', '/password'];
            $isGuestRoute = collect($guestRoutes)->contains(fn($route) => str_starts_with($intendedPath, $route));
            
            if (!$isGuestRoute) {
                return redirect($intended);
            }
        }
        
        // Default to care home admin dashboard
        return redirect()->route('dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
