// Registration status values from the API
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

// Rejection reason entry as returned by /rejection-reasons and the client list
export interface RejectionReasonEntry {
    id?: number; // id is not sent on the client list payload, only on /rejection-reasons
    code: string;
    label: string;
}

// Client record returned by GET /api/clients
export interface Client {
    user_id: number;
    name: string;
    email: string;
    phone_no: string | null;
    acctno: string;
    status: RegistrationStatus;
    class: string | null; // A/B/C/D or null
    prc_id_photo_front: string | null;
    prc_id_photo_back: string | null;
    payslip_photo_path: string | null;
    profile_picture_path: string | null;
    profile_picture_url?: string | null; // optional fully-qualified URL from API
    created_at: string;       // ISO string
    reviewed_at: string | null;
    reviewed_by: number | null;
    salary_amount: number | null;
    notes: string | null;
    rejection_reasons: RejectionReasonEntry[]; // empty array when not rejected
}

// Payload for reject action
export interface RejectPayload {
    reasons: string[]; // array of reason codes
}

// Payload for salary update
export interface SalaryPayload {
    salary_amount: number;
    notes?: string | null;
}

// WLN Master lookup payloads
export type WlnMasterRecord = {
    acctno?: string;
    lnnumber?: string;
    balance?: number | string | null;
    date_end?: string | null;
    remarks?: string | null;
    [key: string]: unknown;
};

export interface WlnMasterResponse {
    acctno: string;
    records: WlnMasterRecord[];
}

// Amortization schedule for admin client management (no identifiers returned)
export interface AmortschedDisplayEntry {
    date_pay: string | null;
    amortization: number | null;
    interest: number | null;
    balance: number | null;
}

export interface AmortschedDisplayResponse {
    schedule: AmortschedDisplayEntry[];
}

// Amortization schedule
export interface AmortizationEntry {
    controlno: string;
    lnnumber: string;
    date_pay: string | null;
    amortization: number | null;
    interest: number | null;
    balance: number | null;
}

export interface AmortizationScheduleResponse {
    lnnumber: string;
    schedule: AmortizationEntry[];
}

// WLN ledger entries (wlnled table)
export interface WlnLedEntry {
    date_in: string | null;
    mreference: string | null;
    lntype: string | null;
    transaction_code: string | null;
    principal: number | null;
    payments: number | null;
    debit: number | null;
    credit: number | null;
    balance: number | null;
    accruedint: number | null;
}

export interface WlnLedResponse {
    lnnumber: string;
    ledger: WlnLedEntry[];
}
