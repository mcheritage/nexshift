<?php

namespace App\Mail;

use App\DocumentVerificationStatus;
use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public Document $document;
    public DocumentVerificationStatus $oldStatus;
    public DocumentVerificationStatus $newStatus;

    /**
     * Create a new message instance.
     */
    public function __construct(Document $document, DocumentVerificationStatus $oldStatus, DocumentVerificationStatus $newStatus)
    {
        $this->document = $document;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $entityName = $this->document->careHome 
            ? $this->document->careHome->name 
            : ($this->document->user ? $this->document->user->name : 'Your Account');

        return new Envelope(
            subject: 'Document Verification Status Update - ' . $entityName,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.document-status-changed',
            with: [
                'document' => $this->document,
                'careHome' => $this->document->careHome,
                'worker' => $this->document->user,
                'oldStatus' => $this->oldStatus,
                'newStatus' => $this->newStatus,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
