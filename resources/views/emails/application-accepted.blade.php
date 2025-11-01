<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Accepted</title>
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
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .content {
            background-color: #ffffff;
            padding: 25px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        .success-banner {
            background-color: #d4edda;
            border: 2px solid #28a745;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .success-banner h2 {
            color: #155724;
            margin: 0 0 10px 0;
        }
        .shift-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .shift-details h3 {
            margin-top: 0;
            color: #28a745;
        }
        .detail-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            width: 140px;
            color: #6c757d;
        }
        .detail-value {
            flex: 1;
            color: #333;
        }
        .next-steps {
            background-color: #e7f3ff;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .next-steps h3 {
            margin-top: 0;
            color: #0056b3;
        }
        .next-steps ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .next-steps li {
            margin: 8px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            margin-top: 20px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #6c757d;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Congratulations!</h1>
        <p>Your application has been accepted</p>
    </div>

    <div class="content">
        <p>Dear {{ $worker->first_name }},</p>
        
        <div class="success-banner">
            <h2>✅ Application Accepted</h2>
            <p style="margin: 0;">Great news! {{ $careHome->name }} has accepted your application.</p>
        </div>

        <p>We're pleased to inform you that your application for the following shift has been accepted:</p>

        <div class="shift-details">
            <h3>Shift Details</h3>
            <div class="detail-row">
                <span class="detail-label">Care Home:</span>
                <span class="detail-value">{{ $careHome->name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Position:</span>
                <span class="detail-value">{{ $shift->title }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ date('l, F j, Y', strtotime($shift->shift_date)) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">{{ date('g:i A', strtotime($shift->start_datetime)) }} - {{ date('g:i A', strtotime($shift->end_datetime)) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">{{ $shift->location }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Hourly Rate:</span>
                <span class="detail-value">£{{ number_format($shift->hourly_rate, 2) }}</span>
            </div>
            @if($careHome->phone_number)
            <div class="detail-row">
                <span class="detail-label">Contact:</span>
                <span class="detail-value">{{ $careHome->phone_number }}</span>
            </div>
            @endif
        </div>

        <div class="next-steps">
            <h3>Next Steps</h3>
            <ul>
                <li>Please confirm your attendance by logging into your NexShift dashboard</li>
                <li>Review any specific requirements or instructions for the shift</li>
                <li>Ensure you arrive 15 minutes early on the day of the shift</li>
                <li>After completing the shift, submit your timesheet for approval</li>
                <li>If you need to contact the care home, their details are listed above</li>
            </ul>
        </div>

        <p style="text-align: center;">
            <a href="{{ url('/worker/my-shifts') }}" class="cta-button">
                View My Shifts
            </a>
        </p>

        <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
            If you have any questions or need to make changes, please contact us immediately through your dashboard or reply to this email.
        </p>
    </div>

    <div class="footer">
        <p>This is an automated notification from NexShift.</p>
        <p>© {{ date('Y') }} NexShift Healthcare Staffing. All rights reserved.</p>
    </div>
</body>
</html>
