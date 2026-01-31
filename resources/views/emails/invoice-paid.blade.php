<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Paid</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Invoice Payment Successful</h1>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
            Your invoice has been paid successfully.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
            <h2 style="margin-top: 0; color: #10b981; font-size: 24px;">£{{ number_format($invoice->total, 2) }}</h2>
            <p style="margin: 5px 0; color: #666;">
                <strong>Invoice Number:</strong> {{ $invoice->invoice_number }}
            </p>
            <p style="margin: 5px 0; color: #666;">
                <strong>Period:</strong> {{ $invoice->period_start->format('d M Y') }} - {{ $invoice->period_end->format('d M Y') }}
            </p>
            <p style="margin: 5px 0; color: #666;">
                <strong>Timesheets:</strong> {{ $invoice->timesheets->count() }}
            </p>
            <p style="margin: 5px 0; color: #666;">
                <strong>Paid At:</strong> {{ $invoice->paid_at->format('d M Y, H:i') }}
            </p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            Payments have been transferred to your workers' Stripe accounts. They will receive the funds according to their payout schedules.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="{{ url('/invoices/' . $invoice->id) }}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Invoice
            </a>
        </div>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
            This is an automated message from NexShift. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
