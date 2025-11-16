<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Timesheet Status Update</title>
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
            padding: 30px 20px;
            text-align: center;
            color: #ffffff;
        }
        .header.approved {
            background: linear-gradient(135deg, #28a745 0%, #218838 100%);
        }
        .header.rejected {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }
        .header.queried {
            background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        }
        .header.submitted {
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px 20px;
        }
        .status-box {
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 5px solid;
        }
        .status-box.approved {
            background-color: #d4edda;
            border-left-color: #28a745;
            color: #155724;
        }
        .status-box.rejected {
            background-color: #f8d7da;
            border-left-color: #dc3545;
            color: #721c24;
        }
        .status-box.queried {
            background-color: #fff3cd;
            border-left-color: #ffc107;
            color: #856404;
        }
        .status-box.submitted {
            background-color: #d1ecf1;
            border-left-color: #17a2b8;
            color: #0c5460;
        }
        .timesheet-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .timesheet-details h3 {
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
        .notes-box {
            background-color: #e7f3ff;
            border: 1px solid #bee5eb;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .notes-box h3 {
            margin-top: 0;
            color: #004085;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
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
        <div class="header {{ $action }}">
            <h1>
                @if($action === 'approved')
                    ✅ Timesheet Approved
                @elseif($action === 'rejected')
                    ❌ Timesheet Rejected
                @elseif($action === 'queried')
                    ❓ Timesheet Query
                @elseif($action === 'submitted')
                    📋 New Timesheet Submitted
                @else
                    Timesheet Status Update
                @endif
            </h1>
        </div>

        <div class="content">
            @if($action === 'submitted')
                <p>Dear {{ $careHome ? $careHome->name : 'Care Home' }} Administrator,</p>

                <div class="status-box submitted">
                    <h2 style="margin-top: 0;">New Timesheet Awaiting Your Approval</h2>
                    <p>{{ $worker->name }} has submitted a timesheet for your review and approval.</p>
                </div>
            @else
                <p>Dear {{ $worker->first_name }},</p>

                @if($action === 'approved')
                    <div class="status-box approved">
                        <h2 style="margin-top: 0;">Good News!</h2>
                        <p>Your timesheet has been approved by {{ $careHome ? $careHome->name : 'the care home' }}. Payment will be processed according to the standard schedule.</p>
                    </div>
                @elseif($action === 'rejected')
                    <div class="status-box rejected">
                        <h2 style="margin-top: 0;">Timesheet Rejected</h2>
                        <p>Unfortunately, your timesheet has been rejected by {{ $careHome ? $careHome->name : 'the care home' }}. Please review the notes below and contact them if you need clarification.</p>
                    </div>
                @elseif($action === 'queried')
                    <div class="status-box queried">
                        <h2 style="margin-top: 0;">Action Required</h2>
                        <p>{{ $careHome ? $careHome->name : 'The care home' }} has a query about your timesheet. Please review the notes below and respond accordingly.</p>
                    </div>
                @endif
            @endif

            <div class="timesheet-details">
                <h3>Timesheet Details</h3>
                @if($shift)
                    <div class="detail-row">
                        <span class="detail-label">Shift:</span>
                        <span class="detail-value">{{ $shift->title }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">{{ \Carbon\Carbon::parse($shift->shift_date)->format('l, F j, Y') }}</span>
                    </div>
                @endif
                <div class="detail-row">
                    <span class="detail-label">Clock In:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($timesheet->clock_in_time)->format('g:i A') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Clock Out:</span>
                    <span class="detail-value">{{ $timesheet->clock_out_time ? \Carbon\Carbon::parse($timesheet->clock_out_time)->format('g:i A') : 'Not clocked out' }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Hours Worked:</span>
                    <span class="detail-value">{{ number_format($timesheet->total_hours, 2) }} hours</span>
                </div>
                @if($timesheet->break_duration)
                    <div class="detail-row">
                        <span class="detail-label">Break Duration:</span>
                        <span class="detail-value">{{ $timesheet->break_duration }} minutes</span>
                    </div>
                @endif
                <div class="detail-row">
                    <span class="detail-label">Total Pay:</span>
                    <span class="detail-value"><strong>£{{ number_format($timesheet->total_pay, 2) }}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value"><strong>{{ ucfirst($timesheet->status) }}</strong></span>
                </div>
            </div>

            @if($notes)
                <div class="notes-box">
                    <h3>{{ $action === 'queried' ? 'Query from Care Home:' : 'Notes from Care Home:' }}</h3>
                    <p>{{ $notes }}</p>
                </div>
            @endif

            @if($action === 'queried')
                <p>Please log in to your account to review the query and provide additional information or make corrections as needed.</p>
                <div style="text-align: center;">
                    <a href="{{ config('app.url') }}/worker/timesheets" class="cta-button">View Timesheet</a>
                </div>
            @elseif($action === 'approved')
                <p>Thank you for your hard work! Payment for this shift will be processed according to the standard payment schedule.</p>
            @elseif($action === 'rejected')
                <p>If you believe this rejection was made in error or if you need clarification, please contact {{ $careHome ? $careHome->name : 'the care home' }} directly or reach out to our support team.</p>
            @elseif($action === 'submitted')
                <p>Please review the timesheet details and approve, query, or reject it at your earliest convenience.</p>
                <div style="text-align: center;">
                    <a href="{{ config('app.url') }}/timesheets" class="cta-button">Review Timesheet</a>
                </div>
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
