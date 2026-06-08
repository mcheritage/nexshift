<?php

namespace App\Mail;

use App\Models\Application;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ShiftAssignmentDeclined extends Mailable
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
            subject: 'Worker Has Declined the Shift Assignment',
        );
    }

    public function content(): Content
    {
        $shift    = $this->application->shift;
        $worker   = $this->application->worker;
        $careHome = $shift->careHome;

        return new Content(
            view: 'emails.shift-assignment-declined',
            with: [
                'recipient'  => $this->recipient,
                'worker'     => $worker,
                'shift'      => $shift,
                'careHome'   => $careHome,
                'shiftsUrl'  => url('/admin/shifts'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
