<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shift Cancelled</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            padding: 30px 20px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px 20px;
        }
        .alert-box {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            border-left: 5px solid #ffc107;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .alert-box h2 {
            margin-top: 0;
            color: #856404;
        }
        .shift-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .shift-details h3 {
            margin-top: 0;
            color: #495057;
        }
        .detail-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            width: 150px;
            color: #6c757d;
        }
        .detail-value {
            flex: 1;
            color: #212529;
        }
        .reason-box {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .reason-box h3 {
            margin-top: 0;
            color: #721c24;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Shift Cancelled</h1>
        </div>

        <div class="content">
            @if($worker)
                <p>Dear {{ $worker->first_name }},</p>

                <div class="alert-box">
                    <h2>Important Notice</h2>
                    <p>Unfortunately, the shift you were assigned to has been cancelled by {{ $careHome->name }}.</p>
                </div>
            @else
                <p>Dear Healthcare Worker,</p>

                <div class="alert-box">
                    <h2>Shift Cancellation</h2>
                    <p>A shift has been cancelled by {{ $careHome->name }}.</p>
                </div>
            @endif

            <div class="shift-details">
                <h3>Shift Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Care Home:</span>
                    <span class="detail-value">{{ $careHome->name }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Shift Title:</span>
                    <span class="detail-value">{{ $shift->title }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($shift->shift_date)->format('l, F j, Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($shift->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($shift->end_time)->format('g:i A') }}</span>
                </div>
                @if($shift->hourly_rate)
                    <div class="detail-row">
                        <span class="detail-label">Rate:</span>
                        <span class="detail-value">£{{ number_format($shift->hourly_rate, 2) }}/hour</span>
                    </div>
                @endif
            </div>

            @if($cancellationReason)
                <div class="reason-box">
                    <h3>Reason for Cancellation:</h3>
                    <p>{{ $cancellationReason }}</p>
                </div>
            @endif

            <p>We apologize for any inconvenience this may cause. Please feel free to browse and apply for other available shifts on the platform.</p>

            @if($worker)
                <p>If you have any questions or concerns about this cancellation, please don't hesitate to contact the care home or our support team.</p>
            @endif
        </div>

        <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>Contact our support team at <a href="mailto:support@nexshiftcare.co.uk">support@nexshiftcare.co.uk</a></p>
            <p style="margin-top: 15px; font-size: 12px;">This is an automated notification from NexShift. Please do not reply to this email.</p>
            <p style="font-size: 12px;">&copy; {{ date('Y') }} NexShift. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
