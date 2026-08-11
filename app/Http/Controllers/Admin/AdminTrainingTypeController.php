<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TrainingType;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminTrainingTypeController extends Controller
{
    public function index(): Response
    {
        $trainingTypes = TrainingType::orderBy('is_mandatory', 'desc')
            ->orderBy('name')
            ->withCount('workerTrainings')
            ->get();

        return Inertia::render('admin/training-types/index', [
            'trainingTypes' => $trainingTypes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'             => 'required|string|max:255|unique:training_types,name',
            'description'      => 'nullable|string|max:500',
            'validity_months'  => 'required|integer|min:1|max:120',
            'is_mandatory'     => 'required|boolean',
        ]);

        $trainingType = TrainingType::create([
            'name'            => $request->name,
            'description'     => $request->description,
            'validity_months' => $request->validity_months,
            'is_mandatory'    => $request->is_mandatory,
            'is_active'       => true,
        ]);

        ActivityLogService::log(
            action: 'training_type_created',
            description: "Training type '{$trainingType->name}' was created",
            subject: $trainingType,
            properties: ['name' => $trainingType->name, 'validity_months' => $trainingType->validity_months, 'is_mandatory' => $trainingType->is_mandatory],
        );

        return redirect()->back()->with('success', 'Training type created successfully.');
    }

    public function update(Request $request, TrainingType $trainingType): RedirectResponse
    {
        $request->validate([
            'name'            => 'required|string|max:255|unique:training_types,name,' . $trainingType->id,
            'description'     => 'nullable|string|max:500',
            'validity_months' => 'required|integer|min:1|max:120',
            'is_mandatory'    => 'required|boolean',
            'is_active'       => 'required|boolean',
        ]);

        $old = $trainingType->only(['name', 'description', 'validity_months', 'is_mandatory', 'is_active']);
        $trainingType->update($request->only(['name', 'description', 'validity_months', 'is_mandatory', 'is_active']));

        ActivityLogService::log(
            action: 'training_type_updated',
            description: "Training type '{$trainingType->name}' was updated",
            subject: $trainingType,
            properties: ['old' => $old, 'new' => $trainingType->only(['name', 'description', 'validity_months', 'is_mandatory', 'is_active'])],
        );

        return redirect()->back()->with('success', 'Training type updated successfully.');
    }

    public function destroy(TrainingType $trainingType): RedirectResponse
    {
        if ($trainingType->workerTrainings()->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'Cannot delete a training type that has worker records. Deactivate it instead.',
            ]);
        }

        $name = $trainingType->name;
        $trainingType->delete();

        ActivityLogService::log(
            action: 'training_type_deleted',
            description: "Training type '{$name}' was deleted",
            properties: ['name' => $name],
        );

        return redirect()->back()->with('success', 'Training type deleted.');
    }
}
