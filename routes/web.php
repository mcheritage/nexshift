<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//require __DIR__.'/carehome.php';
require __DIR__.'/admin.php';

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Document upload routes for care homes
    Route::prefix('documents')->name('documents.')->group(function () {
        Route::get('/', [App\Http\Controllers\DocumentUploadController::class, 'index'])->name('index');
        Route::post('/upload', [App\Http\Controllers\DocumentUploadController::class, 'upload'])->name('upload');
        Route::delete('/delete', [App\Http\Controllers\DocumentUploadController::class, 'delete'])->name('delete');
        Route::get('/download/{document}', [App\Http\Controllers\DocumentUploadController::class, 'download'])->name('download');
    });

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

