<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GuestVerifyEmailController extends Controller
{
    /**
     * Mark the user's email address as verified (without requiring authentication).
     */
    public function __invoke(Request $request, string $id, string $hash): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Verify the hash matches
        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect()->route('login')->with('error', 'Invalid verification link.');
        }

        // Check if signature is valid
        if (! $request->hasValidSignature()) {
            return redirect()->route('login')->with('error', 'This verification link has expired. Please request a new one.');
        }

        if ($user->hasVerifiedEmail()) {
            // If user is already logged in as someone else, log them out first
            if (Auth::check() && Auth::id() !== $user->id) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
            return redirect()->route('login')->with('status', 'Your email is already verified. You can now log in!');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // If user is logged in as someone else, log them out
        if (Auth::check() && Auth::id() !== $user->id) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return redirect()->route('login')->with('status', 'Your email has been verified successfully! You can now log in to your account.');
    }
}
