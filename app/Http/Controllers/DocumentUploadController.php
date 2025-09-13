<?php

namespace App\Http\Controllers;

use App\DocumentType;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DocumentUploadController extends Controller
{
    private const MAX_FILE_SIZE = 10240; // 10MB in KB
    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    /**
     * Show the document upload page
     */
    public function index(): Response|RedirectResponse
    {
        $user = Auth::user();
        $careHome = $user->care_home;
        
        if (!$careHome) {
            return redirect()->route('register.carehome');
        }

        $requiredDocuments = collect(DocumentType::getAllRequired())->map(function ($docType) {
            return [
                'value' => $docType->value,
                'displayName' => $docType->getDisplayName(),
                'description' => $docType->getDescription(),
            ];
        })->toArray();
        
        $uploadedDocuments = $careHome->documents()->get()->keyBy('document_type');

        return Inertia::render('carehome/document-upload', [
            'requiredDocuments' => $requiredDocuments,
            'uploadedDocuments' => $uploadedDocuments,
            'careHome' => $careHome,
        ]);
    }

    /**
     * Upload a document
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'document_type' => 'required|string',
            'file' => 'required|file|max:' . self::MAX_FILE_SIZE . '|mimes:pdf,jpg,jpeg,png,gif,doc,docx',
        ]);

        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome) {
            return response()->json(['message' => 'Care home not found'], 404);
        }

        // Validate document type
        $documentType = DocumentType::tryFrom($request->document_type);
        if (!$documentType) {
            return response()->json(['message' => 'Invalid document type'], 400);
        }

        $file = $request->file('file');

        // Additional validation
        if (!$this->isValidFile($file)) {
            return response()->json(['message' => 'Invalid file type or size'], 400);
        }

        try {
            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('documents/carehomes/' . $careHome->id, $filename, 'private');

            // Create or update document record
            $document = Document::updateOrCreate(
                [
                    'care_home_id' => $careHome->id,
                    'document_type' => $documentType->value,
                ],
                [
                    'original_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                    'uploaded_at' => now(),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'document' => $document,
            ]);

        } catch (\Exception $e) {
            \Log::error('Document upload failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            return response()->json(['message' => 'Failed to upload document'], 500);
        }
    }

    /**
     * Delete a document
     */
    public function delete(Request $request): JsonResponse
    {
        $request->validate([
            'document_id' => 'required|integer|exists:documents,id',
        ]);

        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome) {
            return response()->json(['message' => 'Care home not found'], 404);
        }

        $document = Document::where('id', $request->document_id)
            ->where('care_home_id', $careHome->id)
            ->first();

        if (!$document) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        try {
            // Delete file from storage
            if (Storage::disk('private')->exists($document->file_path)) {
                Storage::disk('private')->delete($document->file_path);
            }

            // Delete document record
            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete document'], 500);
        }
    }

    /**
     * Download a document
     */
    public function download(Document $document)
    {
        $user = Auth::user();
        $careHome = $user->care_home;

        if (!$careHome || $document->care_home_id !== $careHome->id) {
            abort(404);
        }

        if (!Storage::disk('private')->exists($document->file_path)) {
            abort(404);
        }

        return Storage::disk('private')->download(
            $document->file_path,
            $document->original_name
        );
    }

    /**
     * Validate file type and size
     */
    private function isValidFile($file): bool
    {
        // Check MIME type
        if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES)) {
            return false;
        }

        // Check file size (10MB max)
        if ($file->getSize() > (self::MAX_FILE_SIZE * 1024)) {
            return false;
        }

        return true;
    }
}
