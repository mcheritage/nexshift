<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//require __DIR__.'/carehome.php';
require __DIR__.'/admin.php';

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');



// Auto-login route for testing (remove in production)
Route::get('/auto-login', function () {
    $user = App\Models\User::where('email', 'admin@sunshinecare.com')->first();
    if ($user) {
        Auth::login($user);
        return redirect()->route('dashboard')->with('success', 'Logged in as ' . $user->email);
    }
    return redirect()->route('login')->with('error', 'User not found');
});

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notification routes
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [App\Http\Controllers\NotificationController::class, 'index'])->name('index');
        Route::get('/unread-count', [App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::patch('/{notification}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('mark-as-read');
        Route::patch('/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/{notification}', [App\Http\Controllers\NotificationController::class, 'destroy'])->name('destroy');
    });

    // Document upload routes for care homes
    Route::prefix('documents')->name('documents.')->group(function () {
        Route::get('/', [App\Http\Controllers\DocumentUploadController::class, 'index'])->name('index');
        Route::post('/upload', [App\Http\Controllers\DocumentUploadController::class, 'upload'])->name('upload');
        Route::delete('/delete', [App\Http\Controllers\DocumentUploadController::class, 'delete'])->name('delete');
        Route::get('/download/{document}', [App\Http\Controllers\DocumentUploadController::class, 'download'])->name('download');
    });

    // Shift management routes for care homes
    Route::resource('shifts', App\Http\Controllers\ShiftController::class);
    Route::prefix('shifts')->name('shifts.')->group(function () {
        Route::patch('/{shift}/publish', [App\Http\Controllers\ShiftController::class, 'publish'])->name('publish');
        Route::patch('/{shift}/cancel', [App\Http\Controllers\ShiftController::class, 'cancel'])->name('cancel');
    });

    // Application management routes for care homes
    Route::prefix('applications')->name('applications.')->group(function () {
        Route::get('/shift/{shift}', [App\Http\Controllers\ApplicationController::class, 'index'])->name('index');
        Route::patch('/{application}/accept', [App\Http\Controllers\ApplicationController::class, 'accept'])->name('accept');
        Route::patch('/{application}/reject', [App\Http\Controllers\ApplicationController::class, 'reject'])->name('reject');
    });

    // Timesheet approval routes for care homes
    Route::prefix('timesheets')->name('timesheets.')->group(function () {
        Route::get('/', [App\Http\Controllers\TimesheetController::class, 'index'])->name('index');
        Route::get('/{timesheet}', [App\Http\Controllers\TimesheetController::class, 'show'])->name('show');
        Route::patch('/{timesheet}/approve', [App\Http\Controllers\TimesheetController::class, 'approve'])->name('approve');
        Route::patch('/{timesheet}/query', [App\Http\Controllers\TimesheetController::class, 'query'])->name('query');
        Route::patch('/{timesheet}/reject', [App\Http\Controllers\TimesheetController::class, 'reject'])->name('reject');
        Route::patch('/bulk-approve', [App\Http\Controllers\TimesheetController::class, 'bulkApprove'])->name('bulk-approve');
    });

    // Invoice management routes for care homes
    Route::prefix('invoices')->name('invoices.')->group(function () {
        Route::get('/', [App\Http\Controllers\InvoiceController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\InvoiceController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\InvoiceController::class, 'store'])->name('store');
        Route::get('/{invoice}', [App\Http\Controllers\InvoiceController::class, 'show'])->name('show');
        Route::patch('/{invoice}/mark-sent', [App\Http\Controllers\InvoiceController::class, 'markAsSent'])->name('mark-sent');
        Route::patch('/{invoice}/mark-paid', [App\Http\Controllers\InvoiceController::class, 'markAsPaid'])->name('mark-paid');
    });
});

// Healthcare Worker routes (outside care home middleware)
Route::middleware(['auth', 'health_care_worker'])->prefix('worker')->name('worker.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('worker.dashboard');
    });
    Route::get('/dashboard', [App\Http\Controllers\WorkerController::class, 'dashboard'])->name('dashboard');
    Route::get('/shifts', [App\Http\Controllers\WorkerController::class, 'shifts'])->name('shifts');
    Route::post('/shifts/{shift}/apply', [App\Http\Controllers\WorkerController::class, 'apply'])->name('apply');
    Route::get('/applications', [App\Http\Controllers\WorkerController::class, 'applications'])->name('applications');
    Route::patch('/applications/{application}/withdraw', [App\Http\Controllers\WorkerController::class, 'withdrawApplication'])->name('applications.withdraw');
    
    // My Shifts page for workers
    Route::get('/my-shifts', [App\Http\Controllers\WorkerController::class, 'myShifts'])->name('my-shifts');
    
    // Timesheet routes for workers
    Route::get('/timesheets', [App\Http\Controllers\WorkerController::class, 'timesheets'])->name('timesheets');
    Route::get('/shifts/{shift}/timesheets/create', [App\Http\Controllers\WorkerController::class, 'createTimesheet'])->name('timesheets.create');
    Route::post('/shifts/{shift}/timesheets', [App\Http\Controllers\WorkerController::class, 'storeTimesheet'])->name('timesheets.store');
    Route::get('/timesheets/{timesheet}/edit', [App\Http\Controllers\WorkerController::class, 'editTimesheet'])->name('timesheets.edit');
    Route::patch('/timesheets/{timesheet}', [App\Http\Controllers\WorkerController::class, 'updateTimesheet'])->name('timesheets.update');
    Route::patch('/timesheets/{timesheet}/submit', [App\Http\Controllers\WorkerController::class, 'submitTimesheet'])->name('timesheets.submit');
});

Route::middleware(['auth'])->group(function () {
    // Admin routes
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        // Admin Dashboard
        Route::get('/', [App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');
        
        // Document Verification
        Route::get('/documents', [App\Http\Controllers\Admin\DocumentVerificationController::class, 'index'])->name('main.documents.index');
        Route::get('/carehomes/{careHome}/documents', [App\Http\Controllers\Admin\DocumentVerificationController::class, 'showCareHome'])->name('main.carehomes.documents');
        Route::patch('/documents/{document}/status', [App\Http\Controllers\Admin\DocumentVerificationController::class, 'updateStatus'])->name('main.documents.update-status');
        Route::get('/documents/{document}/download', [App\Http\Controllers\Admin\DocumentVerificationController::class, 'download'])->name('main.documents.download');
        
        // Care Home Management
        Route::get('/carehomes', [App\Http\Controllers\Admin\CareHomeManagementController::class, 'index'])->name('carehomes.index');
        Route::get('/carehomes/{careHome}', [App\Http\Controllers\Admin\CareHomeManagementController::class, 'show'])->name('carehomes.show');
        Route::post('/carehomes', [App\Http\Controllers\Admin\CareHomeManagementController::class, 'store'])->name('carehomes.store');
        Route::put('/carehomes/{careHome}', [App\Http\Controllers\Admin\CareHomeManagementController::class, 'update'])->name('carehomes.update');
        Route::delete('/carehomes/{careHome}', [App\Http\Controllers\Admin\CareHomeManagementController::class, 'destroy'])->name('carehomes.destroy');
        
        // Health Care Worker Management
        Route::get('/healthcare-workers', [App\Http\Controllers\Admin\HealthCareWorkerController::class, 'index'])->name('healthcare-workers.index');
        Route::get('/healthcare-workers/{healthCareWorker}', [App\Http\Controllers\Admin\HealthCareWorkerController::class, 'show'])->name('healthcare-workers.show');
        Route::post('/healthcare-workers', [App\Http\Controllers\Admin\HealthCareWorkerController::class, 'store'])->name('healthcare-workers.store');
        Route::put('/healthcare-workers/{healthCareWorker}', [App\Http\Controllers\Admin\HealthCareWorkerController::class, 'update'])->name('healthcare-workers.update');
        Route::patch('/healthcare-workers/{healthCareWorker}/password', [App\Http\Controllers\Admin\HealthCareWorkerController::class, 'updatePassword'])->name('healthcare-workers.update-password');
        Route::delete('/healthcare-workers/{healthCareWorker}', [App\Http\Controllers\Admin\HealthCareWorkerController::class, 'destroy'])->name('healthcare-workers.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';