<?php

namespace App\Http\Controllers\Admin;

use App\DocumentType;
use App\DocumentVerificationStatus;
use App\Http\Controllers\Controller;
use App\Models\CareHome;
use App\Models\Document;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentVerificationController extends Controller
{
    /**
     * Show the admin document verification dashboard
     */
    public function index(): Response
    {
        $careHomes = CareHome::with(['user', 'documents' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }])->get();

        $documentStats = [
            'total_documents' => Document::count(),
            'pending_documents' => Document::where('status', DocumentVerificationStatus::PENDING)->count(),
            'approved_documents' => Document::where('status', DocumentVerificationStatus::APPROVED)->count(),
            'rejected_documents' => Document::where('status', DocumentVerificationStatus::REJECTED)->count(),
            'requires_attention_documents' => Document::where('status', DocumentVerificationStatus::REQUIRES_ATTENTION)->count(),
        ];

        return Inertia::render('admin/document-verification', [
            'careHomes' => $careHomes,
            'documentStats' => $documentStats,
            'verificationStatuses' => collect(DocumentVerificationStatus::cases())->map(function ($status) {
                return [
                    'value' => $status->value,
                    'displayName' => $status->getDisplayName(),
                    'description' => $status->getDescription(),
                    'color' => $status->getColor(),
                    'icon' => $status->getIcon(),
                ];
            }),
        ]);
    }

    /**
     * Show documents for a specific care home
     */
    public function showCareHome(CareHome $careHome): Response
    {
        $careHome->load(['user', 'documents.reviewer']);
        
        $requiredDocuments = collect(DocumentType::getAllRequired())->map(function ($docType) use ($careHome) {
            $document = $careHome->documents->where('document_type', $docType->value)->first();
            
            return [
                'type' => [
                    'value' => $docType->value,
                    'displayName' => $docType->getDisplayName(),
                    'description' => $docType->getDescription(),
                ],
                'document' => $document ? [
                    'id' => $document->id,
                    'original_name' => $document->original_name,
                    'file_size' => $document->file_size,
                    'mime_type' => $document->mime_type,
                    'status' => $document->status->value,
                    'status_display' => $document->getStatusDisplayName(),
                    'status_color' => $document->getStatusColor(),
                    'status_icon' => $document->getStatusIcon(),
                    'rejection_reason' => $document->rejection_reason,
                    'action_required' => $document->action_required,
                    'reviewed_by' => $document->reviewed_by,
                    'reviewed_at' => $document->reviewed_at,
                    'uploaded_at' => $document->uploaded_at,
                    'reviewer' => $document->reviewer,
                ] : null,
            ];
        });

        return Inertia::render('admin/carehome-documents', [
            'careHome' => $careHome,
            'requiredDocuments' => $requiredDocuments,
            'verificationStatuses' => collect(DocumentVerificationStatus::cases())->map(function ($status) {
                return [
                    'value' => $status->value,
                    'displayName' => $status->getDisplayName(),
                    'description' => $status->getDescription(),
                    'color' => $status->getColor(),
                    'icon' => $status->getIcon(),
                ];
            }),
        ]);
    }

    /**
     * Update document verification status
     */
    public function updateStatus(Request $request, Document $document): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:' . implode(',', array_column(DocumentVerificationStatus::cases(), 'value')),
            'rejection_reason' => 'nullable|string|max:1000',
            'action_required' => 'nullable|string|max:1000',
        ]);

        $oldStatus = $document->status;
        $newStatus = DocumentVerificationStatus::from($request->status);

        $document->update([
            'status' => $newStatus,
            'rejection_reason' => $request->rejection_reason,
            'action_required' => $request->action_required,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        // Send notification to care home administrator
        $this->sendStatusChangeNotification($document, $oldStatus, $newStatus);

        return response()->json([
            'success' => true,
            'message' => 'Document status updated successfully',
            'document' => $document->fresh(['reviewer']),
        ]);
    }

    /**
     * Download a document for review
     */
    public function download(Document $document)
    {
        if (!Storage::disk('private')->exists($document->file_path)) {
            abort(404);
        }

        return Storage::disk('private')->download(
            $document->file_path,
            $document->original_name
        );
    }

    /**
     * Send notification to care home administrator about status change
     */
    private function sendStatusChangeNotification(Document $document, DocumentVerificationStatus $oldStatus, DocumentVerificationStatus $newStatus): void
    {
        $careHome = $document->careHome;
        $administrator = $careHome->user;

        if (!$administrator) {
            return;
        }

        // Create in-platform notification
        $notification = Notification::create([
            'user_id' => $administrator->id,
            'type' => 'document_status_changed',
            'title' => 'Document Status Updated',
            'message' => "Your {$document->document_type} document status has been updated from {$oldStatus->getDisplayName()} to {$newStatus->getDisplayName()}",
            'data' => [
                'document_id' => $document->id,
                'document_type' => $document->document_type,
                'old_status' => $oldStatus->value,
                'new_status' => $newStatus->value,
                'rejection_reason' => $document->rejection_reason,
                'action_required' => $document->action_required,
            ],
        ]);

        // Send email notification
        try {
            Mail::to($administrator->email)->send(new \App\Mail\DocumentStatusChanged($document, $oldStatus, $newStatus));
        } catch (\Exception $e) {
            \Log::error('Failed to send email notification', [
                'error' => $e->getMessage(),
                'administrator_email' => $administrator->email,
            ]);
        }
    }
}
