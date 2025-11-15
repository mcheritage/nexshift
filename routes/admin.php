<?php

use App\Http\Controllers\Admin\DocumentVerificationController;

Route::domain('admin.' . config('app.domain'))->group(function () {
    Route::middleware(['auth', 'admin'])->group(function () {
        // Document verification routes
        Route::get('/documents', [DocumentVerificationController::class, 'index'])->name('admin.documents.index');
        Route::get('/carehomes/{careHome}/documents', [DocumentVerificationController::class, 'showCareHome'])->name('admin.carehomes.documents');
        Route::patch('/documents/{document}/status', [DocumentVerificationController::class, 'updateStatus'])->name('admin.documents.update-status');
        Route::get('/documents/{document}/download', [DocumentVerificationController::class, 'download'])->name('admin.documents.download');
        Route::get('/documents/{document}/view', [DocumentVerificationController::class, 'view'])->name('admin.documents.view');
    });
});