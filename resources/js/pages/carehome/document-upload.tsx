import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { DocumentUploadForm } from '@/components/document-upload-form'
import { DocumentType } from '@/types/document'

interface DocumentUploadProps {
  requiredDocuments: DocumentType[]
  uploadedDocuments: Record<string, any>
  careHome: {
    id: string
    name: string
  }
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Documents',
    href: '/documents',
  },
]

export default function DocumentUpload({ 
  requiredDocuments, 
  uploadedDocuments, 
  careHome 
}: DocumentUploadProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Document Upload" />
      
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Document Upload
          </h1>
          <p className="text-muted-foreground">
            Upload all required registration, legal, compliance, and financial documents for {careHome.name}.
          </p>
        </div>

        <DocumentUploadForm 
          requiredDocuments={requiredDocuments}
          uploadedDocuments={uploadedDocuments}
          careHomeId={careHome.id}
        />
      </div>
    </AppLayout>
  )
}
