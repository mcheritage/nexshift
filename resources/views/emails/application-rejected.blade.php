<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
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
        .status-banner {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .status-banner h2 {
            color: #856404;
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
        .reason-box {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 15px 0;
        }
        .encouragement-box {
            background-color: #d1ecf1;
            border-left: 4px solid #17a2b8;
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
        <h1>Application Status Update</h1>
        <p>Update regarding your shift application</p>
    </div>

    <div class="content">
        <p>Dear {{ $worker->first_name }},</p>
        
        <div class="status-banner">
            <h2>Application Update</h2>
            <p style="margin: 0;">We have an update regarding your recent application.</p>
        </div>

        <p>Thank you for your interest in the following shift. Unfortunately, we are unable to accept your application at this time.</p>

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
        </div>

        @if($reason && $reason !== 'Position filled by another applicant')
        <div class="reason-box">
            <strong>Feedback:</strong>
            <p style="margin: 10px 0 0 0;">{{ $reason }}</p>
        </div>
        @else
        <div class="reason-box">
            <strong>Reason:</strong>
            <p style="margin: 10px 0 0 0;">The position has been filled by another applicant.</p>
        </div>
        @endif

        <div class="encouragement-box">
            <strong>Don't be discouraged!</strong>
            <p style="margin: 10px 0 0 0;">
                There are many opportunities available on NexShift. We encourage you to continue browsing and applying for shifts that match your skills and availability.
            </p>
        </div>

        <p style="text-align: center;">
            <a href="{{ url('/worker/shifts') }}" class="cta-button">
                Browse Available Shifts
            </a>
        </p>

        <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
            Keep checking back regularly as new shifts are posted daily. Your perfect match could be just around the corner!
        </p>
    </div>

    <div class="footer">
        <p>This is an automated notification from NexShift.</p>
        <p>© {{ date('Y') }} NexShift Healthcare Staffing. All rights reserved.</p>
    </div>
</body>
</html>
