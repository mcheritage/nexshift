<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Verification Status Update</title>
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
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
        }
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-approved { background-color: #d4edda; color: #155724; }
        .status-rejected { background-color: #f8d7da; color: #721c24; }
        .status-requires-attention { background-color: #ffeaa7; color: #6c5ce7; }
        .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        .footer {
            margin-top: 20px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #6c757d;
        }
        .action-required {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Document Verification Status Update</h1>
        <p>Dear {{ $careHome->user->name ?? 'Care Home Administrator' }},</p>
    </div>

    <div class="content">
        <p>The verification status for one of your facility's documents has been updated:</p>
        
        <h2>Document Details</h2>
        <ul>
            <li><strong>Care Home:</strong> {{ $careHome->name }}</li>
            <li><strong>Document Type:</strong> {{ $document->document_type }}</li>
            <li><strong>File Name:</strong> {{ $document->original_name }}</li>
            <li><strong>Previous Status:</strong> {{ $oldStatus->getDisplayName() }}</li>
            <li><strong>New Status:</strong> 
                <span class="status-badge status-{{ $newStatus->value }}">
                    {{ $newStatus->getDisplayName() }}
                </span>
            </li>
            <li><strong>Updated:</strong> {{ $document->reviewed_at->format('F j, Y \a\t g:i A') }}</li>
        </ul>

        @if($newStatus->isActionRequired())
            <div class="action-required">
                <h3>Action Required</h3>
                @if($document->rejection_reason)
                    <p><strong>Reason for Rejection:</strong> {{ $document->rejection_reason }}</p>
                @endif
                @if($document->action_required)
                    <p><strong>Required Action:</strong> {{ $document->action_required }}</p>
                @endif
                <p>Please log in to your Nexshift Care Home portal to view the full details and take the necessary action.</p>
            </div>
        @endif

        <p>You can view all your document verification statuses by logging into your Nexshift Care Home portal.</p>
    </div>

    <div class="footer">
        <p>This is an automated notification from Nexshift. Please do not reply to this email.</p>
        <p>If you have any questions, please contact our support team.</p>
    </div>
</body>
</html>
