<?php

namespace App\Mail;

use App\Models\CareHome;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $oldStatus;
    public string $newStatus;
    public string $action;
    public ?string $reason;
    public ?CareHome $careHome;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $oldStatus, string $newStatus, string $action, ?string $reason = null)
    {
        $this->user = $user;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->action = $action;
        $this->reason = $reason;
        $this->careHome = $user->role === 'health_worker' ? $user->careHome : null;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->action) {
            'approve' => 'Account Approved - Welcome to NexShift',
            'reject' => 'Account Status Update',
            'suspend' => 'Important: Account Suspended',
            'unsuspend' => 'Account Reactivated',
            default => 'Account Status Update',
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
            view: 'emails.user-status-changed',
            with: [
                'user' => $this->user,
                'oldStatus' => $this->oldStatus,
                'newStatus' => $this->newStatus,
                'action' => $this->action,
                'reason' => $this->reason,
                'careHome' => $this->careHome,
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
