<?php

namespace App\Http\Controllers;

use App\DocumentType;
use App\DocumentVerificationStatus;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WorkerDocumentController extends Controller
{
    /**
     * Display a listing of the worker's documents.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get all documents for this worker
        $documents = Document::where('user_id', $user->id)
            ->with('reviewer')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($document) {
                return [
                    'id' => $document->id,
                    'document_type' => $document->document_type,
                    'original_name' => $document->original_name,
                    'file_size' => $document->file_size,
                    'status' => $document->status->value,
                    'status_display' => $document->getStatusDisplayName(),
                    'status_color' => $document->getStatusColor(),
                    'status_icon' => $document->getStatusIcon(),
                    'rejection_reason' => $document->rejection_reason,
                    'action_required' => $document->action_required,
                    'uploaded_at' => $document->uploaded_at,
                    'reviewed_at' => $document->reviewed_at,
                    'reviewed_by' => $document->reviewer ? $document->reviewer->name : null,
                ];
            });

        // Get required documents
        $requiredDocuments = collect(DocumentType::getAllRequiredForWorker())->map(function ($docType) {
            return [
                'type' => $docType->value,
                'display_name' => $docType->getDisplayName(),
                'description' => $docType->getDescription(),
            ];
        });

        // Get optional documents
        $optionalDocuments = collect(DocumentType::getAllOptionalForWorker())->map(function ($docType) {
            return [
                'type' => $docType->value,
                'display_name' => $docType->getDisplayName(),
                'description' => $docType->getDescription(),
            ];
        });

        return Inertia::render('Worker/Documents', [
            'documents' => $documents,
            'requiredDocuments' => $requiredDocuments,
            'optionalDocuments' => $optionalDocuments,
        ]);
    }

    /**
     * Upload a new document.
     */
    public function store(Request $request)
    {
        $request->validate([
            'document_type' => 'required|string',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $user = $request->user();
        $file = $request->file('file');

        // Check if document of this type already exists
        $existingDocument = Document::where('user_id', $user->id)
            ->where('document_type', $request->document_type)
            ->first();

        if ($existingDocument) {
            // Delete old file
            if (Storage::disk('public')->exists($existingDocument->file_path)) {
                Storage::disk('public')->delete($existingDocument->file_path);
            }
            
            // Delete old record
            $existingDocument->delete();
        }

        // Store the new file
        $path = $file->store('documents/workers/' . $user->id, 'public');

        // Create document record
        $document = Document::create([
            'user_id' => $user->id,
            'document_type' => $request->document_type,
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'status' => DocumentVerificationStatus::PENDING,
            'uploaded_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Document uploaded successfully.');
    }

    /**
     * Download a document.
     */
    public function download(Document $document)
    {
        $user = request()->user();

        // Ensure the document belongs to the authenticated user
        if ($document->user_id !== $user->id) {
            abort(403, 'Unauthorized access to document.');
        }

        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'Document file not found.');
        }

        return Storage::disk('public')->download($document->file_path, $document->original_name);
    }

    /**
     * Delete a document.
     */
    public function destroy(Document $document)
    {
        $user = request()->user();

        // Ensure the document belongs to the authenticated user
        if ($document->user_id !== $user->id) {
            abort(403, 'Unauthorized access to document.');
        }

        // Only allow deletion if the document is pending or requires attention
        if ($document->status === DocumentVerificationStatus::APPROVED) {
            return redirect()->back()->with('error', 'Cannot delete an approved document. Please contact support.');
        }

        // Delete the file
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        // Delete the record
        $document->delete();

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }
}
