<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shift Assignment</title>
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
            background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .header h1 { margin: 0 0 8px 0; font-size: 26px; }
        .header p  { margin: 0; opacity: 0.9; }
        .content {
            background: #ffffff;
            padding: 25px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        .alert-banner {
            background: #fff8e1;
            border: 2px solid #f59e0b;
            padding: 18px 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .alert-banner h2 { color: #92400e; margin: 0 0 6px 0; font-size: 18px; }
        .alert-banner p  { margin: 0; color: #78350f; font-size: 14px; }
        .shift-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .shift-details h3 { margin-top: 0; color: #1e3a5f; }
        .detail-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; width: 140px; color: #6c757d; font-size: 14px; }
        .detail-value { flex: 1; color: #333; font-size: 14px; }
        .cta-row {
            text-align: center;
            margin: 28px 0 10px;
        }
        .btn-accept {
            display: inline-block;
            background: #16a34a;
            color: white;
            padding: 14px 36px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
        }
        .note {
            font-size: 13px;
            color: #6c757d;
            text-align: center;
            margin-top: 10px;
        }
        .footer {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 13px;
            color: #6c757d;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Shift Assignment</h1>
        <p>You have been assigned to a shift by NexShift</p>
    </div>

    <div class="content">
        <p>Dear {{ $worker->first_name }},</p>

        <div class="alert-banner">
            <h2>⏰ Action Required</h2>
            <p>A NexShift administrator has assigned you to the shift below. Please log in and confirm whether you can take it.</p>
        </div>

        <div class="shift-details">
            <h3>Shift Details</h3>
            <div class="detail-row">
                <span class="detail-label">Care Home</span>
                <span class="detail-value">{{ $careHome->name }}</span>
            </div>
            @if($careHome->address)
            <div class="detail-row">
                <span class="detail-label">Address</span>
                <span class="detail-value">{{ $careHome->address }}</span>
            </div>
            @endif
            <div class="detail-row">
                <span class="detail-label">Role</span>
                <span class="detail-value">{{ $shift->title }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">{{ date('l, j F Y', strtotime($shift->start_datetime)) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">
                    {{ date('H:i', strtotime($shift->start_datetime)) }} – {{ date('H:i', strtotime($shift->end_datetime)) }}
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Hourly Rate</span>
                <span class="detail-value">£{{ number_format($shift->hourly_rate, 2) }}</span>
            </div>
            @if($application->review_notes)
            <div class="detail-row">
                <span class="detail-label">Note from Admin</span>
                <span class="detail-value">{{ $application->review_notes }}</span>
            </div>
            @endif
        </div>

        <div class="cta-row">
            <a href="{{ $myShiftsUrl }}" class="btn-accept">
                View &amp; Respond to Assignment
            </a>
        </div>
        <p class="note">
            You can accept or decline this shift from your <strong>My Shifts</strong> page.<br>
            If you are not signed in, you will be asked to log in first and then taken straight to the page.
        </p>

        <p style="margin-top: 24px; font-size: 14px; color: #6c757d;">
            If you have any questions please contact NexShift support through your dashboard.
        </p>
    </div>

    <div class="footer">
        <p>This is an automated notification from NexShift.</p>
        <p>© {{ date('Y') }} NexShift Healthcare Staffing. All rights reserved.</p>
    </div>
</body>
</html>
