<?php

namespace App\Mail;

use App\Models\Shift;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ShiftCancelled extends Mailable
{
    use Queueable, SerializesModels;

    public Shift $shift;
    public string $cancellationReason;

    /**
     * Create a new message instance.
     */
    public function __construct(Shift $shift, string $cancellationReason)
    {
        $this->shift = $shift;
        $this->cancellationReason = $cancellationReason;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Shift Cancelled - ' . $this->shift->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.shift-cancelled',
            with: [
                'shift' => $this->shift,
                'cancellationReason' => $this->cancellationReason,
                'careHome' => $this->shift->careHome,
                'worker' => $this->shift->selectedWorker,
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
