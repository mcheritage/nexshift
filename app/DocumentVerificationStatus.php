<?php

namespace App;

enum DocumentVerificationStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case REQUIRES_ATTENTION = 'requires_attention';

    public function getDisplayName(): string
    {
        return match($this) {
            self::PENDING => 'Pending Review',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::REQUIRES_ATTENTION => 'Requires Attention',
        };
    }

    public function getDescription(): string
    {
        return match($this) {
            self::PENDING => 'Document is awaiting review by administrators',
            self::APPROVED => 'Document has been approved and verified',
            self::REJECTED => 'Document has been rejected and needs to be resubmitted',
            self::REQUIRES_ATTENTION => 'Document needs additional information or clarification',
        };
    }

    public function getColor(): string
    {
        return match($this) {
            self::PENDING => 'yellow',
            self::APPROVED => 'green',
            self::REJECTED => 'red',
            self::REQUIRES_ATTENTION => 'orange',
        };
    }

    public function getIcon(): string
    {
        return match($this) {
            self::PENDING => 'clock',
            self::APPROVED => 'check-circle',
            self::REJECTED => 'x-circle',
            self::REQUIRES_ATTENTION => 'alert-triangle',
        };
    }

    public function isActionRequired(): bool
    {
        return match($this) {
            self::PENDING => false,
            self::APPROVED => false,
            self::REJECTED => true,
            self::REQUIRES_ATTENTION => true,
        };
    }
}
