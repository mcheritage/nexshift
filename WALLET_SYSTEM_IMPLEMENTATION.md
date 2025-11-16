# Wallet System Implementation Summary

## Overview
Complete wallet/payment system implementation for NexShift application with:
- Admin manual credit/debit with proof documents
- Automatic invoice creation on timesheet approval
- Care home invoice payment from wallet
- Worker payment receipt to wallet
- Complete transaction history and audit trail

## Backend Implementation (✅ Complete)

### Database Migrations
1. **wallets table** (`2025_11_15_235203_create_wallets_table.php`)
   - Polymorphic ownership (owner_type, owner_id)
   - Balance tracking (balance, total_credited, total_debited)
   - Currency support (default: GBP)

2. **transactions table** (`2025_11_15_235307_create_transactions_table.php`)
   - Transaction ID (UUID)
   - Type (credit/debit)
   - Category (manual_credit, manual_debit, invoice_payment, timesheet_payment, refund, adjustment, withdrawal)
   - Balance snapshots (before/after)
   - Proof file storage path
   - Related entities (invoice_id, timesheet_id, polymorphic relations)
   - Performed by tracking

3. **invoices table update** (`2025_11_15_235314_add_invoice_payment_fields_to_invoices_table.php`)
   - Payment method, transaction_id, paid_by_user_id, payment_notes

### Models
1. **Wallet.php** (`app/Models/Wallet.php`)
   - `credit($amount, $category, $description, ...)` - Add funds with DB transaction
   - `debit($amount, ...)` - Deduct funds with balance check
   - `hasSufficientBalance($amount)` - Validation
   - `getOrCreateFor($owner)` - Auto-create wallet for any owner

2. **Transaction.php** (`app/Models/Transaction.php`)
   - Category constants and display names
   - Scopes: credits(), debits(), completed()
   - Relationships: wallet, performedBy, invoice, timesheet

3. **User.php & CareHome.php** - Added wallet() morphOne relationship

### Controllers
1. **Admin/WalletManagementController.php**
   - `index()` - List all wallets with stats
   - `show()` - Wallet details with transaction history
   - `creditForm()` / `credit()` - Manual credit with proof upload
   - `debitForm()` / `debit()` - Manual debit with balance validation
   - `downloadProof()` - Download proof documents from private storage

2. **CareHome/FinancesController.php**
   - `index()` - Dashboard with balance, unpaid invoices, transactions
   - `payInvoice()` - Pay invoice (DB transaction: debit care home, credit workers, mark paid)
   - `invoices()` - List all invoices
   - `showInvoice()` - Invoice details

3. **Worker/FinancesController.php**
   - `index()` - Dashboard with balance, earnings breakdown, transaction history
   - `showTransaction()` - Transaction details with related shift/invoice

4. **TimesheetController.php** (Updated)
   - `approve()` - Wrapped in DB transaction, auto-creates invoice

### Routes (routes/web.php)
**Admin:**
- `/admin/wallets` - List all wallets
- `/admin/wallets/{wallet}` - Wallet details
- `/admin/wallets/{ownerType}/{ownerId}/credit` - Credit form
- `/admin/wallets/credit` (POST) - Process credit
- `/admin/wallets/{ownerType}/{ownerId}/debit` - Debit form
- `/admin/wallets/debit` (POST) - Process debit
- `/admin/transactions/{transaction}/proof` - Download proof

**Care Home:**
- `/finances` - Dashboard
- `/finances/invoices` - List invoices
- `/finances/invoices/{invoice}` - Invoice details
- `/finances/invoices/{invoice}/pay` (POST) - Pay invoice

**Worker:**
- `/worker/finances` - Dashboard
- `/worker/finances/transactions/{transaction}` - Transaction details

## Frontend Implementation (✅ Complete)

### Admin Pages
1. **admin/wallets/index.tsx** (316 lines)
   - 4 stats cards: Total Wallets, Total Balance, Total Credited, Total Debited
   - Wallet listing table with owner info, balances, actions
   - Color-coded balances (green >£1000, gray >£0, red ≤£0)
   - Action buttons: View, Credit (green), Debit (red)

2. **admin/wallets/show.tsx** (280 lines)
   - Wallet header with owner info
   - 4 stats cards: Current Balance, Total Credits, Total Debits, Transaction Count
   - Transaction history table with all details
   - Proof document download links
   - Credit/Debit action buttons

3. **admin/wallets/credit.tsx** (240 lines)
   - Amount input with £ prefix (step 0.01, min 0.01, max 1000000)
   - Reason textarea (500 char limit with counter)
   - Optional proof file upload (PDF/JPG/PNG, max 5MB)
   - Current balance alert (blue)
   - New balance preview (green)
   - Validation and error handling

4. **admin/wallets/debit.tsx** (262 lines)
   - Similar to credit form but red themed
   - Real-time insufficient balance validation
   - Max amount capped at current balance
   - Low balance warning (<£100)
   - New balance preview (yellow/red if negative)
   - Disabled submit when insufficient balance

### Care Home Pages
1. **carehome/finances/index.tsx** (320 lines)
   - 4 stats cards: Wallet Balance, Pending Invoices, Monthly Spent, Transactions
   - Low balance warning alert (<£100)
   - Unpaid invoices table with overdue badges
   - "Pay Now" buttons (disabled when insufficient balance)
   - Recent transactions table

2. **carehome/finances/invoice-details.tsx** (385 lines)
   - Invoice summary (dates, subtotal, tax, total)
   - Overdue warning alert (red)
   - Insufficient balance warning (yellow)
   - Timesheet breakdown table (workers, shifts, amounts)
   - Payment confirmation dialog with balance preview
   - Current wallet balance display
   - "Paid" status badge for completed payments

### Worker Pages
1. **worker/finances/index.tsx** (368 lines)
   - Prominent wallet balance card (green gradient)
   - 4 stats cards: Wallet Balance, Total Earned, Monthly Earnings, Transactions
   - Earnings breakdown by category:
     - Timesheet Payments (primary, green)
     - Manual Credits (admin, blue)
     - Refunds (other, purple)
   - Transaction history table with view details button
   - Color-coded categories and amounts
   - Empty state with helpful message

2. **worker/finances/transaction-details.tsx** (310 lines)
   - Transaction summary (date/time, amount with +/-, balance before/after)
   - Description and optional reason
   - Performed by information (for manual transactions)
   - Proof document download link
   - Related timesheet card:
     - Shift details (title, times)
     - Care home name
     - Total pay
   - Related invoice card:
     - Invoice number
     - Status badge
     - Invoice total

## Payment Flow

### 1. Timesheet Approval → Invoice Creation
```
Worker submits timesheet → Care home approves → TimesheetController::approve()
  ├─ DB::transaction start
  ├─ Update timesheet (status: approved, approved_by, approved_at)
  ├─ Create Invoice (auto-generated number: INV-YYYY-###)
  │   ├─ period_start/end from timesheet
  │   ├─ subtotal/total = timesheet.total_pay
  │   ├─ status: SENT, due_date: +7 days
  ├─ Attach timesheet to invoice (pivot table)
  ├─ Log activity
  ├─ Send email to worker
  └─ DB::transaction commit
```

### 2. Invoice Payment → Worker Credit
```
Care home clicks "Pay Now" → FinancesController::payInvoice()
  ├─ Verify ownership & payment status
  ├─ DB::transaction start
  ├─ Debit care home wallet (invoice.total)
  │   └─ Creates transaction (category: invoice_payment)
  ├─ For each timesheet in invoice:
  │   ├─ Credit worker wallet (timesheet.total_pay)
  │   └─ Creates transaction (category: timesheet_payment)
  ├─ Update invoice (status: PAID, payment details)
  ├─ Log activity
  └─ DB::transaction commit
  
Result: Care home balance decreases, workers' balances increase atomically
```

### 3. Admin Manual Credit/Debit
```
Admin clicks Credit/Debit → WalletManagementController
  ├─ Validate amount, reason
  ├─ Upload proof file to storage/app/private/wallet-proofs
  ├─ Call $wallet->credit() or $wallet->debit()
  │   ├─ DB::transaction start
  │   ├─ Update wallet balance
  │   ├─ Create transaction record
  │   │   ├─ balance_before/after snapshots
  │   │   ├─ proof_file_path
  │   │   ├─ performed_by (admin user)
  │   │   ├─ category: manual_credit or manual_debit
  │   └─ DB::transaction commit
  └─ Redirect with success message
```

## UI/UX Patterns

### Color Scheme
- **Green**: Credits, earnings, positive balances (>£1000), success states
- **Red**: Debits, spending, negative/low balances, warnings
- **Blue**: Info alerts, admin actions
- **Yellow**: Pending status, overdue warnings
- **Purple**: Refunds
- **Gray**: Neutral info

### Currency Formatting
```typescript
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
    }).format(amount);
};
```

### Date Formatting (date-fns)
```typescript
format(new Date(date), 'MMM dd, yyyy HH:mm')
format(new Date(date), 'MMMM dd, yyyy')
```

### Icons (lucide-react)
- Wallet - Wallet balance
- TrendingUp - Credits, earnings growth
- TrendingDown - Debits, spending
- FileText - Invoices
- Activity - Transactions
- CreditCard - Card/payment related
- DollarSign - Money/earnings
- Clock - Timesheets
- Building2 - Care homes
- User - Workers
- Upload - File uploads
- Download - File downloads
- AlertCircle - Info/warning alerts
- CheckCircle - Success states

### Component Usage
- **Card** - Main content containers
- **Table** - Data listings
- **Badge** - Status indicators
- **Button** - Actions
- **Input** - Text/number fields
- **Textarea** - Long text
- **Alert** - Warnings/info messages
- **Dialog** - Confirmation modals

## Testing Checklist

### Backend
- [ ] Timesheet approval creates invoice
- [ ] Invoice payment debits care home wallet
- [ ] Invoice payment credits worker wallets atomically
- [ ] Admin credit adds funds correctly
- [ ] Admin debit checks balance before deducting
- [ ] Insufficient balance throws exception
- [ ] Proof files upload to private storage
- [ ] Transaction history displays correctly

### Frontend
- [ ] Admin can view all wallets
- [ ] Admin can credit/debit with proof upload
- [ ] Care home sees wallet balance on dashboard
- [ ] Care home sees unpaid invoices
- [ ] Care home can pay invoice with confirmation
- [ ] Payment button disabled when insufficient balance
- [ ] Worker sees wallet balance prominently
- [ ] Worker sees earnings breakdown
- [ ] Worker sees transaction history
- [ ] Transaction details show related shift/invoice
- [ ] All currency formatting correct (£ symbol)
- [ ] All date formatting consistent
- [ ] Empty states display properly

## Next Steps (Future Enhancements)

1. **Wallet Balance in Navigation**
   - Add balance display to Header component for care homes and workers
   - Real-time updates after transactions

2. **Transaction Filtering**
   - Date range filters
   - Category filters
   - Search by description

3. **Bank Withdrawal**
   - Worker withdrawal request form
   - Admin approval workflow
   - Bank transfer integration

4. **Invoice Reminders**
   - Automated email reminders for overdue invoices
   - Scheduled job to check due dates

5. **Wallet Top-up**
   - Stripe/PayPal integration
   - Admin manual top-up notification to care homes

6. **Reports & Analytics**
   - Monthly financial reports
   - Earnings trends for workers
   - Spending analytics for care homes

7. **Audit Trail UI**
   - Comprehensive admin view of all financial activities
   - Export to CSV/PDF

## File Locations

### Backend
- Models: `app/Models/Wallet.php`, `app/Models/Transaction.php`
- Controllers:
  - `app/Http/Controllers/Admin/WalletManagementController.php`
  - `app/Http/Controllers/CareHome/FinancesController.php`
  - `app/Http/Controllers/Worker/FinancesController.php`
- Migrations: `database/migrations/2025_11_15_*_*.php`

### Frontend
- Admin: `resources/js/pages/admin/wallets/*.tsx`
- Care Home: `resources/js/pages/carehome/finances/*.tsx`
- Worker: `resources/js/pages/worker/finances/*.tsx`

### Routes
- `routes/web.php` - All wallet and finances routes

## Database Schema

### wallets
- id, owner_type, owner_id (polymorphic)
- balance, total_credited, total_debited (decimal 15,2)
- currency (string, default 'GBP')
- timestamps, softDeletes

### transactions
- id, transaction_id (UUID unique)
- wallet_id (foreign key)
- type (enum: credit/debit)
- amount, balance_before, balance_after (decimal 15,2)
- category, description, reason (strings/text)
- proof_file_path (nullable)
- performed_by_id, performed_by_type (polymorphic nullable)
- related_model_id, related_model_type (polymorphic nullable)
- invoice_id, timesheet_id (uuid nullable)
- status (default 'completed'), completed_at
- metadata (text nullable)
- timestamps

### invoices (updated)
- payment_method, transaction_id, paid_by_user_id, payment_notes (nullable)

## Notes

- All financial operations use DB transactions for atomicity
- Balance checks happen before debits to prevent negative balances
- Proof documents stored in `storage/app/private/wallet-proofs`
- Transaction IDs are UUIDs for security
- All amounts use decimal(15,2) for precision
- Soft deletes on wallets preserve audit trail
