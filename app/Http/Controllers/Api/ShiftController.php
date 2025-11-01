<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShiftResource;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ShiftController extends BaseApiController
{
    /**
     * Get available shifts for healthcare workers
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);
        
        // Only healthcare workers can view shifts
        if ($user->role !== 'health_worker') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = Shift::with(['careHome', 'selectedWorker'])
            ->available()
            ->orderBy('shift_date', 'asc')
            ->orderBy('start_time', 'asc');

        // Apply filters
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        if ($request->has('care_home_id') && $request->care_home_id) {
            $query->where('care_home_id', $request->care_home_id);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->where('shift_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->where('shift_date', '<=', $request->date_to);
        }

        if ($request->has('urgent_only') && $request->urgent_only) {
            $query->where('is_urgent', true);
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $shifts = $query->paginate($perPage);

        return response()->json([
            'data' => ShiftResource::collection($shifts->items()),
            'pagination' => [
                'current_page' => $shifts->currentPage(),
                'last_page' => $shifts->lastPage(),
                'per_page' => $shifts->perPage(),
                'total' => $shifts->total(),
                'has_more' => $shifts->hasMorePages(),
            ]
        ]);
    }

    /**
     * Get a specific shift
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $this->requireAuthenticatedUser($request);
        
        // Only healthcare workers can view shifts
        if ($user->role !== 'health_worker') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $shift = Shift::with(['careHome', 'selectedWorker', 'applications'])
            ->available()
            ->findOrFail($id);

        return response()->json([
            'data' => ShiftResource::make($shift)
        ]);
    }

    /**
     * Get shift roles for filtering
     */
    public function roles(): JsonResponse
    {
        return response()->json([
            'data' => Shift::getRoles()
        ]);
    }

    /**
     * Get available care homes for filtering
     */
    public function careHomes(): JsonResponse
    {
        $careHomes = \App\Models\CareHome::select('id', 'name')
            ->whereHas('shifts', function ($query) {
                $query->available();
            })
            ->get();

        return response()->json([
            'data' => $careHomes
        ]);
    }
}
