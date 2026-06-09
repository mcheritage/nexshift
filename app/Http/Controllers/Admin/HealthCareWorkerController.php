<?php

namespace App\Http\Controllers\Admin;

use App\DocumentType;
use App\Http\Controllers\Controller;
use App\Mail\UserStatusChanged;
use App\Mail\WelcomeEmail;
use App\Models\Document;
use App\Models\StatusChange;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class HealthCareWorkerController extends Controller
{
    /**
     * Show all health care workers
     */
    public function index(): Response
    {
        $requiredDocTypes = array_column(DocumentType::getAllRequiredForWorker(), 'value');
        $totalRequired = count($requiredDocTypes);

        $healthCareWorkers = User::where('role', 'health_worker')
            ->withCount([
                'workExperiences',
                'skills as skill_records_count',
                'bankDetails',
                'documents as required_docs_uploaded_count' => function ($q) use ($requiredDocTypes) {
                    $q->whereIn('document_type', $requiredDocTypes)
                      ->distinct('document_type');
                },
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/healthcare-workers/index', [
            'healthCareWorkers' => $healthCareWorkers,
            'totalRequiredDocs' => $totalRequired,
        ]);
    }

    /**
     * Show a specific health care worker
     */
    public function show(User $healthCareWorker): Response
    {
        $healthCareWorker->load(['care_home', 'statusChanges.changedBy']);
        // Query separately to avoid conflict with the 'skills' JSON column on users
        $workExperiences = $healthCareWorker->workExperiences()->get();
        $workerSkills = $healthCareWorker->skills()->get();

        $documentStats = [
            'total' => Document::where('user_id', $healthCareWorker->id)->count(),
            'pending' => Document::where('user_id', $healthCareWorker->id)->where('status', 'pending')->count(),
            'approved' => Document::where('user_id', $healthCareWorker->id)->where('status', 'approved')->count(),
            'rejected' => Document::where('user_id', $healthCareWorker->id)->where('status', 'rejected')->count(),
            'requires_attention' => Document::where('user_id', $healthCareWorker->id)->where('status', 'requires_attention')->count(),
        ];

        $totalRequired = count(DocumentType::getAllRequiredForWorker());

        $mandatoryTrainingCount = \App\Models\TrainingType::where('is_mandatory', true)->where('is_active', true)->count();
        $workerTrainings = \App\Models\WorkerTraining::where('user_id', $healthCareWorker->id)->get();
        $trainingStats = [
            'total_mandatory' => $mandatoryTrainingCount,
            'uploaded'        => $workerTrainings->count(),
            'valid'           => $workerTrainings->filter(fn($t) => in_array($t->compliance_status, ['valid', 'approved']))->count(),
            'pending'         => $workerTrainings->where('status', 'pending')->count(),
            'expiring_soon'   => $workerTrainings->filter(fn($t) => $t->compliance_status === 'expiring_soon')->count(),
            'expired'         => $workerTrainings->filter(fn($t) => in_array($t->compliance_status, ['expired', 'rejected']))->count(),
        ];

        $stripeStatus = null;
        if ($healthCareWorker->stripe_account_id) {
            $stripeStatus = [
                'connected' => true,
                'account_id' => $healthCareWorker->stripe_account_id,
                'onboarding_complete' => $healthCareWorker->stripe_onboarding_complete,
                'charges_enabled' => $healthCareWorker->stripe_charges_enabled,
                'payouts_enabled' => $healthCareWorker->stripe_payouts_enabled,
                'connected_at' => $healthCareWorker->stripe_connected_at,
                'account_type' => $healthCareWorker->stripe_account_type,
            ];
        }

        return Inertia::render('admin/healthcare-workers/show', [
            'healthCareWorker' => [
                'id' => $healthCareWorker->id,
                'first_name' => $healthCareWorker->first_name,
                'last_name' => $healthCareWorker->last_name,
                'email' => $healthCareWorker->email,
                'phone_number' => $healthCareWorker->phone_number,
                'gender' => $healthCareWorker->gender,
                'date_of_birth' => $healthCareWorker->date_of_birth?->format('Y-m-d'),
                'profile_photo' => $healthCareWorker->profile_photo,
                'qualifications' => $healthCareWorker->qualifications ?? [],
                'hourly_rate_min' => $healthCareWorker->hourly_rate_min,
                'hourly_rate_max' => $healthCareWorker->hourly_rate_max,
                'status' => $healthCareWorker->status,
                'rejection_reason' => $healthCareWorker->rejection_reason,
                'approved_at' => $healthCareWorker->approved_at?->format('Y-m-d'),
                'created_at' => $healthCareWorker->created_at,
                'care_home' => $healthCareWorker->care_home ? [
                    'id' => $healthCareWorker->care_home->id,
                    'name' => $healthCareWorker->care_home->name,
                ] : null,
                'status_changes' => $healthCareWorker->statusChanges->map(fn ($sc) => [
                    'id' => $sc->id,
                    'old_status' => $sc->old_status,
                    'new_status' => $sc->new_status,
                    'action' => $sc->action,
                    'reason' => $sc->reason,
                    'created_at' => $sc->created_at,
                    'changed_by' => $sc->changedBy ? [
                        'id' => $sc->changedBy->id,
                        'first_name' => $sc->changedBy->first_name,
                        'last_name' => $sc->changedBy->last_name,
                    ] : null,
                ]),
                'work_experiences' => $workExperiences->map(fn ($we) => [
                    'id' => $we->id,
                    'company_name' => $we->company_name,
                    'position' => $we->position,
                    'start_date' => $we->start_date?->format('Y-m-d'),
                    'end_date' => $we->end_date?->format('Y-m-d'),
                    'is_current' => $we->is_current,
                    'description' => $we->description,
                ]),
                'skills' => $workerSkills->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'category' => $s->category,
                    'proficiency_level' => $s->proficiency_level,
                    'years_experience' => $s->years_experience,
                ]),
                'has_bank_details' => $healthCareWorker->bankDetails()->exists(),
            ],
            'documentStats'  => $documentStats,
            'totalRequired'  => $totalRequired,
            'trainingStats'  => $trainingStats,
            'stripeStatus'   => $stripeStatus,
        ]);
    }

    /**
     * Create a new health care worker
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone_number' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'care_home_id' => 'nullable|exists:care_homes,id',
            'gender' => 'required|in:male,female,other',
        ]);

        $healthCareWorker = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'role' => 'health_worker',
            'care_home_id' => $request->care_home_id,
            'gender' => $request->gender,
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        ActivityLogService::logUserCreated($healthCareWorker, $request->care_home_id);

        Mail::to($healthCareWorker->email)->send(new WelcomeEmail($healthCareWorker));

        return redirect()->back()->with('success', 'Health care worker created successfully. A verification email has been sent.');
    }

    /**
     * Update a health care worker
     */
    public function update(Request $request, User $healthCareWorker): JsonResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $healthCareWorker->id,
            'care_home_id' => 'required|exists:care_homes,id',
            'gender' => 'required|in:male,female,other',
        ]);

        try {
            $oldData = [
                'first_name' => $healthCareWorker->first_name,
                'last_name' => $healthCareWorker->last_name,
                'email' => $healthCareWorker->email,
                'care_home_id' => $healthCareWorker->care_home_id,
                'gender' => $healthCareWorker->gender,
            ];
            
            $healthCareWorker->update([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'care_home_id' => $request->care_home_id,
                'gender' => $request->gender,
            ]);

            // Log activity
            ActivityLogService::logUserUpdated($healthCareWorker, [
                'old' => $oldData,
                'new' => $request->only(['first_name', 'last_name', 'email', 'care_home_id', 'gender']),
            ]);

            $healthCareWorker->load('care_home');

            return response()->json([
                'success' => true,
                'message' => 'Health care worker updated successfully',
                'healthCareWorker' => $healthCareWorker,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update health care worker: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update health care worker password
     */
    public function updatePassword(Request $request, User $healthCareWorker): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $healthCareWorker->update([
                'password' => Hash::make($request->password),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update password: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a health care worker
     */
    public function destroy(User $healthCareWorker): JsonResponse
    {
        try {
            $userName = "{$healthCareWorker->first_name} {$healthCareWorker->last_name}";
            $userEmail = $healthCareWorker->email;
            $userId = $healthCareWorker->id;
            
            $healthCareWorker->delete();

            // Log activity
            ActivityLogService::logUserDeleted($userName, $userEmail, $userId);

            return response()->json([
                'success' => true,
                'message' => 'Health care worker deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete health care worker: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve a health care worker
     */
    public function approve(User $healthCareWorker)
    {
        try {
            $oldStatus = $healthCareWorker->status;
            
            $healthCareWorker->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => User::class,
                'model_id' => $healthCareWorker->id,
                'old_status' => $oldStatus,
                'new_status' => 'approved',
                'action' => 'approve',
                'reason' => null,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $healthCareWorker,
                $oldStatus,
                'approved',
                'approve',
                null,
                $healthCareWorker->care_home_id
            );

            // Send email notification
            try {
                Mail::to($healthCareWorker->email)->send(
                    new UserStatusChanged($healthCareWorker, $oldStatus, 'approved', 'approve')
                );
            } catch (\Exception $e) {
                Log::error('Failed to send user status email', [
                    'error' => $e->getMessage(),
                    'user_email' => $healthCareWorker->email,
                ]);
            }

            return redirect()->back()->with('success', 'Healthcare worker approved successfully');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to approve healthcare worker: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Reject a health care worker
     */
    public function reject(Request $request, User $healthCareWorker)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $oldStatus = $healthCareWorker->status;
            
            $healthCareWorker->update([
                'status' => 'rejected',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => User::class,
                'model_id' => $healthCareWorker->id,
                'old_status' => $oldStatus,
                'new_status' => 'rejected',
                'action' => 'reject',
                'reason' => $request->reason,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $healthCareWorker,
                $oldStatus,
                'rejected',
                'reject',
                $request->reason,
                $healthCareWorker->care_home_id
            );

            // Send email notification
            try {
                Mail::to($healthCareWorker->email)->send(
                    new UserStatusChanged($healthCareWorker, $oldStatus, 'rejected', 'reject', $request->reason)
                );
            } catch (\Exception $e) {
                Log::error('Failed to send user status email', [
                    'error' => $e->getMessage(),
                    'user_email' => $healthCareWorker->email,
                ]);
            }

            return redirect()->back()->with('success', 'Healthcare worker rejected');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to reject healthcare worker: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Suspend a health care worker
     */
    public function suspend(Request $request, User $healthCareWorker)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $oldStatus = $healthCareWorker->status;
            
            $healthCareWorker->update([
                'status' => 'suspended',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => User::class,
                'model_id' => $healthCareWorker->id,
                'old_status' => $oldStatus,
                'new_status' => 'suspended',
                'action' => 'suspend',
                'reason' => $request->reason,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $healthCareWorker,
                $oldStatus,
                'suspended',
                'suspend',
                $request->reason,
                $healthCareWorker->care_home_id
            );

            return redirect()->back()->with('success', 'Healthcare worker suspended');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to suspend healthcare worker: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Unsuspend a health care worker
     */
    public function unsuspend(User $healthCareWorker)
    {
        try {
            $oldStatus = $healthCareWorker->status;
            
            $healthCareWorker->update([
                'status' => 'approved',
                'rejection_reason' => null,
            ]);

            // Log status change
            StatusChange::create([
                'model_type' => User::class,
                'model_id' => $healthCareWorker->id,
                'old_status' => $oldStatus,
                'new_status' => 'approved',
                'action' => 'unsuspend',
                'reason' => null,
                'changed_by' => auth()->id(),
            ]);

            // Log activity
            ActivityLogService::logStatusChange(
                $healthCareWorker,
                $oldStatus,
                'approved',
                'unsuspend',
                null,
                $healthCareWorker->care_home_id
            );

            return redirect()->back()->with('success', 'Healthcare worker unsuspended');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to unsuspend healthcare worker: ' . $e->getMessage(),
            ]);
        }
    }
}
