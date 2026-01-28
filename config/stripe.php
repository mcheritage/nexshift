<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Stripe API Keys
    |--------------------------------------------------------------------------
    |
    | Your Stripe API keys for accessing the Stripe API. You can find these
    | in your Stripe Dashboard under Developers > API keys.
    |
    */

    'secret_key' => env('STRIPE_SECRET_KEY'),
    'publishable_key' => env('STRIPE_PUBLISHABLE_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Stripe Connect Settings
    |--------------------------------------------------------------------------
    |
    | Settings for Stripe Connect integration. This allows your platform
    | to create connected accounts for your users.
    |
    */

    'connect' => [
        'client_id' => env('STRIPE_CONNECT_CLIENT_ID'),
        
        // The URL to redirect users back to after onboarding
        'return_url' => env('APP_URL') . '/worker/stripe/callback',
        
        // The URL to redirect users to if they exit onboarding early
        'refresh_url' => env('APP_URL') . '/worker/stripe/connect',
        
        // Account type for connected accounts (standard, express, or custom)
        'account_type' => env('STRIPE_CONNECT_ACCOUNT_TYPE', 'express'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Settings
    |--------------------------------------------------------------------------
    |
    | Stripe webhook configuration for receiving event notifications.
    |
    */

    'webhook' => [
        'secret' => env('STRIPE_WEBHOOK_SECRET'),
        'tolerance' => env('STRIPE_WEBHOOK_TOLERANCE', 300),
    ],

];
