<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Expiry Reminder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #fff3cd;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0 0 8px;
            color: #92400e;
            font-size: 20px;
        }
        .urgency-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
        }
        .urgency-1  { background-color: #fee2e2; color: #991b1b; }
        .urgency-7  { background-color: #fef3c7; color: #92400e; }
        .urgency-30 { background-color: #dbeafe; color: #1e40af; }
        .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #6b7280; font-size: 14px; }
        .detail-value { font-weight: 600; font-size: 14px; }
        .action-box {
            background-color: #f0fdf4;
            border: 1px solid #86efac;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .action-box h3 { margin: 0 0 8px; color: #166534; }
        .footer {
            margin-top: 20px;
            padding: 16px;
            background-color: #f8f9fa;
            border-radius: 8px;
            font-size: 13px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚠ Document Expiry Reminder</h1>
        @if($daysUntilExpiry === 1)
            <span class="urgency-badge urgency-1">Expires Tomorrow</span>
        @elseif($daysUntilExpiry <= 7)
            <span class="urgency-badge urgency-7">Expires in {{ $daysUntilExpiry }} Days</span>
        @else
            <span class="urgency-badge urgency-30">Expires in {{ $daysUntilExpiry }} Days</span>
        @endif
    </div>

    <div class="content">
        <p>Dear {{ $worker->first_name ?? $worker->name }},</p>

        <p>
            This is a reminder that one of your compliance documents is due to expire soon.
            Please renew it promptly to ensure you remain eligible to work shifts.
        </p>

        <div style="margin: 20px 0;">
            <div class="detail-row">
                <span class="detail-label">Document Type</span>
                <span class="detail-value">{{ $document->document_type }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Expiry Date</span>
                <span class="detail-value">{{ $document->expiry_date->format('d F Y') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Days Remaining</span>
                <span class="detail-value">{{ $daysUntilExpiry }} {{ $daysUntilExpiry === 1 ? 'day' : 'days' }}</span>
            </div>
        </div>

        <div class="action-box">
            <h3>What to do next</h3>
            <p style="margin: 0;">
                Please log in to your NexShift worker portal, go to <strong>My Documents</strong>,
                and upload a renewed copy before the expiry date. Once submitted, our team will review it promptly.
            </p>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
            If you have already renewed this document and uploaded it to NexShift, you can disregard this message.
        </p>
    </div>

    <div class="footer">
        <p>This is an automated reminder from NexShift. Please do not reply to this email.</p>
        <p>If you have any questions, please contact our support team.</p>
    </div>
</body>
</html>
