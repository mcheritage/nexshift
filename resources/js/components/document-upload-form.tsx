import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DocumentUploadItem } from './document-upload-item'
import { DocumentType } from '@/types/document'

interface DocumentUploadFormProps {
  requiredDocuments: DocumentType[]
  uploadedDocuments: Record<string, any>
  careHomeId: string
}

export function DocumentUploadForm({ 
  requiredDocuments, 
  uploadedDocuments, 
  careHomeId 
}: DocumentUploadFormProps) {
  const [uploading, setUploading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleUploadSuccess = (documentType: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[documentType]
      return newErrors
    })
    // Refresh the page to show updated documents
    router.reload()
  }

  const handleUploadError = (documentType: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [documentType]: error
    }))
  }

  const getDocumentStatus = (documentType: string) => {
    const uploaded = uploadedDocuments[documentType]
    if (!uploaded) return 'missing'
    return uploaded.status || 'pending'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'missing':
      default:
        return <Badge variant="outline">Not Uploaded</Badge>
    }
  }

  const completedCount = requiredDocuments.filter(doc => 
    getDocumentStatus(doc.value) === 'approved'
  ).length

  const totalCount = requiredDocuments.length

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Upload Progress</CardTitle>
          <CardDescription className="dark:text-gray-300">
            Complete all required document uploads to verify your care home's legitimacy and adherence to standards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedCount} / {totalCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Documents Approved
              </div>
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
          
          {completedCount === totalCount && (
            <Alert>
              <AlertDescription>
                🎉 Congratulations! All required documents have been uploaded and approved.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Document Categories */}
      <div className="space-y-6">
        {/* Registration & Legal Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Registration & Legal Documents</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Essential legal and registration documents required for care home operation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredDocuments
              .filter(doc => doc.value.startsWith('cqc_') || 
                           doc.value.startsWith('company_') || 
                           doc.value.startsWith('business_') || 
                           doc.value.startsWith('operating_') || 
                           doc.value.includes('insurance'))
              .map(doc => (
                <DocumentUploadItem
                  key={doc.value}
                  documentType={doc}
                  uploadedDocument={uploadedDocuments[doc.value]}
                  status={getDocumentStatus(doc.value)}
                  statusBadge={getStatusBadge(getDocumentStatus(doc.value))}
                  onUploadStart={() => setUploading(doc.value)}
                  onUploadEnd={() => setUploading(null)}
                  onUploadSuccess={() => handleUploadSuccess(doc.value)}
                  onUploadError={(error) => handleUploadError(doc.value, error)}
                  isUploading={uploading === doc.value}
                  error={errors[doc.value]}
                />
              ))}
          </CardContent>
        </Card>

        {/* Compliance & Safety */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Compliance & Safety</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Safety policies, certificates, and compliance documentation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredDocuments
              .filter(doc => doc.value.includes('safeguarding') || 
                           doc.value.includes('health_safety') || 
                           doc.value.includes('fire') || 
                           doc.value.includes('food') || 
                           doc.value.includes('dbs'))
              .map(doc => (
                <DocumentUploadItem
                  key={doc.value}
                  documentType={doc}
                  uploadedDocument={uploadedDocuments[doc.value]}
                  status={getDocumentStatus(doc.value)}
                  statusBadge={getStatusBadge(getDocumentStatus(doc.value))}
                  onUploadStart={() => setUploading(doc.value)}
                  onUploadEnd={() => setUploading(null)}
                  onUploadSuccess={() => handleUploadSuccess(doc.value)}
                  onUploadError={(error) => handleUploadError(doc.value, error)}
                  isUploading={uploading === doc.value}
                  error={errors[doc.value]}
                />
              ))}
          </CardContent>
        </Card>

        {/* Financial & Operational */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Financial & Operational</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Financial verification and operational documentation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredDocuments
              .filter(doc => doc.value.includes('address') || 
                           doc.value.includes('utility') || 
                           doc.value.includes('bank') || 
                           doc.value.includes('authority') || 
                           doc.value.includes('training'))
              .map(doc => (
                <DocumentUploadItem
                  key={doc.value}
                  documentType={doc}
                  uploadedDocument={uploadedDocuments[doc.value]}
                  status={getDocumentStatus(doc.value)}
                  statusBadge={getStatusBadge(getDocumentStatus(doc.value))}
                  onUploadStart={() => setUploading(doc.value)}
                  onUploadEnd={() => setUploading(null)}
                  onUploadSuccess={() => handleUploadSuccess(doc.value)}
                  onUploadError={(error) => handleUploadError(doc.value, error)}
                  isUploading={uploading === doc.value}
                  error={errors[doc.value]}
                />
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


