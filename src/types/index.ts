export type UserRole = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar_url?: string;
  created_at: string;
}

export interface ItemFingerprint {
  object_type?: string;
  brand?: string | null;
  primary_color?: string;
  secondary_colors?: string[];
  material?: string | null;
  shape_size?: string | null;
  visible_text?: string[];
  logos?: string[];
  distinctive_marks?: string[];
  accessories?: string[];
  location?: string | null;
  event_time?: string | null;
  embedding?: number[] | null;
  confidence?: number;
}

export interface ComponentScores {
  visual: number;
  semantic: number;
  distinctive: number;
  location: number;
  time: number;
}

export interface LostItem {
  id: string;
  user_id: string;
  reporter_name?: string;
  title: string;
  category: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  lost_at: string;
  image_url?: string;
  private_clue?: string | null;
  fingerprint?: ItemFingerprint;
  status: 'open' | 'potential_match' | 'claim_pending' | 'verified' | 'recovered' | 'closed';
  created_at: string;
}

export interface FoundItem {
  id: string;
  reported_by: string;
  reporter_name?: string;
  title: string;
  category: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  found_at: string;
  image_url?: string;
  custody_location?: string;
  fingerprint?: ItemFingerprint;
  status: 'open' | 'potential_match' | 'claim_pending' | 'verified' | 'recovered' | 'closed';
  created_at: string;
}

export interface CandidateMatch {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  overall_score: number;
  component_scores: ComponentScores;
  supporting_evidence: string[];
  conflicting_evidence: string[];
  found_item: FoundItem;
  status: string;
  created_at: string;
}

export interface DetectiveQuestion {
  id: string;
  lost_item_id: string;
  question: string;
  attribute: string;
  options: string[];
  context: string;
  candidate_impact?: Record<string, string>;
}

export interface ScoreDelta {
  match_id: string;
  found_item_id: string;
  title: string;
  score_before: number;
  score_after: number;
  delta: number;
}

export interface DetectiveAnswerResponse {
  status: string;
  answer: string;
  explanation: string;
  matches: CandidateMatch[];
  score_deltas: ScoreDelta[];
  updated_fingerprint?: ItemFingerprint;
}

export interface Claim {
  id: string;
  found_item_id: string;
  lost_item_id?: string;
  claimant_id: string;
  claimant_name: string;
  claimant_email: string;
  identifying_evidence: string;
  proof_image_url?: string;
  verification_score: number;
  verification_summary: string;
  verification_alignments: string[];
  verification_concerns: string[];
  recommendation: string;
  status: 'claim_pending' | 'approved' | 'rejected' | 'handed_over';
  reviewed_by?: string;
  reviewer_name?: string;
  review_reason?: string;
  reviewed_at?: string;
  handover_by?: string;
  handover_at?: string;
  handover_notes?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'match_found' | 'claim_submitted' | 'claim_approved' | 'claim_rejected' | 'item_recovered' | 'nearby_alert';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CampusLocationItem {
  id: string;
  name: string;
  code: string;
  category: string;
  x: number;
  y: number;
  description: string;
  loss_count: number;
  found_count: number;
  recovery_rate: number;
  active_lost_reports?: number;
  active_found_reports?: number;
  total_incidents?: number;
  intensity?: number;
}

export interface AnalyticsData {
  kpis: {
    total_reports: number;
    lost_items: number;
    found_items: number;
    potential_matches: number;
    pending_claims: number;
    approved_claims: number;
    recovered_items: number;
    recovery_rate: number;
  };
  category_distribution: Array<{ category: string; count: number }>;
  peak_loss_periods: Array<{ period: string; count: number }>;
  confidence_distribution: Array<{ range: string; count: number; color: string }>;
  timeline: Array<{ day: string; lost: number; found: number; recovered: number }>;
  recovery_funnel: Array<{ step: string; count: number; rate: number }>;
}

export interface NaturalSearchResponse {
  understood_as: {
    category?: string | null;
    color?: string | null;
    location?: string | null;
    time?: string | null;
    raw_query: string;
  };
  results: FoundItem[];
}
