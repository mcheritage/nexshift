<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Status Update</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .status-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .status-box.approved {
            background-color: #d4edda;
            border-left-color: #28a745;
        }
        .status-box.rejected {
            background-color: #f8d7da;
            border-left-color: #dc3545;
        }
        .status-box.suspended {
            background-color: #fff3cd;
            border-left-color: #ffc107;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            margin: 5px 0;
        }
        .badge-approved { background-color: #28a745; color: #ffffff; }
        .badge-rejected { background-color: #dc3545; color: #ffffff; }
        .badge-suspended { background-color: #ffc107; color: #212529; }
        .badge-pending { background-color: #6c757d; color: #ffffff; }
        .reason-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .reason-box h3 {
            margin-top: 0;
            color: #856404;
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
        .cta-button:hover {
            background-color: #5568d3;
        }
        .info-list {
            background-color: #f8f9fa;
            padding: 15px 20px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .info-list li {
            margin: 8px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Status Update</h1>
        </div>

        <div class="content">
            <p>Dear {{ $user->name }},</p>

            @if($action === 'approve')
                <div class="status-box approved">
                    <h2 style="margin-top: 0; color: #155724;">🎉 Congratulations! Your Account Has Been Approved</h2>
                    <p style="margin-bottom: 0;">
                        <span class="status-badge badge-approved">{{ ucfirst($newStatus) }}</span>
                    </p>
                </div>

                <p>We're excited to inform you that your {{ $user->role === 'health_worker' ? 'healthcare worker' : 'care home' }} account has been approved and is now active!</p>

                @if($user->role === 'health_worker')
                    <h3>What's Next?</h3>
                    <ul class="info-list">
                        <li>You can now browse and apply for available shifts</li>
                        <li>Complete your profile to increase your chances of getting hired</li>
                        <li>Upload any remaining documents if required</li>
                        <li>Start building your work history with care homes</li>
                    </ul>
                @else
                    <h3>What's Next?</h3>
                    <ul class="info-list">
                        <li>You can now post shifts and hire healthcare workers</li>
                        <li>Complete your care home profile</li>
                        <li>Upload any remaining required documents</li>
                        <li>Start managing your workforce efficiently</li>
                    </ul>
                @endif

                <div style="text-align: center;">
                    <a href="{{ config('app.url') }}/login" class="cta-button">Login to Your Account</a>
                </div>

            @elseif($action === 'reject')
                <div class="status-box rejected">
                    <h2 style="margin-top: 0; color: #721c24;">Account Status Update</h2>
                    <p style="margin-bottom: 0;">
                        <span class="status-badge badge-rejected">{{ ucfirst($newStatus) }}</span>
                    </p>
                </div>

                <p>We regret to inform you that your {{ $user->role === 'health_worker' ? 'healthcare worker' : 'care home' }} account application has not been approved at this time.</p>

                @if($reason)
                    <div class="reason-box">
                        <h3>Reason for Rejection:</h3>
                        <p>{{ $reason }}</p>
                    </div>
                @endif

                <p>If you believe this decision was made in error or if you'd like to discuss your application further, please contact our support team for assistance.</p>

            @elseif($action === 'suspend')
                <div class="status-box suspended">
                    <h2 style="margin-top: 0; color: #856404;">⚠️ Important: Account Suspended</h2>
                    <p style="margin-bottom: 0;">
                        <span class="status-badge badge-suspended">{{ ucfirst($newStatus) }}</span>
                    </p>
                </div>

                <p>Your {{ $user->role === 'health_worker' ? 'healthcare worker' : 'care home' }} account has been temporarily suspended.</p>

                @if($reason)
                    <div class="reason-box">
                        <h3>Reason for Suspension:</h3>
                        <p>{{ $reason }}</p>
                    </div>
                @endif

                <p><strong>What this means:</strong></p>
                <ul class="info-list">
                    <li>You cannot access certain features while your account is suspended</li>
                    @if($user->role === 'health_worker')
                        <li>You cannot apply for new shifts</li>
                        <li>Your existing applications may be affected</li>
                    @else
                        <li>You cannot post new shifts</li>
                        <li>Your existing shifts may be affected</li>
                    @endif
                    <li>This suspension is temporary and can be lifted</li>
                </ul>

                <p>Please contact our support team immediately to resolve this issue and have your account reinstated.</p>

            @elseif($action === 'unsuspend')
                <div class="status-box approved">
                    <h2 style="margin-top: 0; color: #155724;">✅ Account Reactivated</h2>
                    <p style="margin-bottom: 0;">
                        <span class="status-badge badge-approved">{{ ucfirst($newStatus) }}</span>
                    </p>
                </div>

                <p>Good news! Your {{ $user->role === 'health_worker' ? 'healthcare worker' : 'care home' }} account has been reactivated.</p>

                <p>Your account is now fully restored and you have access to all features:</p>
                <ul class="info-list">
                    @if($user->role === 'health_worker')
                        <li>Browse and apply for shifts</li>
                        <li>Manage your applications</li>
                        <li>Update your profile and documents</li>
                        <li>View your work history</li>
                    @else
                        <li>Post new shifts</li>
                        <li>Manage applications</li>
                        <li>Update care home information</li>
                        <li>Manage your workforce</li>
                    @endif
                </ul>

                <div style="text-align: center;">
                    <a href="{{ config('app.url') }}/login" class="cta-button">Login to Your Account</a>
                </div>
            @endif

            <h3>Account Details</h3>
            <ul class="info-list">
                <li><strong>Name:</strong> {{ $user->name }}</li>
                <li><strong>Email:</strong> {{ $user->email }}</li>
                <li><strong>Account Type:</strong> {{ $user->role === 'health_worker' ? 'Healthcare Worker' : ($user->role === 'care_home_admin' ? 'Care Home Administrator' : ucfirst(str_replace('_', ' ', $user->role))) }}</li>
                @if($careHome)
                    <li><strong>Care Home:</strong> {{ $careHome->name }}</li>
                @endif
                <li><strong>Previous Status:</strong> {{ ucfirst($oldStatus) }}</li>
                <li><strong>New Status:</strong> {{ ucfirst($newStatus) }}</li>
                <li><strong>Updated:</strong> {{ now()->format('F j, Y \a\t g:i A') }}</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>If you have any questions or concerns, please contact our support team at <a href="mailto:support@nexshiftcare.co.uk">support@nexshiftcare.co.uk</a></p>
            <p style="margin-top: 15px; font-size: 12px;">This is an automated notification from NexShift. Please do not reply to this email.</p>
            <p style="font-size: 12px;">&copy; {{ date('Y') }} NexShift. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
