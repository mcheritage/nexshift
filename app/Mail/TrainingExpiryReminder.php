<?php

namespace App\Mail;

use App\Models\WorkerTraining;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrainingExpiryReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public WorkerTraining $training,
        public int $daysUntilExpiry,
    ) {}

    public function envelope(): Envelope
    {
        $trainingName = $this->training->trainingType->name;
        $urgency = $this->daysUntilExpiry === 1 ? 'Tomorrow' : "in {$this->daysUntilExpiry} Days";
        return new Envelope(
            subject: "Action Required: Your {$trainingName} Certificate Expires {$urgency}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.training-expiry-reminder',
            with: [
                'training'        => $this->training,
                'trainingType'    => $this->training->trainingType,
                'worker'          => $this->training->user,
                'daysUntilExpiry' => $this->daysUntilExpiry,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
