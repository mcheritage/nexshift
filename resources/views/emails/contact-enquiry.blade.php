<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Enquiry</title>
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
            padding: 32px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 32px;
        }
        .field-label {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #888;
            margin-bottom: 4px;
        }
        .field-value {
            font-size: 16px;
            color: #333;
            margin-bottom: 24px;
            padding: 12px;
            background: #f9f9f9;
            border-left: 3px solid #667eea;
            border-radius: 0 4px 4px 0;
        }
        .message-value {
            white-space: pre-wrap;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #aaa;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>New Website Enquiry</h1>
        </div>
        <div class="content">
            <p>You have received a new message via the NexShift website contact form.</p>

            <div class="field-label">Name</div>
            <div class="field-value">{{ $senderName }}</div>

            <div class="field-label">Email</div>
            <div class="field-value">
                <a href="mailto:{{ $senderEmail }}" style="color: #667eea;">{{ $senderEmail }}</a>
            </div>

            <div class="field-label">Message</div>
            <div class="field-value message-value">{{ $body }}</div>
        </div>
        <div class="footer">
            NexShift &mdash; {{ date('Y') }}
        </div>
    </div>
</body>
</html>
