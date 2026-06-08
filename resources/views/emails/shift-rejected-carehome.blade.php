<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Worker Removed from Shift</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%); color: white; padding: 30px 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; font-size: 26px; }
        .header p { margin: 0; opacity: 0.9; }
        .content { background: #ffffff; padding: 25px; border: 1px solid #dee2e6; border-radius: 8px; }
        .alert-banner { background: #fef2f2; border: 2px solid #dc2626; padding: 18px 20px; border-radius: 6px; margin: 20px 0; }
        .alert-banner h2 { color: #7f1d1d; margin: 0 0 6px 0; font-size: 18px; }
        .alert-banner p { margin: 0; color: #991b1b; font-size: 14px; }
        .details-block { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .details-block h3 { margin-top: 0; color: #1e3a5f; }
        .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; width: 140px; color: #6c757d; font-size: 14px; }
        .detail-value { flex: 1; color: #333; font-size: 14px; }
        .action-note { background: #fff8e1; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 6px 6px 0; margin: 20px 0; font-size: 14px; color: #78350f; }
        .cta-row { text-align: center; margin: 24px 0 10px; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; }
        .footer { margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; font-size: 13px; color: #6c757d; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Worker Removed from Shift</h1>
        <p>A care home has rejected the assigned worker</p>
    </div>

    <div class="content">
        <p>Dear {{ $recipient->first_name }},</p>

        <div class="alert-banner">
            <h2>Worker Removed</h2>
            <p>
                <strong>{{ $careHome->name }}</strong> has removed
                <strong>{{ $worker->first_name }} {{ $worker->last_name }}</strong>
                from the shift assignment. The shift is now open and needs a new worker.
            </p>
        </div>

        <div class="details-block">
            <h3>Shift Details</h3>
            <div class="detail-row">
                <span class="detail-label">Care Home</span>
                <span class="detail-value">{{ $careHome->name }}</span>
            </div>
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
                <span class="detail-value">{{ date('H:i', strtotime($shift->start_datetime)) }} – {{ date('H:i', strtotime($shift->end_datetime)) }}</span>
            </div>
        </div>

        <div class="action-note">
            <strong>Action required:</strong> Please log in to assign another available worker to this shift.
        </div>

        <div class="cta-row">
            <a href="{{ $shiftsUrl }}" class="btn">Manage Shifts</a>
        </div>
    </div>

    <div class="footer">
        <p>This is an automated notification from NexShift.</p>
        <p>© {{ date('Y') }} NexShift Healthcare Staffing. All rights reserved.</p>
    </div>
</body>
</html>
