<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ShiftRejectedWorker extends Mailable
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
            subject: 'Update Regarding Your Shift Assignment',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.shift-rejected-worker',
            with: [
                'worker'      => $this->application->worker,
                'shift'       => $this->application->shift,
                'careHome'    => $this->application->shift->careHome,
                'shiftsUrl'   => url('/worker/shifts'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
