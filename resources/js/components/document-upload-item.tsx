import { useState, useRef } from 'react'
import { router, Form, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { DocumentType } from '@/types/document'
import { type SharedData } from '@/types'

interface DocumentUploadItemProps {
  documentType: DocumentType
  uploadedDocument?: any
  status: string
  statusBadge: React.ReactNode
  onUploadStart: () => void
  onUploadEnd: () => void
  onUploadSuccess: () => void
  onUploadError: (error: string) => void
  isUploading: boolean
  error?: string
}

export function DocumentUploadItem({
  documentType,
  uploadedDocument,
  status,
  statusBadge,
  onUploadStart,
  onUploadEnd,
  onUploadSuccess,
  onUploadError,
  isUploading,
  error
}: DocumentUploadItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const { csrf_token } = usePage<SharedData>().props

  const handleFileSelect = (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Invalid file type. Please upload PDF, JPG, PNG, GIF, DOC, or DOCX files only.')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      onUploadError('File size too large. Please upload files smaller than 10MB.')
      return
    }

    uploadFile(file)
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
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
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

  const handleDelete = async () => {
    if (!uploadedDocument) return

    try {
      const response = await fetch('/documents/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrf_token,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ document_id: uploadedDocument.id }),
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

  const handleDownload = () => {
    if (uploadedDocument) {
      window.open(`/documents/download/${uploadedDocument.id}`, '_blank')
    }
  }

  return (
    <Card className={`transition-all duration-200 ${dragOver ? 'border-blue-500 bg-blue-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {documentType.displayName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {documentType.description}
            </p>
          </div>
          <div className="ml-4">
            {statusBadge}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadedDocument ? (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                📄 {uploadedDocument.original_name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({(uploadedDocument.file_size / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Replace
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`mt-3 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-2">
              <div className="text-gray-600 dark:text-gray-300">
                📁 Drag and drop your file here, or
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Choose File'}
              </Button>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                PDF, JPG, PNG, GIF, DOC, DOCX (max 10MB)
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
          onChange={handleFileInputChange}
        />
      </CardContent>
    </Card>
  )
}
