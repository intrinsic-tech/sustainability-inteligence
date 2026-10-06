// Shapes returned by BACKEND_URL/reports/{report_id}/documents. The backend fills
// sections progressively, so almost everything is optional.

export type IngestedDocument = {
  id: string;
  filename: string;
  document_type: string;
  size_bytes: number;
  content_type: string;
  uploaded_at: string;
};

export type Flag = {
  code: string;
  severity: string;
  message: string;
};

export type Location = {
  id: string;
  address: string;
  type: string;
  included?: boolean;
};

export type GeneralInformation = {
  identity?: {
    company_name?: string;
    vat_number?: string;
    fiscal_code?: string;
    legal_form?: string;
    incorporation_date?: string;
    rea_code?: string;
    pec_email?: string;
    primary_ateco?: string;
    primary_ateco_description?: string;
    governance_system?: string;
    share_capital_subscribed?: number;
  };
  workforce?: {
    headcount_inps?: number;
    headcount_period?: string;
    headcount_statement_average?: number;
    personnel_cost_per_employee_formatted?: string;
  };
  financial_metrics?: {
    target_year?: number;
    revenue_formatted?: string;
    revenue_growth_yoy?: string;
    mol_formatted?: string;
    mol_margin_formatted?: string;
    roe_formatted?: string;
    equity_ratio_formatted?: string;
    debt_to_equity_formatted?: string;
    interest_cover_formatted?: string;
    total_assets_formatted?: string;
    total_debt_formatted?: string;
    receivable_days_formatted?: string;
    history?: {
      year: number;
      revenue_formatted?: string;
      mol_formatted?: string;
      mol_margin?: string;
    }[];
  };
  locations?: Location[];
  website_summary?: {
    business_model?: string;
    key_activities?: string[];
  };
  flags?: Flag[];
};

export type Theme = {
  id: string;
  title: string;
  status: string;
  risk_level?: number;
  opportunity_level?: number;
  kicker?: string;
  why_material?: string;
  analysis?: string[];
  evidence?: { value: string; label: string; source?: string }[];
  credit_relevance?: string;
  risks?: { hazard: string; description: string }[];
  opportunities?: { lever: string; description: string }[];
  recommendations?: {
    id: string;
    priority: string;
    horizon: string;
    action: string;
  }[];
  kpis?: string[];
  meeting_questions?: string[];
  shareholders?: { name: string; percentage: number; birth_year?: number }[];
  administrators?: { name: string; role: string; appointment_date?: string }[];
};

export type HazardRow = {
  hazard_key: string;
  hazard_label_it: string;
  score_formatted: string;
  rating_today: string;
  rating_2050: string;
  trend: string;
  is_major: boolean;
};

export type ThemedSection = {
  themes?: Record<string, Theme>;
};

export type EnvironmentalSection = ThemedSection & {
  site_summary?: {
    overall_score_formatted?: string;
    overall_rating?: string;
    overall_rating_label?: string;
    hazard_summary_table?: HazardRow[];
  };
};

export type DocumentsResponse = {
  status: string;
  report_id: string;
  documents_ingested: IngestedDocument[];
  report_v1?: {
    status?: string;
    general_information?: GeneralInformation;
    environmental?: EnvironmentalSection;
    social?: ThemedSection;
    governance?: ThemedSection;
  };
};
