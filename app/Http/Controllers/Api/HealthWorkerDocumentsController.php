<?php

namespace App\Http\Controllers\Api;

use App\DocumentType;
use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class HealthWorkerDocumentsController extends Controller
{
    private const MAX_FILE_SIZE = 1024 * 3; // 3MB in KB
    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    public function getRequiredDocuments(Request $request): JsonResponse
    {
        $user = $request->user();
        $required_docs = DocumentType::getRequiredHealthWorkerDocumentsAsGrouped();
        $uploaded_docs = Document::query()->where('user_id', $user->id)->get();

        $data = [];

        foreach ($required_docs as $cat => $required_doc_list) {
            $data[] = [
              'category' => $cat,
              'documents' => array_map(function ($doc) use ($uploaded_docs) {
                  $uploaded_doc = $uploaded_docs->where('document_type', $doc->value)->first();

                  return [
                      'doc_type' => $doc->value,
                      'name' => $doc->getDisplayName(),
                      'description' => $doc->getDescription(),
                      'uploaded' => $uploaded_doc
                  ];
              }, $required_doc_list)
            ];
        }

        return response()->json($data);
    }


    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'document_type' => 'required|string',
            'file' => 'required|file|max:' . self::MAX_FILE_SIZE,
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Validate document type
        $documentType = DocumentType::tryFrom($request->document_type);
        if (!$documentType) {
            return response()->json(['message' => 'Invalid document type'], 400);
        }

        $file = $request->file('file');

        try {
            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('documents/health-worker/' . $user->id, $filename, 'private');

            // Create or update document record
            $document = Document::updateOrCreate(
                [
                    'user_id' => $user->id,
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
}
