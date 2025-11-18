// resources/js/types/constants.ts
import { RejectionReason } from './index';

export const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  prc_id_blurry: 'PRC ID photo is blurry',
  not_prc_id: 'The ID photo submitted is not a PRC ID',
  prc_id_expired: 'PRC ID is expired',
  payslip_blurry: 'Payslip photo is blurry',
  payslip_too_old: 'Payslip is too old (more than 3 months)',
  documents_tampered: 'Documents appear to be tampered',
};
