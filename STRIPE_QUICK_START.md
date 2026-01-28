# Stripe Connect Integration - Quick Start

## ✅ Implementation Complete!

Your Stripe Connect integration for NexShift has been successfully implemented. Here's what you need to do to start using it:

## 🚀 Quick Setup (5 minutes)

### 1. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API keys**
3. Copy your **Secret key** and **Publishable key**

### 2. Enable Stripe Connect

1. In Stripe Dashboard, go to **Settings > Connect**
2. If not enabled, enable Connect and complete your platform profile
3. You'll see **Onboarding options** section
4. Copy your **Test client ID** (starts with `ca_`)

### 3. Update Your .env File

Replace the placeholder values in your `.env` file with your actual Stripe keys:

```env
STRIPE_SECRET_KEY=sk_test_51...  # Your actual secret key
STRIPE_PUBLISHABLE_KEY=pk_test_51...  # Your actual publishable key
STRIPE_CONNECT_CLIENT_ID=ca_...  # Your actual client ID
```

### 4. Set Redirect URL in Stripe

In **Settings > Connect > Onboarding options**, add this redirect URI:
```
http://nexshift.test/worker/stripe/callback
```

(You mentioned you already added this - great! When going live, you'll add your production URL here too)

### 5. Update Country Code

Edit this file: `app/Services/StripeConnectService.php`

Line 40, change 'GB' to your country code:
```php
'country' => 'GB', // US, CA, GB, AU, etc.
```

### 6. Run Migration

```bash
php artisan migrate
```

## 🎯 How It Works

### For Carers (Healthcare Workers):

1. Navigate to `/worker/stripe` in your dashboard
2. Click "Connect with Stripe"
3. Complete Stripe onboarding (ID verification, bank details)
4. Get redirected back to your dashboard
5. Ready to receive payments!

### Routes Available:

- `GET /worker/stripe` - Stripe Connect setup page
- `GET /worker/stripe/connect` - Start connection process
- `GET /worker/stripe/callback` - Return from Stripe
- `GET /worker/stripe/dashboard` - Access Stripe dashboard
- `POST /worker/stripe/disconnect` - Disconnect account

## 📝 Adding to Navigation

To add a link in your worker dashboard, use:

```tsx
<Link href={route('worker.stripe.index')}>
  <CreditCard className="mr-2 h-4 w-4" />
  Payment Setup
</Link>
```

Or add as a button:

```tsx
<Button asChild>
  <Link href={route('worker.stripe.index')}>
    Setup Payments
  </Link>
</Button>
```

## 🧪 Testing

Use Stripe test mode:
- Test keys start with `sk_test_` and `pk_test_`
- Use test data during onboarding
- No real money is processed

Test data for onboarding:
- **SSN/Tax ID**: `000000000`
- **DOB**: Any date (18+ years old)
- **Bank**: Use Stripe test account numbers

## 📚 Documentation

See `STRIPE_CONNECT_SETUP.md` for:
- Detailed setup instructions
- Security considerations
- Webhook configuration
- Production checklist
- Troubleshooting guide

## 🔧 Files Created

### Backend:
- ✅ `app/Services/StripeConnectService.php` - Core Stripe logic
- ✅ `app/Http/Controllers/Worker/StripeController.php` - Handles requests
- ✅ `config/stripe.php` - Configuration
- ✅ `database/migrations/..._add_stripe_fields_to_users_table.php` - DB schema

### Frontend:
- ✅ `resources/js/pages/Worker/Stripe/Connect.tsx` - Beautiful UI

### Routes:
- ✅ Added 7 new routes in `routes/web.php`

### Model:
- ✅ Updated `app/Models/User.php` with Stripe methods

## 🎨 Features Included

✨ **User Experience:**
- Clean, intuitive interface
- Clear status indicators
- Step-by-step guidance
- Error handling with friendly messages

🔒 **Security:**
- Environment-based configuration
- Authentication required
- Role-based access control
- Secure API communication

💪 **Functionality:**
- Account creation
- Onboarding flow
- Dashboard access
- Status synchronization
- Account disconnection

## 📱 Next Steps

After setting up, you might want to:

1. **Add Payment Processing**: Create charges when timesheets are approved
2. **Configure Webhooks**: Get real-time updates from Stripe
3. **Display Balance**: Show earnings in worker dashboard
4. **Transaction History**: List past payments
5. **Payout Schedule**: Show when workers get paid

## 💡 Pro Tips

- Start with test mode before going live
- Test the full flow with a real worker account
- Configure payout schedule in Stripe settings
- Set up webhook monitoring for production
- Keep your Stripe PHP SDK updated

## ⚠️ Before Production

- [ ] Switch to live API keys
- [ ] Update redirect URLs to production domain
- [ ] Enable HTTPS
- [ ] Configure webhooks
- [ ] Test with real bank account details
- [ ] Review Stripe fees
- [ ] Set up monitoring

## 🆘 Need Help?

Check these resources:
- `STRIPE_CONNECT_SETUP.md` - Detailed setup guide
- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Stripe Support](https://support.stripe.com/)

## 🎉 You're Ready!

Everything is set up and ready to go. Just add your Stripe keys, run the migration, and start testing!

---

**Questions or issues?** Review the detailed setup guide in `STRIPE_CONNECT_SETUP.md`
