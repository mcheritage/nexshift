<?php

namespace App\Mail;

use App\Models\Application;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ShiftAssignedCareHome extends Mailable
{
    use Queueable, SerializesModels;

    public Application $application;
    public User $careHomeAdmin;

    public function __construct(Application $application, User $careHomeAdmin)
    {
        $this->application    = $application;
        $this->careHomeAdmin  = $careHomeAdmin;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'A Healthcare Worker Has Been Assigned to Your Shift',
        );
    }

    public function content(): Content
    {
        $shift  = $this->application->shift;
        $worker = $this->application->worker;

        return new Content(
            view: 'emails.shift-assigned-carehome',
            with: [
                'careHomeAdmin' => $this->careHomeAdmin,
                'worker'        => $worker,
                'shift'         => $shift,
                'careHome'      => $shift->careHome,
                'shiftsUrl'     => url('/shifts'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
