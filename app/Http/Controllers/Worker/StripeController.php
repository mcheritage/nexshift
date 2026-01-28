<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Services\StripeConnectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Stripe\Exception\ApiErrorException;

class StripeController extends Controller
{
    protected StripeConnectService $stripeService;

    public function __construct(StripeConnectService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Show the Stripe Connect setup page
     *
     * @return Response
     */
    public function index(): Response
    {
        $user = Auth::user();

        try {
            $accountStatus = null;
            
            if ($user->stripe_account_id) {
                $accountStatus = $this->stripeService->updateAccountStatus($user);
            }

            return Inertia::render('Worker/Stripe/Connect', [
                'stripeConnected' => (bool) $user->stripe_account_id,
                'onboardingComplete' => (bool) $user->stripe_onboarding_complete,
                'accountStatus' => $accountStatus,
            ]);

        } catch (\Exception $e) {
            return Inertia::render('Worker/Stripe/Connect', [
                'stripeConnected' => false,
                'onboardingComplete' => false,
                'error' => 'Unable to retrieve account status. Please try again.',
            ]);
        }
    }

    /**
     * Initiate Stripe Connect onboarding
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function connect(): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        try {
            // Create or retrieve Stripe account
            $result = $this->stripeService->createConnectAccount($user);

            // If onboarding is already complete
            if ($result['already_exists'] ?? false) {
                $status = $this->stripeService->updateAccountStatus($user);
                
                if ($status['onboarding_complete']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Your Stripe account is already set up!',
                        'redirect' => route('worker.stripe.index'),
                    ]);
                }
            }

            // Generate onboarding link
            $onboardingUrl = $this->stripeService->generateAccountLink($user);

            // Return URL for frontend redirect
            return response()->json([
                'success' => true,
                'url' => $onboardingUrl,
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

    /**
     * Handle callback from Stripe after onboarding
     *
     * @return RedirectResponse
     */
    public function callback(): RedirectResponse
    {
        $user = Auth::user();

        try {
            // Update account status
            $status = $this->stripeService->updateAccountStatus($user);

            if ($status['onboarding_complete']) {
                return redirect()
                    ->route('worker.dashboard')
                    ->with('success', 'Stripe account successfully connected! You can now receive payments.');
            }

            // If onboarding is not complete
            if (isset($status['requirements']) && !empty($status['requirements']->currently_due)) {
                return redirect()
                    ->route('worker.stripe.index')
                    ->with('warning', 'Additional information is required to complete your Stripe setup. Please continue the onboarding process.');
            }

            return redirect()
                ->route('worker.stripe.index')
                ->with('info', 'Please complete the Stripe onboarding process to start receiving payments.');

        } catch (\Exception $e) {
            return redirect()
                ->route('worker.stripe.index')
                ->with('error', 'Unable to verify account status. Please try again.');
        }
    }

    /**
     * Refresh/restart the onboarding process
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        if (!$user->stripe_account_id) {
            return response()->json([
                'success' => false,
                'redirect' => route('worker.stripe.connect'),
            ]);
        }

        try {
            $onboardingUrl = $this->stripeService->generateAccountLink($user);

            return response()->json([
                'success' => true,
                'url' => $onboardingUrl,
            ]);

        } catch (ApiErrorException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to generate onboarding link: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate and redirect to Stripe Express Dashboard
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function dashboard(): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        if (!$user->stripe_account_id) {
            return response()->json([
                'success' => false,
                'message' => 'You need to connect your Stripe account first.',
            ], 400);
        }

        if (!$user->stripe_onboarding_complete) {
            return response()->json([
                'success' => false,
                'message' => 'Please complete the Stripe onboarding process first.',
            ], 400);
        }

        try {
            $dashboardUrl = $this->stripeService->generateDashboardLink($user);

            return response()->json([
                'success' => true,
                'url' => $dashboardUrl,
            ]);

        } catch (ApiErrorException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to access Stripe dashboard: ' . $e->getMessage(),
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current account status (API endpoint)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function status(): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        if (!$user->stripe_account_id) {
            return response()->json([
                'connected' => false,
                'onboarding_complete' => false,
            ]);
        }

        try {
            $status = $this->stripeService->updateAccountStatus($user);

            return response()->json($status);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Unable to retrieve account status',
            ], 500);
        }
    }

    /**
     * Disconnect Stripe account
     *
     * @return RedirectResponse
     */
    public function disconnect(): RedirectResponse
    {
        $user = Auth::user();

        if (!$user->stripe_account_id) {
            return redirect()
                ->route('worker.stripe.index')
                ->with('info', 'No Stripe account is connected.');
        }

        // Note: You may want to add additional logic here to handle
        // any pending payouts or transactions before disconnecting

        $user->update([
            'stripe_account_id' => null,
            'stripe_onboarding_complete' => false,
            'stripe_account_type' => null,
            'stripe_connected_at' => null,
            'stripe_charges_enabled' => false,
            'stripe_payouts_enabled' => false,
        ]);

        return redirect()
            ->route('worker.stripe.index')
            ->with('success', 'Stripe account disconnected successfully.');
    }
}
