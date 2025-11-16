<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    public function sendToUser(string $externalUserId, string $title, string $message, array $data = []): bool
    {
        $appId = config('services.onesignal.app_id');
        $apiKey = config('services.onesignal.api_key');
        $apiUrl = rtrim(config('services.onesignal.api_url'), '/');

        if (!$appId || !$apiKey) {
            Log::warning('OneSignal not configured. Skipping push.', [
                'has_app_id' => (bool) $appId,
                'has_api_key' => (bool) $apiKey,
            ]);
            return false;
        }

        $payload = [
            'app_id' => $appId,
            'include_aliases' => [
                'external_id' => [$externalUserId],
            ],
            'headings' => ['en' => $title],
            'contents' => ['en' => $message],
            'data' => $data,
            // iOS/Android options can be added here as needed
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$apiUrl}/notifications", $payload);

            if ($response->successful()) {
                return true;
            }

            Log::error('OneSignal push failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Exception while sending OneSignal push', [
                'error' => $e->getMessage(),
            ]);
        }

        return false;
    }
}


