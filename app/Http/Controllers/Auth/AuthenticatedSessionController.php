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

        // Redirect based on user role/type
        $user = $request->user();
        
        if ($user->isAdmin()) {
            // Admin should always go to admin dashboard
            return redirect()->route('admin.dashboard', absolute: false);
        } elseif ($user->role === 'health_care_worker') {
            // Healthcare workers should go to worker dashboard
            return redirect()->route('worker.dashboard', absolute: false);
        }
        
        // For care home admins, check if there's a valid intended URL
        $intended = $request->session()->pull('url.intended');
        
        if ($intended) {
            // Parse the intended URL to get just the path
            // Handle both full URLs and relative paths
            $intendedPath = parse_url($intended, PHP_URL_PATH);
            
            // If parse_url returns null/false, it might be a relative path already
            if (!$intendedPath && is_string($intended) && str_starts_with($intended, '/')) {
                $intendedPath = $intended;
            }
            
            // Only use intended URL if it's a valid path and not a guest-only route
            if ($intendedPath && is_string($intendedPath) && strlen($intendedPath) > 0) {
                $guestRoutes = ['/register', '/login', '/password'];
                $isGuestRoute = collect($guestRoutes)->contains(fn($route) => str_starts_with($intendedPath, $route));
                
                if (!$isGuestRoute) {
                    // Ensure the path starts with / for proper redirect
                    $redirectPath = str_starts_with($intendedPath, '/') ? $intendedPath : '/' . $intendedPath;
                    return redirect($redirectPath);
                }
            }
        }
        
        // Default to care home admin dashboard
        return redirect()->route('dashboard', absolute: false);
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
