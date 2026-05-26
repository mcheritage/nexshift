<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactEnquiry extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $senderName,
        public string $senderEmail,
        public string $body,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Website Enquiry from {$this->senderName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-enquiry',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
