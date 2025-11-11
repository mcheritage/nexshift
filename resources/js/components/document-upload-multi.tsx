import { useState, useRef } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { DocumentType } from '@/types/document'
import { type SharedData } from '@/types'
import { usePage } from '@inertiajs/react'
import { X, Download, Upload } from 'lucide-react'

interface DocumentUploadMultiProps {
  documentType: DocumentType
  uploadedDocuments: any[]
  onUploadStart: () => void
  onUploadEnd: () => void
  onUploadSuccess: () => void
  onUploadError: (error: string) => void
  isUploading: boolean
  error?: string
}

export function DocumentUploadMulti({
  documentType,
  uploadedDocuments = [],
  onUploadStart,
  onUploadEnd,
  onUploadSuccess,
  onUploadError,
  isUploading,
  error
}: DocumentUploadMultiProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const { csrf_token } = usePage<SharedData>().props

  const handleFileSelect = (files: FileList) => {
    if (!files || files.length === 0) return

    // Validate and upload each file
    Array.from(files).forEach(file => {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        onUploadError(`Invalid file type for ${file.name}. Please upload PDF, JPG, PNG, GIF, DOC, or DOCX files only.`)
        return
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (file.size > maxSize) {
        onUploadError(`File ${file.name} is too large. Please upload files smaller than 10MB.`)
        return
      }

      uploadFile(file)
    })
  }

  const uploadFile = async (file: File) => {
    onUploadStart()
    
    const formData = new FormData()
    formData.append('document_type', documentType.value)
    formData.append('file', file)
    formData.append('_token', csrf_token)

    try {
      const response = await fetch('/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (response.ok) {
        onUploadSuccess()
      } else {
        const data = await response.json()
        onUploadError(data.message || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      onUploadError('Network error. Please try again.')
    } finally {
      onUploadEnd()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFileSelect(files)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDelete = async (documentId: number) => {
    try {
      const response = await fetch('/documents/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrf_token,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ document_id: documentId }),
      })

      if (response.ok) {
        router.reload()
      } else {
        const data = await response.json()
        onUploadError(data.message || 'Delete failed')
      }
    } catch (err) {
      onUploadError('Network error. Please try again.')
    }
  }

  const handleDownload = (documentId: number) => {
    window.open(`/documents/download/${documentId}`, '_blank')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500 text-xs">Approved</Badge>
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <Card className={`transition-all duration-200 ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {documentType.displayName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {documentType.description}
            </p>
            {uploadedDocuments.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {uploadedDocuments.length} file(s) uploaded
              </p>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-3 mb-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors mb-3 ${
            dragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Drag and drop files here, or
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </Button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              PDF, JPG, PNG, GIF, DOC, DOCX (max 10MB each)
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedDocuments.length > 0 && (
          <div className="space-y-2">
            {uploadedDocuments.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    📄 {doc.original_name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    ({(doc.file_size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                  {getStatusBadge(doc.status)}
                </div>
                <div className="flex space-x-1 ml-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc.id)}
                    className="h-8 w-8 p-0"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    disabled={isUploading}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    title="Delete"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
          onChange={handleFileInputChange}
          multiple
        />
      </CardContent>
    </Card>
  )
}
