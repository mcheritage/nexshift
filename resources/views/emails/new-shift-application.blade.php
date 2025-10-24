<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Shift Application</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .content {
            background-color: #ffffff;
            padding: 25px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        .shift-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .shift-details h3 {
            margin-top: 0;
            color: #667eea;
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
        .worker-info {
            background-color: #e7f3ff;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .worker-info h3 {
            margin-top: 0;
            color: #0056b3;
        }
        .message-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #667eea;
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
        <h1>📋 New Shift Application</h1>
        <p>A healthcare worker has applied for your shift</p>
    </div>

    <div class="content">
        <p>Hello {{ $careHome->user->first_name ?? 'Care Home Administrator' }},</p>
        
        <p>You have received a new application for one of your posted shifts.</p>

        <div class="shift-details">
            <h3>Shift Details</h3>
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
        </div>

        <div class="worker-info">
            <h3>Applicant Information</h3>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">{{ $worker->first_name }} {{ $worker->last_name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ $worker->email }}</span>
            </div>
            @if($worker->phone_number)
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">{{ $worker->phone_number }}</span>
            </div>
            @endif
            @if($worker->years_experience)
            <div class="detail-row">
                <span class="detail-label">Experience:</span>
                <span class="detail-value">{{ $worker->years_experience }} years</span>
            </div>
            @endif
            <div class="detail-row">
                <span class="detail-label">Applied:</span>
                <span class="detail-value">{{ $application->applied_at->format('F j, Y \a\t g:i A') }}</span>
            </div>
        </div>

        @if($application->message)
        <div class="message-box">
            <strong>Message from applicant:</strong>
            <p style="margin: 10px 0 0 0;">{{ $application->message }}</p>
        </div>
        @endif

        <p style="text-align: center;">
            <a href="{{ url('/shifts/' . $shift->id) }}" class="cta-button">
                View Application & Worker Profile
            </a>
        </p>

        <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
            Log in to your NexShift dashboard to review the application, view the worker's full profile, and make your decision.
        </p>
    </div>

    <div class="footer">
        <p>This is an automated notification from NexShift.</p>
        <p>© {{ date('Y') }} NexShift Healthcare Staffing. All rights reserved.</p>
    </div>
</body>
</html>
