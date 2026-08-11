<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TrainingType;
use App\Models\User;
use App\Models\WorkerTraining;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminWorkerTrainingController extends Controller
{
    public function show(User $worker): Response
    {
        $trainingTypes = TrainingType::orderBy('is_mandatory', 'desc')->orderBy('name')->get();

        $uploaded = WorkerTraining::where('user_id', $worker->id)
            ->with(['trainingType', 'reviewer'])
            ->get()
            ->keyBy('training_type_id');

        $types = $trainingTypes->map(function ($type) use ($uploaded) {
            $record = $uploaded->get($type->id);
            return [
                'id'              => $type->id,
                'name'            => $type->name,
                'description'     => $type->description,
                'validity_months' => $type->validity_months,
                'is_mandatory'    => $type->is_mandatory,
                'is_active'       => $type->is_active,
                'training'        => $record ? [
                    'id'                        => $record->id,
                    'completed_at'              => $record->completed_at->format('Y-m-d'),
                    'expires_at'                => $record->expires_at->format('Y-m-d'),
                    'status'                    => $record->status,
                    'compliance_status'         => $record->compliance_status,
                    'rejection_reason'          => $record->rejection_reason,
                    'certificate_original_name' => $record->certificate_original_name,
                    'has_certificate'           => (bool) $record->certificate_path,
                    'notes'                     => $record->notes,
                    'reviewed_at'               => $record->reviewed_at,
                    'reviewed_by'               => $record->reviewer ? [
                        'id'         => $record->reviewer->id,
                        'first_name' => $record->reviewer->first_name,
                        'last_name'  => $record->reviewer->last_name,
                    ] : null,
                ] : null,
            ];
        });

        return Inertia::render('admin/worker-trainings/show', [
            'worker'        => [
                'id'         => $worker->id,
                'first_name' => $worker->first_name,
                'last_name'  => $worker->last_name,
            ],
            'trainingTypes' => $types,
        ]);
    }

    public function approve(User $worker, WorkerTraining $workerTraining): RedirectResponse
    {
        abort_unless($workerTraining->user_id === $worker->id, 404);

        $reviewerId = auth()->user()?->id;

        $workerTraining->update([
            'status'           => 'approved',
            'rejection_reason' => null,
            'reviewed_by'      => $reviewerId,
            'reviewed_at'      => now(),
        ]);

        ActivityLogService::log(
            action: 'training_approved',
            description: "Training '{$workerTraining->trainingType->name}' approved for {$worker->first_name} {$worker->last_name}",
            subject: $workerTraining,
            properties: ['training_type' => $workerTraining->trainingType->name, 'worker_id' => $worker->id, 'worker_name' => "{$worker->first_name} {$worker->last_name}"],
        );

        return redirect()->back()->with('success', 'Training approved.');
    }

    public function reject(Request $request, User $worker, WorkerTraining $workerTraining): RedirectResponse
    {
        abort_unless($workerTraining->user_id === $worker->id, 404);

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $reviewerId = auth()->user()?->id;

        $workerTraining->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
            'reviewed_by'      => $reviewerId,
            'reviewed_at'      => now(),
        ]);

        ActivityLogService::log(
            action: 'training_rejected',
            description: "Training '{$workerTraining->trainingType->name}' rejected for {$worker->first_name} {$worker->last_name}",
            subject: $workerTraining,
            properties: ['training_type' => $workerTraining->trainingType->name, 'worker_id' => $worker->id, 'worker_name' => "{$worker->first_name} {$worker->last_name}", 'reason' => $request->reason],
        );

        return redirect()->back()->with('success', 'Training rejected.');
    }

    public function download(User $worker, WorkerTraining $workerTraining): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        abort_unless($workerTraining->user_id === $worker->id, 404);

        if (!$workerTraining->certificate_path || !Storage::disk('private')->exists($workerTraining->certificate_path)) {
            abort(404, 'Certificate not found.');
        }

        return Storage::disk('private')->download(
            $workerTraining->certificate_path,
            $workerTraining->certificate_original_name ?? 'certificate'
        );
    }
}
