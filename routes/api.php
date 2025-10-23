<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthWorkerDocumentsController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\MediaUploadController;
use App\Http\Controllers\Api\RegisterUserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\WorkExperienceController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\BankDetailsController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\ApplicationController;

Route::post('/auth/register', [RegisterUserController::class, 'store']);
Route::post('/auth/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/users/me', [AuthController::class, 'me']);
    Route::put('/users/me', [AuthController::class, 'updateProfile']);
    Route::post('/media/upload', [MediaUploadController::class, 'uploadImage']);
    Route::get('/documents/list', [HealthWorkerDocumentsController::class, 'getRequiredDocuments']);
    Route::post('/documents/upload', [HealthWorkerDocumentsController::class, 'upload']);

    // Profile routes
    Route::get('/profile/healthcare', [ProfileController::class, 'getHealthcareProfile']);
    Route::put('/profile/healthcare', [ProfileController::class, 'updateHealthcareProfile']);

    // Work Experience routes
    Route::get('/profile/work-experiences', [WorkExperienceController::class, 'index']);
    Route::post('/profile/work-experiences', [WorkExperienceController::class, 'store']);
    Route::put('/profile/work-experiences/{id}', [WorkExperienceController::class, 'update']);
    Route::delete('/profile/work-experiences/{id}', [WorkExperienceController::class, 'destroy']);

    // Skills routes
    Route::get('/profile/skills', [SkillController::class, 'index']);
    Route::post('/profile/skills', [SkillController::class, 'store']);
    Route::put('/profile/skills/{id}', [SkillController::class, 'update']);
    Route::delete('/profile/skills/{id}', [SkillController::class, 'destroy']);

    // Bank Details routes
    Route::get('/profile/bank-details', [BankDetailsController::class, 'index']);
    Route::post('/profile/bank-details', [BankDetailsController::class, 'store']);
    Route::put('/profile/bank-details/{id}', [BankDetailsController::class, 'update']);
    Route::delete('/profile/bank-details/{id}', [BankDetailsController::class, 'destroy']);

    // Shifts routes
    Route::get('/shifts/roles', [ShiftController::class, 'roles']);
    Route::get('/shifts/care-homes', [ShiftController::class, 'careHomes']);
    Route::get('/shifts', [ShiftController::class, 'index']);
    Route::get('/shifts/{id}', [ShiftController::class, 'show']);

    // Application routes
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::patch('/applications/{id}/withdraw', [ApplicationController::class, 'withdraw']);

});