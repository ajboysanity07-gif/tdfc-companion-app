export interface WlnSettings {
  typecode: string;
  ln_isActive?: boolean;
  ln_scheme?: string;
  max_term?: number;
  max_term_isEditable?: boolean;
  max_amortization?: number;
  max_amortization_isEditable?: boolean;
  service_fee?: number;
  lrf?: number;
  doc_stamp?: number;
  mort_notarial?: number;
  terms_and_info?: string;
}

export interface WlnDisplay {
  typecode: string;
  isDisplayed: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WlnTagSummary {
  id: number;
  wlntag_id: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WlnTag {
  id: number;
  typecode: string;
  tag_name: string;
  created_at?: string | null;
  updated_at?: string | null;
  summaries?: WlnTagSummary[];
}

export interface ProductLntype {
  typecode: string;
  lntype: string;
  int_rate?: number;
  settings?: WlnSettings;
  display?: WlnDisplay;
  tags?: WlnTag[];
}
