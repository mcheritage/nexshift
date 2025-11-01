<?php

namespace App\Mail;

use App\Models\Application;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewShiftApplication extends Mailable
{
    use Queueable, SerializesModels;

    public Application $application;
    public User $worker;

    /**
     * Create a new message instance.
     */
    public function __construct(Application $application)
    {
        $this->application = $application;
        $this->worker = $application->worker;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Application for ' . $this->application->shift->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.new-shift-application',
            with: [
                'application' => $this->application,
                'worker' => $this->worker,
                'shift' => $this->application->shift,
                'careHome' => $this->application->shift->careHome,
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
