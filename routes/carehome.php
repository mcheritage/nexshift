<?php
//
//use App\Http\Controllers\CareHome\Auth\LoginController;
//use App\Http\Controllers\CareHome\Auth\RegisterController;
//use Illuminate\Support\Facades\Log;
//use Inertia\Inertia;
//
//Route::domain('carehome.' . config('app.domain'))->name('carehome.')->group(function () {
//
//    // Home route
//    Route::get('/', function () {
//        return redirect()->route('carehome.login');
//    })->name('home');
//
//    // Test route to check auth status
//    Route::get('/auth-test', function () {
//        Log::info('Auth test route accessed', [
//            'authenticated' => auth()->check(),
//            'user_id' => auth()->id(),
//            'user_email' => auth()->user()->email ?? 'none',
//            'session_id' => session()->getId(),
//            'session_data' => session()->all()
//        ]);
//
//        return response()->json([
//            'authenticated' => auth()->check(),
//            'user_id' => auth()->id(),
//            'user_email' => auth()->user()->email ?? 'none',
//            'session_id' => session()->getId()
//        ]);
//    })->name('auth-test');
//
//    // Auth routes
//    Route::middleware('auth')->group(function () {
//        Route::get('/dashboard', function () {
//            Log::info('Dashboard accessed', [
//                'user_id' => auth()->id(),
//                'user_email' => auth()->user()->email ?? 'none'
//            ]);
//
//            return Inertia::render('carehomes/dashboard');
//        })->name('dashboard');
//
//    });
//
//
//    // Guest routes
//    Route::middleware('guest')->group(function () {
//        Route::get('login', [LoginController::class, 'login'])->name('login');
//        Route::post('login', [LoginController::class, 'storeAuthSession'])->name('login.store');
//
//        Route::get('register', [RegisterController::class, 'create'])->name('register');
//        Route::post('register', [RegisterController::class, 'store'])->name('register.store');
//        Route::post('register/user', [RegisterController::class, 'storeUser'])->name('register.user.store');
//
//        // Password reset routes
//        Route::get('forgot-password', function () {
//            return Inertia::render('carehomes/auth/forgot-password');
//        })->name('password.request');
//        Route::post('forgot-password', function () {
//            // TODO: Implement password reset logic
//            return back()->with('status', 'Password reset link sent!');
//        })->name('password.email');
//    });
//
//});