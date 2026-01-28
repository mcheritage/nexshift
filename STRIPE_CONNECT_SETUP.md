# Stripe Connect Integration - Setup Guide

This guide will help you complete the Stripe Connect integration for your NexShift platform.

## Overview

The Stripe Connect integration allows healthcare workers (carers) to:
- Create a Stripe Connect account from their dashboard
- Complete onboarding through Stripe's secure interface
- Receive payments directly to their bank account
- Access their Stripe dashboard for transaction history

## What Has Been Implemented

### 1. Backend Components

#### Database Migration
- **File**: `database/migrations/2026_01_28_011713_add_stripe_fields_to_users_table.php`
- **Fields Added**:
  - `stripe_account_id` - Stores the Stripe Connect account ID
  - `stripe_onboarding_complete` - Boolean flag for onboarding status
  - `stripe_account_type` - Type of Stripe account (express/standard/custom)
  - `stripe_connected_at` - Timestamp when account was fully connected
  - `stripe_charges_enabled` - Whether the account can accept charges
  - `stripe_payouts_enabled` - Whether the account can receive payouts

#### Configuration
- **File**: `config/stripe.php`
- Contains all Stripe-related configuration including API keys, Connect settings, and webhook configuration

#### Service Class
- **File**: `app/Services/StripeConnectService.php`
- **Methods**:
  - `createConnectAccount($user)` - Creates a new Stripe Connect account
  - `generateAccountLink($user)` - Generates onboarding URL
  - `updateAccountStatus($user)` - Syncs account status with Stripe
  - `generateDashboardLink($user)` - Creates Stripe dashboard access link
  - `needsOnboarding($user)` - Checks if user needs to complete onboarding
  - `getAccountBalance($user)` - Retrieves account balance

#### Controller
- **File**: `app/Http/Controllers/Worker/StripeController.php`
- **Routes & Methods**:
  - `GET /worker/stripe` - Show Stripe Connect page (index)
  - `GET /worker/stripe/connect` - Initiate Connect account creation and redirect to Stripe
  - `GET /worker/stripe/callback` - Handle return from Stripe after onboarding
  - `GET /worker/stripe/refresh` - Restart onboarding if user exits early
  - `GET /worker/stripe/dashboard` - Redirect to Stripe Express Dashboard
  - `GET /worker/stripe/status` - Get current account status (API)
  - `POST /worker/stripe/disconnect` - Disconnect Stripe account

#### Model Updates
- **File**: `app/Models/User.php`
- **New Methods**:
  - `hasStripeAccount()` - Check if user has Stripe account
  - `hasCompletedStripeOnboarding()` - Check if onboarding is complete
  - `canReceivePayments()` - Check if user can receive payments
  - `getStripeStatus()` - Get overall Stripe connection status

### 2. Frontend Components

#### React Component
- **File**: `resources/js/pages/Worker/Stripe/Connect.tsx`
- Beautiful, responsive UI showing:
  - Current connection status with color-coded badges
  - Setup instructions and requirements
  - Connect/Continue/Dashboard buttons based on status
  - Account capabilities (charges, payouts)
  - Informational content about Stripe Connect

## Setup Instructions

### Step 1: Configure Stripe Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API keys**
3. Copy your keys and add them to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### Step 2: Enable Stripe Connect

1. In Stripe Dashboard, go to **Settings > Connect**
2. Enable Connect for your account
3. Complete the platform profile if not already done
4. Go to **Settings > Connect > Settings**
5. Copy your **Client ID** and add it to `.env`:

```env
STRIPE_CONNECT_CLIENT_ID=ca_your_client_id_here
```

### Step 3: Configure Redirect URLs

In your Stripe Connect Settings, add the following URLs:

**Redirect URIs:**
- `http://nexshift.test/worker/stripe/callback` (for local development)
- `https://yourdomain.com/worker/stripe/callback` (for production)

Update your `.env` file with the correct APP_URL:
```env
APP_URL=http://nexshift.test  # or your production URL
```

### Step 4: Set Account Type (Optional)

The default account type is "Express" which is recommended for most use cases. You can change this in `.env`:

```env
STRIPE_CONNECT_ACCOUNT_TYPE=express  # Options: express, standard, custom
```

**Account Types:**
- **Express** (Recommended): Stripe handles onboarding, provides dashboard, best for platforms
- **Standard**: Users have full Stripe accounts, more independence
- **Custom**: Full control but more compliance responsibility

### Step 5: Configure Country (Important!)

Edit `app/Services/StripeConnectService.php` line 40 to match your location:

```php
'country' => 'GB', // Change to your country code (US, GB, CA, etc.)
```

### Step 6: Run Database Migration

Make sure your database is set up and running, then run:

```bash
php artisan migrate
```

This will add the Stripe fields to your `users` table.

### Step 7: Update Your .env File

Add all the Stripe configuration to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_CONNECT_CLIENT_ID=ca_your_client_id_here
STRIPE_CONNECT_ACCOUNT_TYPE=express
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 8: Test the Integration

1. Log in as a healthcare worker (carer)
2. Navigate to `/worker/stripe` or add a link in your dashboard
3. Click "Connect with Stripe"
4. Complete the Stripe onboarding process
5. Verify you're redirected back to your dashboard with a success message

## User Flow

### For Carers (Healthcare Workers)

1. **Initial State**: User sees "Connect with Stripe" button with requirements list
2. **Click Connect**: System creates Stripe account and redirects to Stripe onboarding
3. **Stripe Onboarding**: User completes identity verification and bank details on Stripe
4. **Return to Platform**: User is redirected back to dashboard with success message
5. **Active State**: User can now access Stripe dashboard and receive payments

### Onboarding States

- **Not Connected**: No Stripe account created
- **Pending Setup**: Account created but onboarding incomplete
- **Incomplete Setup**: Onboarding done but charges/payouts not enabled
- **Active**: Fully set up and can receive payments

## Adding Navigation Link

To add a link to the Stripe Connect page in your worker dashboard, update the navigation component:

```tsx
<Link href={route('worker.stripe.index')}>
  Payment Setup
</Link>
```

## Webhook Setup (For Production)

To receive real-time updates from Stripe:

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Add endpoint: `https://yourdomain.com/webhooks/stripe`
3. Select events to listen for:
   - `account.updated`
   - `account.application.deauthorized`
   - `capability.updated`
4. Copy the webhook signing secret and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Security Considerations

✅ **Already Implemented:**
- Stripe API keys stored in environment variables
- User authentication required for all routes
- Role-based access (health_care_worker middleware)
- Secure HTTPS redirects in production
- Account ownership verification

⚠️ **Additional Recommendations:**
- Enable 2FA for your Stripe account
- Regularly review connected accounts
- Monitor for suspicious activity
- Keep Stripe PHP SDK updated
- Use rate limiting on Connect routes
- Implement webhook signature verification for production

## Testing

### Test Mode
- Use test API keys (starting with `sk_test_` and `pk_test_`)
- Use Stripe's test data for onboarding
- No real money is processed in test mode

### Test Data for Stripe Onboarding
When testing in Stripe's onboarding:
- **SSN**: Use `000000000`
- **Phone**: Use any valid format
- **DOB**: Use any date making user 18+
- **Bank Account**: Use test account numbers from [Stripe Testing Docs](https://stripe.com/docs/connect/testing)

## Production Checklist

Before going live:

- [ ] Replace test API keys with live keys
- [ ] Update redirect URLs to production domain
- [ ] Configure webhooks endpoint
- [ ] Test full flow with live mode
- [ ] Set up Stripe webhook monitoring
- [ ] Configure payout schedule in Stripe
- [ ] Review Stripe fees and pricing
- [ ] Ensure HTTPS is enabled
- [ ] Test error handling scenarios
- [ ] Document support process for payment issues

## Troubleshooting

### "Invalid client_id"
- Verify your STRIPE_CONNECT_CLIENT_ID is correct
- Ensure Connect is enabled in your Stripe account

### "Country not supported"
- Check the country code in StripeConnectService.php
- Verify the country is supported by Stripe Connect

### "Redirect URI mismatch"
- Add your callback URL to Stripe Connect settings
- Ensure APP_URL in .env matches your domain

### Database errors during migration
- Ensure your database is created and accessible
- Check database credentials in .env
- Run `php artisan config:clear` before migrating

## Support Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Connect Onboarding](https://stripe.com/docs/connect/onboarding)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Support](https://support.stripe.com/)

## Next Steps

After completing the integration:

1. **Implement Payment Processing**: Create charges when timesheets are approved
2. **Add Webhooks**: Handle real-time updates from Stripe
3. **Transaction History**: Show payment history in worker finances
4. **Payout Schedule**: Configure and display payout information
5. **Fee Structure**: Implement and document platform fees
6. **Dispute Handling**: Add support for payment disputes

## Files Created/Modified

### Created:
- `app/Services/StripeConnectService.php`
- `app/Http/Controllers/Worker/StripeController.php`
- `resources/js/pages/Worker/Stripe/Connect.tsx`
- `config/stripe.php`
- `database/migrations/2026_01_28_011713_add_stripe_fields_to_users_table.php`
- `.env.example` (updated)
- `STRIPE_CONNECT_SETUP.md`

### Modified:
- `routes/web.php` (added Stripe routes)
- `app/Models/User.php` (added Stripe fields and methods)
- `composer.json` (added Stripe PHP SDK)

## Questions?

If you encounter any issues during setup, please check:
1. All environment variables are correctly set
2. Database migration has run successfully
3. Stripe account has Connect enabled
4. Redirect URLs match exactly
5. Using the correct API keys (test vs live)

Happy integrating! 🚀
