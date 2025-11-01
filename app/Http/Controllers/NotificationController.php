<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for authenticated user
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        
        \Log::info('NotificationController index called', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_role' => $user->role,
        ]);
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        \Log::info('Notifications fetched', [
            'count' => $notifications->count(),
            'unread_count' => $unreadCount,
        ]);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification): JsonResponse
    {
        $user = Auth::user();

        // Ensure user owns this notification
        if ($notification->user_id !== $user->id) {
            abort(403, 'Access denied');
        }

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Delete a notification
     */
    public function destroy(Notification $notification): JsonResponse
    {
        $user = Auth::user();

        // Ensure user owns this notification
        if ($notification->user_id !== $user->id) {
            abort(403, 'Access denied');
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted',
        ]);
    }

    /**
     * Get unread notification count
     */
    public function unreadCount(): JsonResponse
    {
        $user = Auth::user();

        $count = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return response()->json([
            'count' => $count,
        ]);
    }
}
