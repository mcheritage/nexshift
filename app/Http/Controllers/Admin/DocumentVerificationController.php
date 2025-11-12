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
        $careHomes = CareHome::with(['users', 'documents' => function ($query) {
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
        $careHome->load(['users', 'documents.reviewer']);
        
        $requiredDocuments = collect(DocumentType::getAllRequired())->map(function ($docType) use ($careHome) {
            // Get all documents for this type (not just the first one)
            $documents = $careHome->documents->where('document_type', $docType->value)->map(function ($document) {
                return [
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
                ];
            })->values();
            
            return [
                'type' => [
                    'value' => $docType->value,
                    'displayName' => $docType->getDisplayName(),
                    'description' => $docType->getDescription(),
                ],
                'documents' => $documents,
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
    public function updateStatus(Request $request, Document $document)
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

        return redirect()->back()->with('success', 'Document status updated successfully');
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
     * View a document inline (for preview)
     */
    public function view(Document $document)
    {
        if (!Storage::disk('private')->exists($document->file_path)) {
            abort(404);
        }

        $file = Storage::disk('private')->get($document->file_path);
        $mimeType = $document->mime_type;

        return response($file, 200, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $document->original_name . '"'
        ]);
    }

    /**
     * Send notification to care home administrator about status change
     */
    private function sendStatusChangeNotification(Document $document, DocumentVerificationStatus $oldStatus, DocumentVerificationStatus $newStatus): void
    {
        // Determine if this is a care home or worker document
        if ($document->isCareHomeDocument()) {
            $this->sendCareHomeNotification($document, $oldStatus, $newStatus);
        } elseif ($document->isWorkerDocument()) {
            $this->sendWorkerNotification($document, $oldStatus, $newStatus);
        }
    }

    /**
     * Send notification to care home administrator
     */
    private function sendCareHomeNotification(Document $document, DocumentVerificationStatus $oldStatus, DocumentVerificationStatus $newStatus): void
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

    /**
     * Send notification to worker about status change
     */
    private function sendWorkerNotification(Document $document, DocumentVerificationStatus $oldStatus, DocumentVerificationStatus $newStatus): void
    {
        $worker = $document->user;

        if (!$worker) {
            return;
        }

        // Create in-platform notification
        $notification = Notification::create([
            'user_id' => $worker->id,
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
            Mail::to($worker->email)->send(new \App\Mail\DocumentStatusChanged($document, $oldStatus, $newStatus));
        } catch (\Exception $e) {
            \Log::error('Failed to send email notification', [
                'error' => $e->getMessage(),
                'worker_email' => $worker->email,
            ]);
        }
    }

    /**
     * Display all healthcare workers for document verification
     */
    public function indexWorkers()
    {
        $workers = User::where('role', 'health_care_worker')
            ->withCount([
                'documents',
                'documents as pending_documents_count' => function ($query) {
                    $query->where('status', DocumentVerificationStatus::PENDING);
                },
                'documents as approved_documents_count' => function ($query) {
                    $query->where('status', DocumentVerificationStatus::APPROVED);
                },
                'documents as rejected_documents_count' => function ($query) {
                    $query->where('status', DocumentVerificationStatus::REJECTED);
                },
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($worker) {
                return [
                    'id' => $worker->id,
                    'name' => $worker->name,
                    'email' => $worker->email,
                    'phone' => $worker->phone,
                    'total_documents' => $worker->documents_count,
                    'pending_documents' => $worker->pending_documents_count,
                    'approved_documents' => $worker->approved_documents_count,
                    'rejected_documents' => $worker->rejected_documents_count,
                    'created_at' => $worker->created_at,
                ];
            });

        return Inertia::render('admin/worker-verification', [
            'workers' => $workers,
        ]);
    }

    /**
     * Display documents for a specific healthcare worker
     */
    public function showWorker(User $worker)
    {
        // Ensure the user is a healthcare worker
        if ($worker->role !== 'health_care_worker') {
            abort(403, 'This user is not a healthcare worker');
        }

        $requiredDocuments = collect(DocumentType::getAllRequiredForWorker())->map(function ($docType) use ($worker) {
            $document = Document::where('user_id', $worker->id)
                ->where('document_type', $docType->value)
                ->with('reviewer')
                ->first();

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
                    'uploaded_at' => $document->uploaded_at,
                    'reviewed_at' => $document->reviewed_at,
                    'reviewer' => $document->reviewer ? [
                        'id' => $document->reviewer->id,
                        'name' => $document->reviewer->name,
                        'email' => $document->reviewer->email,
                    ] : null,
                ] : null,
            ];
        });

        $optionalDocuments = collect(DocumentType::getAllOptionalForWorker())->map(function ($docType) use ($worker) {
            $document = Document::where('user_id', $worker->id)
                ->where('document_type', $docType->value)
                ->with('reviewer')
                ->first();

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
                    'uploaded_at' => $document->uploaded_at,
                    'reviewed_at' => $document->reviewed_at,
                    'reviewer' => $document->reviewer ? [
                        'id' => $document->reviewer->id,
                        'name' => $document->reviewer->name,
                        'email' => $document->reviewer->email,
                    ] : null,
                ] : null,
            ];
        });

        $verificationStatuses = collect(DocumentVerificationStatus::cases())->map(function ($status) {
            return [
                'value' => $status->value,
                'displayName' => $status->getDisplayName(),
                'description' => $status->getDescription(),
                'color' => $status->getColor(),
                'icon' => $status->getIcon(),
            ];
        });

        return Inertia::render('admin/worker-documents', [
            'worker' => [
                'id' => $worker->id,
                'name' => $worker->name,
                'email' => $worker->email,
                'phone' => $worker->phone,
            ],
            'requiredDocuments' => $requiredDocuments,
            'optionalDocuments' => $optionalDocuments,
            'verificationStatuses' => $verificationStatuses,
        ]);
    }
}
