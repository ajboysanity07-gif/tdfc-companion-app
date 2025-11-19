// User registration status
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

// Reason codes for rejection
export type RejectionReason =
  | 'prc_id_blurry'
  | 'not_prc_id'
  | 'prc_id_expired'
  | 'payslip_blurry'
  | 'payslip_too_old'
  | 'documents_tampered';

// Interface for user object returned by API for admin management
export interface User {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  phone_no?: string;
  acctno?: string;
  avatar?: string;
  email_verified_at: string | null;
  status?: RegistrationStatus;
  rejection_reasons?: RejectionReason[];
  prc_id_photo_front?: string;
  prc_id_photo_back?: string;
  payslip_photo_path?: string;
  profile_picture_path?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  salary_amount?: number;
  notes?: string;
  class?: string;
}

// Shape of user data used by hook/page (admin client review)
export interface PendingUser {
  user_id: number;
  name: string;
  email: string;
  phone_no: string;
  acctno: string;
  status: RegistrationStatus;
  class?: string; // loan classification (A, B, C, D)
  prc_id_photo_front?: string;
  prc_id_photo_back?: string;
  payslip_photo_path?: string;
  profile_picture_path?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  salary_amount?: number;
  notes?: string;
  rejection_reasons?: Array<{ code: RejectionReason; label: string }>;
}
