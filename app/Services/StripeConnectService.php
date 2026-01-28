<?php

namespace App\Services;

use App\Models\User;
use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\Log;

class StripeConnectService
{
    protected StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('stripe.secret_key'));
    }

    /**
     * Create a Stripe Connect account for a user
     *
     * @param User $user
     * @return array
     * @throws ApiErrorException
     */
    public function createConnectAccount(User $user): array
    {
        try {
            // Check if user already has a Stripe account
            if ($user->stripe_account_id) {
                $account = $this->stripe->accounts->retrieve($user->stripe_account_id);
                
                if ($account->details_submitted) {
                    return [
                        'success' => true,
                        'account_id' => $account->id,
                        'already_exists' => true,
                    ];
                }
            }

            // Create new Stripe Connect account
            $accountType = config('stripe.connect.account_type', 'express');
            
            $accountParams = [
                'type' => $accountType,
                'country' => 'GB', 
                'email' => $user->email,
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ],
                'business_type' => 'individual',
                'individual' => [
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                ],
                'metadata' => [
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                ],
            ];

            $account = $this->stripe->accounts->create($accountParams);

            // Update user with Stripe account ID
            $user->update([
                'stripe_account_id' => $account->id,
                'stripe_account_type' => $accountType,
            ]);

            Log::info('Stripe Connect account created', [
                'user_id' => $user->id,
                'stripe_account_id' => $account->id,
            ]);

            return [
                'success' => true,
                'account_id' => $account->id,
                'already_exists' => false,
            ];

        } catch (ApiErrorException $e) {
            Log::error('Stripe Connect account creation failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Generate an account link for onboarding
     *
     * @param User $user
     * @return string
     * @throws ApiErrorException
     */
    public function generateAccountLink(User $user): string
    {
        try {
            $accountLink = $this->stripe->accountLinks->create([
                'account' => $user->stripe_account_id,
                'refresh_url' => config('stripe.connect.refresh_url'),
                'return_url' => config('stripe.connect.return_url'),
                'type' => 'account_onboarding',
            ]);

            return $accountLink->url;

        } catch (ApiErrorException $e) {
            Log::error('Failed to generate account link', [
                'user_id' => $user->id,
                'stripe_account_id' => $user->stripe_account_id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Retrieve and update account status
     *
     * @param User $user
     * @return array
     * @throws ApiErrorException
     */
    public function updateAccountStatus(User $user): array
    {
        if (!$user->stripe_account_id) {
            return [
                'connected' => false,
                'onboarding_complete' => false,
            ];
        }

        try {
            $account = $this->stripe->accounts->retrieve($user->stripe_account_id);

            $onboardingComplete = $account->details_submitted ?? false;
            $chargesEnabled = $account->charges_enabled ?? false;
            $payoutsEnabled = $account->payouts_enabled ?? false;
            $requirements = $account->requirements ?? null;

            // Update user record
            $user->update([
                'stripe_onboarding_complete' => $onboardingComplete,
                'stripe_charges_enabled' => $chargesEnabled,
                'stripe_payouts_enabled' => $payoutsEnabled,
                'stripe_connected_at' => $onboardingComplete && !$user->stripe_connected_at 
                    ? now() 
                    : $user->stripe_connected_at,
                'stripe_requirements' => $requirements ? [
                    'currently_due' => $requirements->currently_due ?? [],
                    'eventually_due' => $requirements->eventually_due ?? [],
                    'past_due' => $requirements->past_due ?? [],
                    'pending_verification' => $requirements->pending_verification ?? [],
                    'disabled_reason' => $requirements->disabled_reason ?? null,
                ] : null,
            ]);

            return [
                'connected' => true,
                'onboarding_complete' => $onboardingComplete,
                'charges_enabled' => $chargesEnabled,
                'payouts_enabled' => $payoutsEnabled,
                'requirements' => $account->requirements ?? null,
            ];

        } catch (ApiErrorException $e) {
            Log::error('Failed to retrieve account status', [
                'user_id' => $user->id,
                'stripe_account_id' => $user->stripe_account_id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Generate a login link for the Stripe Express Dashboard
     *
     * @param User $user
     * @return string
     * @throws ApiErrorException
     */
    public function generateDashboardLink(User $user): string
    {
        if (!$user->stripe_account_id) {
            throw new \Exception('User does not have a Stripe account');
        }

        try {
            $loginLink = $this->stripe->accounts->createLoginLink($user->stripe_account_id);

            return $loginLink->url;

        } catch (ApiErrorException $e) {
            Log::error('Failed to generate dashboard link', [
                'user_id' => $user->id,
                'stripe_account_id' => $user->stripe_account_id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Check if user needs to complete onboarding
     *
     * @param User $user
     * @return bool
     */
    public function needsOnboarding(User $user): bool
    {
        if (!$user->stripe_account_id) {
            return true;
        }

        return !$user->stripe_onboarding_complete;
    }

    /**
     * Get account balance
     *
     * @param User $user
     * @return array
     * @throws ApiErrorException
     */
    public function getAccountBalance(User $user): array
    {
        if (!$user->stripe_account_id) {
            throw new \Exception('User does not have a Stripe account');
        }

        try {
            $balance = $this->stripe->balance->retrieve([
                'stripe_account' => $user->stripe_account_id,
            ]);

            return [
                'available' => $balance->available,
                'pending' => $balance->pending,
            ];

        } catch (ApiErrorException $e) {
            Log::error('Failed to retrieve account balance', [
                'user_id' => $user->id,
                'stripe_account_id' => $user->stripe_account_id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
