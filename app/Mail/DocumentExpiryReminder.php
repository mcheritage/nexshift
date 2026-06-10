<?php

namespace App\Mail;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentExpiryReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Document $document,
        public int $daysUntilExpiry,
    ) {}

    public function envelope(): Envelope
    {
        $urgency = $this->daysUntilExpiry === 1 ? 'Tomorrow' : "in {$this->daysUntilExpiry} Days";
        return new Envelope(
            subject: "Action Required: Your Document Expires {$urgency}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.document-expiry-reminder',
            with: [
                'document'        => $this->document,
                'worker'          => $this->document->user,
                'daysUntilExpiry' => $this->daysUntilExpiry,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
