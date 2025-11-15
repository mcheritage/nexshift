<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display activity logs
     */
    public function index(Request $request): Response
    {
        $query = ActivityLog::with(['user', 'careHome', 'subject'])
            ->orderBy('created_at', 'desc');

        // Filter by action
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by care home
        if ($request->filled('care_home_id')) {
            $query->where('care_home_id', $request->care_home_id);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search in description
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $activityLogs = $query->paginate(50)->through(function ($log) {
            $subjectData = null;
            
            if ($log->subject) {
                $subjectData = [
                    'type' => class_basename($log->subject_type),
                    'id' => $log->subject_id,
                ];
                
                // Add specific fields based on subject type
                if ($log->subject_type === 'App\\Models\\User') {
                    $subjectData['name'] = "{$log->subject->first_name} {$log->subject->last_name}";
                    $subjectData['email'] = $log->subject->email;
                } elseif ($log->subject_type === 'App\\Models\\CareHome') {
                    $subjectData['name'] = $log->subject->name;
                } elseif ($log->subject_type === 'App\\Models\\Document') {
                    $subjectData['type_label'] = $log->subject->document_type ?? 'Document';
                    $subjectData['file_name'] = $log->subject->original_name ?? null;
                } elseif ($log->subject_type === 'App\\Models\\Shift') {
                    $subjectData['title'] = $log->subject->title;
                    $subjectData['date'] = $log->subject->shift_date;
                }
            }
            
            return [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                'subject_id' => $log->subject_id,
                'subject' => $subjectData,
                'properties' => $log->properties,
                'created_at' => $log->created_at->toDateTimeString(),
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => "{$log->user->first_name} {$log->user->last_name}",
                    'email' => $log->user->email,
                ] : null,
                'care_home' => $log->careHome ? [
                    'id' => $log->careHome->id,
                    'name' => $log->careHome->name,
                ] : null,
            ];
        });

        // Get unique actions for filter
        $actions = ActivityLog::select('action')
            ->distinct()
            ->pluck('action')
            ->sort()
            ->values();

        return Inertia::render('admin/activity-logs/index', [
            'activityLogs' => $activityLogs,
            'actions' => $actions,
            'filters' => $request->only(['action', 'user_id', 'care_home_id', 'from_date', 'to_date', 'search']),
        ]);
    }
}
