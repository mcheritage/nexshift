<?php

namespace App\Console\Commands;

use App\DocumentType;
use App\DocumentVerificationStatus;
use App\Models\Document;
use Illuminate\Console\Command;

class ExpireDocuments extends Command
{
    protected $signature = 'compliance:expire-documents';

    protected $description = 'Mark approved documents as requires_attention when their expiry date has passed';

    public function handle(): int
    {
        $expired = Document::where('status', DocumentVerificationStatus::APPROVED)
            ->whereNotNull('expiry_date')
            ->whereDate('expiry_date', '<', today())
            ->whereNotNull('user_id')
            ->get();

        $count = 0;
        foreach ($expired as $document) {
            $document->update(['status' => DocumentVerificationStatus::REQUIRES_ATTENTION]);
            $count++;
            $this->line("Expired: [{$document->document_type}] for user {$document->user_id} (expired {$document->expiry_date->toDateString()})");
        }

        $this->info("Marked {$count} document(s) as expired.");

        return self::SUCCESS;
    }
}
