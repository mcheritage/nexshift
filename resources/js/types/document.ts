export interface DocumentType {
  value: string;
  displayName: string;
  description: string;
}

export type DocumentVerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "requires_attention";

export interface Document {
  id: number;
  care_home_id: string;
  document_type: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: DocumentVerificationStatus;
  rejection_reason?: string;
  action_required?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DocumentStatusInfo {
  status: DocumentVerificationStatus;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  isActionRequired: boolean;
}
