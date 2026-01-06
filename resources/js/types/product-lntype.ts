// types/product-lntype.ts

// Main Product Type (from WlnProducts model)
export interface ProductLntype {
    // Primary key
    product_id: number;

    // Fillable fields from WlnProducts
    product_name: string;
    is_active: boolean;
    is_multiple: boolean;
    schemes: string | null;
    mode: string | null;
    interest_rate: number | null;
    max_term_days: number | null;
    max_term_months: number; // Computed from max_term_days
    is_max_term_editable: boolean | null;
    max_amortization_mode: 'FIXED' | 'BASIC' | 'CUSTOM';
    max_amortization_formula: string | null;
    max_amortization: number | null;
    computed_result: number; // Computed max amortization based on mode
    is_max_amortization_editable: boolean | null;
    service_fee: number | null;
    lrf: number | null;
    document_stamp: number | null;
    mort_plus_notarial: number | null;
    terms: string | null;

    // // Timestamps (public $timestamps = true)
    // created_at: string;
    // updated_at: string;

    // Relationships (when loaded)
    types?: WlnType[]; // From ->load('types')
    tags?: WlnProductTag[]; // From ->load('tags') if ever used
}

// Type from WlnType model
export interface WlnType {
    controlno: number; // Primary key
    typecode: string; // Used in relationships
    lntype: string;
    lntags: string;
    // Add other fields from your wlntype table here based on the actual columns
    description?: string; // Example - adjust based on your actual table structure
    created_at?: string;
    updated_at?: string;

    // Pivot data (if using withPivot())
    pivot?: {
        product_id: number;
        typecode: string;
        created_at: string;
        updated_at: string;
    };
}

// Pivot table (from WlnProductTags model)
export interface WlnProductTag {
    product_id: number;
    typecode: string;
    created_at: string;
    updated_at: string;
}

// Payload for Create/Update (matches fillable + typecodes)
export interface ProductPayload {
    product_name: string;
    is_active: boolean;
    is_multiple: boolean;
    schemes?: string | null;
    mode?: string | null;
    interest_rate?: number | null;
    max_term_days?: number | null;
    is_max_term_editable?: boolean | null;
    max_amortization_mode: 'FIXED' | 'BASIC' | 'CUSTOM';
    max_amortization_formula: string | null;
    max_amortization?: number | null;
    is_max_amortization_editable?: boolean | null;
    service_fee?: number | null;
    lrf?: number | null;
    document_stamp?: number | null;
    mort_plus_notarial?: number | null;
    terms?: string | null;
    typecodes?: string[]; // For syncing the relationship
}

// Laravel Pagination Response
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

// Delete Response
export interface DeleteResponse {
    deleted: boolean;
}
