<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends BaseApiController
{
    /**
     * Get notification preferences
     */
    public function getPreferences(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $preferences = $user->notification_preferences ?? [
            'push_enabled' => true,
            'email_enabled' => true,
            'shift_reminders' => true,
            'application_updates' => true,
            'timesheet_updates' => true,
            'system_notifications' => true,
        ];
        
        return response()->json([
            'success' => true,
            'data' => $preferences,
        ]);
    }

    /**
     * Update notification preferences
     */
    public function updatePreferences(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $validated = $request->validate([
            'push_enabled' => 'sometimes|boolean',
            'email_enabled' => 'sometimes|boolean',
            'shift_reminders' => 'sometimes|boolean',
            'application_updates' => 'sometimes|boolean',
            'timesheet_updates' => 'sometimes|boolean',
            'system_notifications' => 'sometimes|boolean',
        ]);
        
        $currentPreferences = $user->notification_preferences ?? [];
        $preferences = array_merge($currentPreferences, $validated);
        
        $user->update([
            'notification_preferences' => $preferences,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Notification preferences updated successfully',
            'data' => $preferences,
        ]);
    }

    /**
     * Register OneSignal player ID
     */
    public function registerPlayerId(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $validated = $request->validate([
            'player_id' => 'required|string',
        ]);
        
        $user->update([
            'onesignal_player_id' => $validated['player_id'],
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Player ID registered successfully',
        ]);
    }

    /**
     * Get notification history
     */
    public function getNotificationHistory(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $query = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');
        
        // Filter by type if provided
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }
        
        $perPage = $request->get('per_page', 20);
        $notifications = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => [
                'notifications' => $notifications->items(),
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                ],
            ],
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        $validated = $request->validate([
            'notification_id' => 'required|integer|exists:notifications,id',
        ]);
        
        $notification = Notification::findOrFail($validated['notification_id']);
        
        // Ensure user owns this notification
        if ($notification->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }
        
        $notification->markAsRead();
        
        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Send test notification
     */
    public function sendTestNotification(Request $request)
    {
        $user = $this->requireAuthenticatedUser($request);
        
        Notification::create([
            'user_id' => $user->id,
            'type' => 'test',
            'title' => 'Test Notification',
            'message' => 'This is a test notification to verify your notification settings.',
            'data' => ['test' => true],
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Test notification sent successfully',
        ]);
    }
}


