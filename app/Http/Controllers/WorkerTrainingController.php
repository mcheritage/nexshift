<?php

namespace App\Http\Controllers;

use App\Models\TrainingType;
use App\Models\WorkerTraining;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WorkerTrainingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $trainingTypes = TrainingType::active()->orderBy('is_mandatory', 'desc')->orderBy('name')->get();

        $uploaded = WorkerTraining::where('user_id', $user->id)
            ->with('trainingType')
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
                'training'        => $record ? [
                    'id'                       => $record->id,
                    'completed_at'             => $record->completed_at->format('Y-m-d'),
                    'expires_at'               => $record->expires_at->format('Y-m-d'),
                    'status'                   => $record->status,
                    'compliance_status'        => $record->compliance_status,
                    'rejection_reason'         => $record->rejection_reason,
                    'certificate_original_name'=> $record->certificate_original_name,
                    'has_certificate'          => (bool) $record->certificate_path,
                    'notes'                    => $record->notes,
                    'created_at'               => $record->created_at,
                ] : null,
            ];
        });

        return Inertia::render('Worker/Trainings', [
            'trainingTypes' => $types,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'training_type_id' => 'required|exists:training_types,id',
            'completed_at'     => 'required|date|before_or_equal:today',
            'certificate'      => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'notes'            => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $type = TrainingType::findOrFail($request->training_type_id);
        $expiresAt = Carbon::parse($request->completed_at)->addMonths($type->validity_months);

        $existing = WorkerTraining::where('user_id', $user->id)
            ->where('training_type_id', $type->id)
            ->first();

        $certificatePath = $existing?->certificate_path;
        $originalName = $existing?->certificate_original_name;

        if ($request->hasFile('certificate')) {
            if ($certificatePath && Storage::disk('private')->exists($certificatePath)) {
                Storage::disk('private')->delete($certificatePath);
            }
            $file = $request->file('certificate');
            $certificatePath = $file->store('trainings/workers/' . $user->id, 'private');
            $originalName = $file->getClientOriginalName();
        }

        if ($existing) {
            $existing->update([
                'completed_at'              => $request->completed_at,
                'expires_at'                => $expiresAt,
                'certificate_path'          => $certificatePath,
                'certificate_original_name' => $originalName,
                'notes'                     => $request->notes,
                'status'                    => 'pending',
                'rejection_reason'          => null,
                'reviewed_by'               => null,
                'reviewed_at'               => null,
            ]);
        } else {
            WorkerTraining::create([
                'user_id'                   => $user->id,
                'training_type_id'          => $type->id,
                'completed_at'              => $request->completed_at,
                'expires_at'                => $expiresAt,
                'certificate_path'          => $certificatePath,
                'certificate_original_name' => $originalName,
                'notes'                     => $request->notes,
                'status'                    => 'pending',
            ]);
        }

        return redirect()->back()->with('success', 'Training record saved successfully.');
    }

    public function destroy(WorkerTraining $workerTraining): RedirectResponse
    {
        if ($workerTraining->user_id !== request()->user()->id) {
            abort(403);
        }

        if ($workerTraining->certificate_path && Storage::disk('private')->exists($workerTraining->certificate_path)) {
            Storage::disk('private')->delete($workerTraining->certificate_path);
        }

        $workerTraining->delete();

        return redirect()->back()->with('success', 'Training record removed.');
    }

    public function download(WorkerTraining $workerTraining): mixed
    {
        $user = request()->user();

        if ($workerTraining->user_id !== $user->id) {
            abort(403);
        }

        if (!$workerTraining->certificate_path || !Storage::disk('private')->exists($workerTraining->certificate_path)) {
            abort(404, 'Certificate not found.');
        }

        return Storage::disk('private')->download(
            $workerTraining->certificate_path,
            $workerTraining->certificate_original_name ?? 'certificate'
        );
    }
}
