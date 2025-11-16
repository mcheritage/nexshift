<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NexShift</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
        }
        .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .welcome-message {
            background-color: #f0f7ff;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .welcome-message h2 {
            color: #667eea;
            margin-top: 0;
        }
        .verification-section {
            background-color: #fff9e6;
            border: 2px solid #ffc107;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
        }
        .verification-section h3 {
            color: #f57c00;
            margin-top: 0;
        }
        .verify-button {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            margin: 15px 0;
            transition: background-color 0.3s;
        }
        .verify-button:hover {
            background-color: #218838;
        }
        .info-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .info-box h3 {
            margin-top: 0;
            color: #495057;
        }
        .info-box ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .info-box li {
            margin: 8px 0;
        }
        .important-note {
            background-color: #ffe6e6;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
        .footer p {
            margin: 5px 0;
        }
        .link-text {
            color: #667eea;
            word-break: break-all;
            font-size: 12px;
            margin-top: 10px;
            display: block;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>👋 Welcome to NexShift!</h1>
            <p>Healthcare Staffing Made Simple</p>
        </div>

        <div class="content">
            <div class="welcome-message">
                <h2>Hello {{ $user->first_name }}!</h2>
                <p>Thank you for registering with NexShift. We're excited to have you join our healthcare staffing platform.</p>
            </div>

            <div class="verification-section">
                <h3>⚠️ Action Required: Verify Your Email</h3>
                <p>To complete your registration and access your account, please verify your email address by clicking the button below:</p>
                
                <a href="{{ $verificationUrl }}" class="verify-button">
                    ✓ Verify Email Address
                </a>

                <p style="font-size: 14px; color: #6c757d; margin-top: 15px;">
                    This verification link will expire in 60 minutes.
                </p>
            </div>

            <div class="important-note">
                <strong>Important:</strong> You will not be able to log in to your account until you verify your email address.
            </div>

            <div class="info-box">
                <h3>What happens next?</h3>
                <ul>
                    @if($user->role === 'health_worker')
                    <li>Verify your email address using the button above</li>
                    <li>Complete your healthcare profile with qualifications and experience</li>
                    <li>Upload required documents (certifications, licenses, etc.)</li>
                    <li>Your profile will be reviewed by our admin team</li>
                    <li>Once approved, you can start browsing and applying for shifts</li>
                    @else
                    <li>Verify your email address using the button above</li>
                    <li>Complete your care home profile</li>
                    <li>Your account will be reviewed by our admin team</li>
                    <li>Once approved, you can start posting shifts and managing staff</li>
                    @endif
                </ul>
            </div>

            <p style="margin-top: 25px;">
                If you didn't create an account with NexShift, please disregard this email or contact our support team if you have concerns.
            </p>

            <p style="margin-top: 20px; font-weight: bold;">
                Best regards,<br>
                The NexShift Team
            </p>

            <p style="font-size: 12px; color: #6c757d; margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <strong>Trouble clicking the button?</strong> Copy and paste this link into your browser:
                <span class="link-text">{{ $verificationUrl }}</span>
            </p>
        </div>

        <div class="footer">
            <p>This is an automated email from NexShift.</p>
            <p>© {{ date('Y') }} NexShift Healthcare Staffing. All rights reserved.</p>
            <p style="margin-top: 10px;">
                Need help? Contact us at <a href="mailto:support@nexshift.com" style="color: #667eea;">support@nexshift.com</a>
            </p>
        </div>
    </div>
</body>
</html>
