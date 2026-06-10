<?php

namespace App\Console\Commands;

use App\DocumentVerificationStatus;
use App\Mail\DocumentExpiryReminder;
use App\Mail\TrainingExpiryReminder;
use App\Models\Document;
use App\Models\Notification;
use App\Models\WorkerTraining;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendExpiryReminders extends Command
{
    protected $signature = 'compliance:send-expiry-reminders';

    protected $description = 'Send expiry reminder notifications for worker documents and trainings';

    private const THRESHOLDS = [90, 30, 7, 1];

    public function handle(): int
    {
        foreach (self::THRESHOLDS as $days) {
            $this->processDocuments($days);
            $this->processTrainings($days);
        }

        return self::SUCCESS;
    }

    protected function processDocuments(int $days): void
    {
        $targetDate = now()->addDays($days)->toDateString();

        Document::where('status', DocumentVerificationStatus::APPROVED)
            ->whereDate('expiry_date', $targetDate)
            ->whereNotNull('user_id')
            ->with('user')
            ->get()
            ->each(function (Document $document) use ($days) {
                if ($this->alreadyNotified('document_expiry_reminder', $document->user_id, 'document_id', $document->id, $days)) {
                    return;
                }

                $worker = $document->user;
                $label = $days === 1 ? 'tomorrow' : "in {$days} days";

                Notification::create([
                    'user_id' => $worker->id,
                    'type'    => 'document_expiry_reminder',
                    'title'   => 'Document Expiring Soon',
                    'message' => "Your {$document->document_type} document expires {$label} on " . $document->expiry_date->format('d M Y') . '.',
                    'data'    => [
                        'document_id'       => $document->id,
                        'document_type'     => $document->document_type,
                        'expiry_date'       => $document->expiry_date->toDateString(),
                        'days_until_expiry' => $days,
                    ],
                ]);

                if ($worker->email) {
                    Mail::to($worker->email)->send(new DocumentExpiryReminder($document, $days));
                }

                $this->line("Document expiry reminder ({$days}d): {$worker->email} — {$document->document_type}");
            });
    }

    protected function processTrainings(int $days): void
    {
        $targetDate = now()->addDays($days)->toDateString();

        WorkerTraining::where('status', 'approved')
            ->whereDate('expires_at', $targetDate)
            ->with(['user', 'trainingType'])
            ->get()
            ->each(function (WorkerTraining $training) use ($days) {
                if ($this->alreadyNotified('training_expiry_reminder', $training->user_id, 'training_id', $training->id, $days)) {
                    return;
                }

                $worker = $training->user;
                $trainingName = $training->trainingType->name;
                $label = $days === 1 ? 'tomorrow' : "in {$days} days";

                Notification::create([
                    'user_id' => $worker->id,
                    'type'    => 'training_expiry_reminder',
                    'title'   => 'Training Certificate Expiring Soon',
                    'message' => "Your {$trainingName} certificate expires {$label} on " . $training->expires_at->format('d M Y') . '.',
                    'data'    => [
                        'training_id'       => $training->id,
                        'training_name'     => $trainingName,
                        'expiry_date'       => $training->expires_at->toDateString(),
                        'days_until_expiry' => $days,
                    ],
                ]);

                if ($worker->email) {
                    Mail::to($worker->email)->send(new TrainingExpiryReminder($training, $days));
                }

                $this->line("Training expiry reminder ({$days}d): {$worker->email} — {$trainingName}");
            });
    }

    protected function alreadyNotified(
        string $type,
        string $userId,
        string $idKey,
        string $subjectId,
        int $days
    ): bool {
        return Notification::where('type', $type)
            ->where('user_id', $userId)
            ->whereJsonContains('data->' . $idKey, $subjectId)
            ->whereJsonContains('data->days_until_expiry', $days)
            ->where('created_at', '>=', now()->subDays(25))
            ->exists();
    }
}
