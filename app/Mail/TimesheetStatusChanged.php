<?php

namespace App\Mail;

use App\Models\Timesheet;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TimesheetStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public Timesheet $timesheet;
    public string $action;
    public ?string $notes;

    /**
     * Create a new message instance.
     */
    public function __construct(Timesheet $timesheet, string $action, ?string $notes = null)
    {
        $this->timesheet = $timesheet;
        $this->action = $action;
        $this->notes = $notes;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->action) {
            'approved' => 'Timesheet Approved',
            'rejected' => 'Timesheet Rejected',
            'queried' => 'Timesheet Query - Action Required',
            'submitted' => 'New Timesheet Submitted for Approval',
            default => 'Timesheet Status Update',
        };

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.timesheet-status-changed',
            with: [
                'timesheet' => $this->timesheet,
                'action' => $this->action,
                'notes' => $this->notes,
                'shift' => $this->timesheet->shift,
                'careHome' => $this->timesheet->shift->careHome ?? null,
                'worker' => $this->timesheet->user,
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
