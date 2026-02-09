<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StripeConnectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Stripe\Exception\ApiErrorException;

class StripeController extends Controller
{
    protected StripeConnectService $stripeService;

    public function __construct(StripeConnectService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Initiate Stripe Connect onboarding
     */
    public function connect(): JsonResponse
    {
        $user = Auth::user();

        try {
            $result = $this->stripeService->createConnectAccount($user);

            if ($result['already_exists'] ?? false) {
                $status = $this->stripeService->updateAccountStatus($user);

                if (($status['onboarding_complete'] ?? false) === true) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Your Stripe account is already set up!',
                    ]);
                }
            }

            $session = $this->stripeService->createAccountSession($user);

            return response()->json([
                'success' => true,
                'client_secret' => $session['client_secret'] ?? null,
            ]);
        } catch (ApiErrorException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to initiate Stripe setup: ' . $e->getMessage(),
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred. Please try again.',
            ], 500);
        }
    }
}
