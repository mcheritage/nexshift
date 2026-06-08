<?php

namespace App\Mail;

use App\Models\Application;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ShiftRejectedCareHome extends Mailable
{
    use Queueable, SerializesModels;

    public Application $application;
    public User $recipient;

    public function __construct(Application $application, User $recipient)
    {
        $this->application = $application;
        $this->recipient   = $recipient;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Care Home Has Removed Assigned Worker from Shift',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.shift-rejected-carehome',
            with: [
                'recipient' => $this->recipient,
                'worker'    => $this->application->worker,
                'shift'     => $this->application->shift,
                'careHome'  => $this->application->shift->careHome,
                'shiftsUrl' => url('/admin/shifts'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
