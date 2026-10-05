import {
  User, LostItem, FoundItem, CandidateMatch, Claim,
  NotificationItem, AuditLogItem, CampusLocationItem,
  AnalyticsData, DetectiveQuestion, DetectiveAnswerResponse,
  NaturalSearchResponse, ItemFingerprint
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('traceback_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers as Record<string, string>) };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.warn(`[API] Error on ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string):Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { name: string; email: string; password: string; role?: string; department?: string }): Promise<{ user: User; token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<User> {
    return this.request('/auth/me');
  }

  async getDemoUsers(): Promise<Array<{ role: string; name: string; email: string; password: string; title: string; avatar_url: string }>> {
    return this.request('/auth/demo-users');
  }

  // Lost Items
  async getLostItems(params?: { category?: string; location?: string; status?: string; my_only?: boolean }): Promise<LostItem[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.location) query.append('location', params.location);
    if (params?.status) query.append('status', params.status);
    if (params?.my_only) query.append('my_only', 'true');
    const qs = query.toString();
    return this.request(`/lost-items${qs ? `?${qs}` : ''}`);
  }

  async getLostItem(id: string): Promise<LostItem> {
    return this.request(`/lost-items/${id}`);
  }

  async createLostItem(data: {
    title: string;
    category: string;
    description: string;
    location: string;
    lost_at: string;
    image_url?: string;
    private_clue?: string;
  }): Promise<{ item: LostItem; fingerprint: ItemFingerprint; candidate_count: number; top_match_score: number }> {
    return this.request('/lost-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Found Items
  async getFoundItems(params?: { category?: string; location?: string; status?: string; query?: string }): Promise<FoundItem[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.location) query.append('location', params.location);
    if (params?.status) query.append('status', params.status);
    if (params?.query) query.append('query', params.query);
    const qs = query.toString();
    return this.request(`/found-items${qs ? `?${qs}` : ''}`);
  }

  async getFoundItem(id: string): Promise<FoundItem> {
    return this.request(`/found-items/${id}`);
  }

  async createFoundItem(data: {
    title: string;
    category: string;
    description: string;
    location: string;
    found_at: string;
    image_url?: string;
    custody_location?: string;
  }): Promise<{ item: FoundItem; fingerprint: ItemFingerprint; notified_owners: number }> {
    return this.request('/found-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI & Matching
  async getAiStatus(): Promise<{ engine: string; is_live_ai: boolean; weights: Record<string, number> }> {
    return this.request('/ai/status');
  }

  async matchItem(lostItemId: string): Promise<{ lost_item_id: string; total_candidates: number; matches: CandidateMatch[] }> {
    return this.request(`/ai/match/${lostItemId}`, {
      method: 'POST',
    });
  }

  async getClarification(lostItemId: string): Promise<DetectiveQuestion> {
    return this.request(`/ai/clarify/${lostItemId}`);
  }

  async answerClarification(lostItemId: string, questionId: string, answer: string, notes?: string): Promise<DetectiveAnswerResponse> {
    return this.request(`/ai/clarify/${lostItemId}`, {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, answer, notes }),
    });
  }

  async naturalSearch(query: string): Promise<NaturalSearchResponse> {
    return this.request('/ai/natural-search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Claims
  async getClaims(status?: string): Promise<Claim[]> {
    const qs = status ? `?status=${status}` : '';
    return this.request(`/claims${qs}`);
  }

  async getClaim(id: string): Promise<{ claim: Claim; found_item: FoundItem }> {
    return this.request(`/claims/${id}`);
  }

  async submitClaim(data: {
    found_item_id: string;
    lost_item_id?: string;
    identifying_evidence: string;
    proof_image_url?: string;
  }): Promise<Claim> {
    return this.request('/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async reviewClaim(claimId: string, status: 'approved' | 'rejected', review_reason: string): Promise<Claim> {
    return this.request(`/claims/${claimId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, review_reason }),
    });
  }

  async handoverClaim(claimId: string, handover_notes?: string): Promise<{ status: string; message: string; claim: Claim }> {
    return this.request(`/claims/${claimId}/handover`, {
      method: 'POST',
      body: JSON.stringify({ handover_notes }),
    });
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unread_count: number }> {
    return this.request('/notifications');
  }

  async markNotificationRead(notifId: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${notifId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead(): Promise<{ marked_read: number }> {
    return this.request('/notifications/read-all', {
      method: 'POST',
    });
  }

  // Analytics & Heatmap
  async getAnalytics(): Promise<AnalyticsData> {
    return this.request('/analytics');
  }

  async getHeatmap(): Promise<{
    locations: CampusLocationItem[];
    hotspots: Array<{ zone: string; code: string; count: number; primary_lost_category: string }>;
    max_density: number;
    campus_meta: { name: string; active_zones: number; safest_zone: string; highest_risk_zone: string };
  }> {
    return this.request('/heatmap');
  }

  // Audit Logs
  async getAuditLogs(action?: string, target_type?: string): Promise<AuditLogItem[]> {
    const query = new URLSearchParams();
    if (action) query.append('action', action);
    if (target_type) query.append('target_type', target_type);
    const qs = query.toString();
    return this.request(`/audit-logs${qs ? `?${qs}` : ''}`);
  }

  // Upload File
  async uploadFile(file: File): Promise<{ filename: string; url: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('traceback_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      headers,
    });
    if (!res.ok) throw new Error('File upload failed');
    return res.json();
  }

  async resetDemoData(): Promise<{ status: string; message: string }> {
    return this.request('/reset-demo', { method: 'POST' });
  }
}

export const api = new ApiService();
