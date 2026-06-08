<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ShiftAssignedWorker extends Mailable
{
    use Queueable, SerializesModels;

    public Application $application;

    public function __construct(Application $application)
    {
        $this->application = $application;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Action Required: You Have Been Assigned to a Shift',
        );
    }

    public function content(): Content
    {
        $shift    = $this->application->shift;
        $worker   = $this->application->worker;
        $careHome = $shift->careHome;

        return new Content(
            view: 'emails.shift-assigned-worker',
            with: [
                'worker'      => $worker,
                'shift'       => $shift,
                'careHome'    => $careHome,
                'application' => $this->application,
                'myShiftsUrl' => url('/worker/my-shifts'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
