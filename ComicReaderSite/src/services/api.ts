// src/services/api.ts
// Unified ApiService for Tomcat backend

// ===== Base URL resolution =====
const DEFAULT_API_BASE_CANDIDATES = [
  process.env.NEXT_PUBLIC_API_BASE,                 // explicit ENV
  'http://localhost:8080/api',
]
  .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
  .map((v) => v.replace(/\/$/, ''));

const uniqueCandidates = Array.from(new Set(DEFAULT_API_BASE_CANDIDATES));

let candidateBaseUrls = uniqueCandidates.length > 0
  ? [...uniqueCandidates]
  : ['http://localhost:8080/ComicDashboard/api'];

if (typeof window !== 'undefined') {
  const { protocol, hostname } = window.location;
  // add same-host candidates
  const origins = [
    `${protocol}//${hostname}:8080/ComicDashboard/api`,
    `${protocol}//${hostname}:8080/Comic/api`,
  ];
  candidateBaseUrls.push(...origins);
}

const CANDIDATE_BASE_URLS = Array.from(new Set(candidateBaseUrls));

// ===== Service =====
class ApiService {
  private candidateBaseUrls: string[];
  private resolvedBaseUrl: string | null = null;
  private resolvingPromise: Promise<string> | null = null;

  constructor(baseUrls: string[] = CANDIDATE_BASE_URLS) {
    this.candidateBaseUrls = baseUrls;
  }

  /** useful for debugging */
  public getResolvedBaseUrl() {
    return this.resolvedBaseUrl;
  }

  // ---------- helpers ----------
  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async resolveBaseUrl(): Promise<string> {
    if (this.resolvedBaseUrl) return this.resolvedBaseUrl;
    if (this.resolvingPromise) return this.resolvingPromise;

    this.resolvingPromise = (async () => {
      console.debug('[ApiService] Resolve base URL from:', this.candidateBaseUrls);
      for (const base of this.candidateBaseUrls) {
        try {
          const r = await fetch(`${base}/health`, { method: 'GET', mode: 'cors' });
          if (r.ok) {
            this.resolvedBaseUrl = base;
            console.info(`[ApiService] Using backend base URL: ${base}`);
            return base;
          }
        } catch (e) {
          console.warn(`[ApiService] Probe failed: ${base}/health`, e);
        }
      }
      // fallback to first
      const fb = this.candidateBaseUrls[0];
      this.resolvedBaseUrl = fb;
      console.warn(`[ApiService] Falling back to: ${fb}`);
      return fb;
    })().finally(() => (this.resolvingPromise = null));

    return this.resolvingPromise as Promise<string>;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const normalised = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = await this.resolveBaseUrl();
    const url = `${baseUrl}${normalised}`;

    const authHeaders = this.getAuthHeaders();
    const mergedHeaders: Record<string, string> = { ...authHeaders };

    if (options.headers instanceof Headers) {
      options.headers.forEach((v, k) => (mergedHeaders[k] = v));
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([k, v]) => (mergedHeaders[k] = v));
    } else if (options.headers) {
      Object.assign(mergedHeaders, options.headers as Record<string, string>);
    }

    const hasBody = options.body !== undefined && options.body !== null;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (hasBody && !isFormData && !mergedHeaders['Content-Type']) {
      mergedHeaders['Content-Type'] = 'application/json';
    }

    try {
      console.debug('[ApiService] request', { url, options });
      const response = await fetch(url, {
        ...options,
        headers: { ...mergedHeaders },
        mode: 'cors',
      });

      if (!response.ok) {
        let errBody: any = null;
        try { errBody = await response.json(); } catch {}
        const baseMsg = `HTTP error! status: ${response.status}`;
        const msg = errBody?.message || errBody?.error || baseMsg;
        throw new Error(msg);
      }

      const contentLength = response.headers.get('content-length');
      if (response.status === 204 || contentLength === '0') return null as T;

      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) return (await response.json()) as T;

      const text = await response.text();
      return text as unknown as T;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      if (error instanceof TypeError) {
        const hint =
          'The browser blocked this request. Check backend is running and base URL/context path is correct (e.g., http://localhost:8080/ComicDashboard-1.0-SNAPSHOT/api).';
        throw new Error(`${error.message} - ${hint}`);
      }
      throw error;
    }
  }

  // ---------- Auth ----------
  /**
   * login supports:
   *  - login(usernameOrEmail, password)
   *  - login({ username?, email?, password })
   * Strategy: send JSON with both fields (backend thường bỏ qua field dư).
   * Nếu server trả 400/415, tự fallback sang x-www-form-urlencoded.
   */
  async login(
    identifierOrObj: { username?: string; email?: string; password: string } | string,
    password?: string
  ) {
    let username: string | undefined;
    let email: string | undefined;
    let pwd: string | undefined;

    if (typeof identifierOrObj === 'object' && identifierOrObj !== null) {
      username = identifierOrObj.username;
      email = identifierOrObj.email;
      pwd = identifierOrObj.password;
    } else {
      const id = String(identifierOrObj);
      pwd = password;
      if (id.includes('@')) email = id;
      else username = id;
    }

    // 1) try JSON
    try {
      return await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, email, password: pwd }),
      });
    } catch (e: any) {
      const m = String(e?.message || '');
      // 2) fallback to x-www-form-urlencoded for legacy controllers
      if (m.includes('400') || m.includes('415') || m.includes('Unsupported Media Type')) {
        const body = new URLSearchParams();
        if (username) body.set('username', username);
        if (email) body.set('email', email!);
        if (pwd) body.set('password', pwd);
        return this.request('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });
      }
      throw e;
    }
  }

  logout() { return this.request('/auth/logout', { method: 'POST' }); }
  getCurrentUser() { return this.request('/auth/me'); }

  register(username: string, email: string, password: string, role: 'reader' | 'editor' = 'reader') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });
  }

  // ---------- Dashboard ----------
  getDashboardStats() { return this.request('/dashboard/stats'); }
  getRecentActivity() { return this.request('/dashboard/activity'); }

  // ---------- Users / Profiles ----------
  getUserList(page = 1, limit = 10) { return this.request(`/users?page=${page}&limit=${limit}`); }
  getUserById(id: string) { return this.request(`/users/${id}`); }
  createUser(userData: any) { return this.request('/users', { method: 'POST', body: JSON.stringify(userData) }); }
  updateUser(id: string, userData: any) { return this.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }); }
  deleteUser(id: string) { return this.request(`/users/${id}`, { method: 'DELETE' }); }

  getProfile(userId: string) { return this.request(`/users/${userId}`); }
  updateProfile(userId: string, profileData: any) {
    return this.request(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(profileData) });
  }

  // ---------- Reading History ----------
  getReadingHistory(userId: string) { return this.request(`/reading-history?userId=${userId}`); }
  saveReadingProgress(mangaId: string, chapterId: string, currentPage: number, completed = false) {
    return this.request('/reading-history', {
      method: 'POST',
      body: JSON.stringify({ mangaId, chapterId, currentPage, completed }),
    });
  }
  deleteReadingHistory(historyId: string) { return this.request(`/reading-history/${historyId}`, { method: 'DELETE' }); }

  // ---------- Follow ----------
  followUser(userId: string) { return this.request(`/follow/${userId}`, { method: 'POST' }); }
  unfollowUser(userId: string) { return this.request(`/follow/${userId}`, { method: 'DELETE' }); }
  getFollowers(userId: string) { return this.request(`/follow/followers?userId=${userId}`); }
  getFollowing(userId: string) { return this.request(`/follow/following?userId=${userId}`); }

  // ---------- Manga ----------
  getMangaList() { return this.request('/manga'); }
  getMangaById(id: string) { return this.request(`/manga/${id}`); }
  getChapterImages(mangaId: string, chapterId: string) {
    const query = new URLSearchParams({ mangaId, chapterId });
    return this.request(`/chapter-images?${query.toString()}`);
  }
  createManga(mangaData: any) { return this.request('/manga', { method: 'POST', body: JSON.stringify(mangaData) }); }
  updateManga(id: string, mangaData: any) { return this.request(`/manga/${id}`, { method: 'PUT', body: JSON.stringify(mangaData) }); }
  deleteManga(id: string) { return this.request(`/manga/${id}`, { method: 'DELETE' }); }

  // ---------- EPUB ----------
  getEpubList() { return this.request('/epub'); }
  getUserEpubs(userId: string | number) { return this.request(`/epub/user/${userId}`); }
  getEpubById(id: string | number) { return this.request(`/epub/${id}`); }
  deleteEpub(id: string | number) { return this.request(`/epub/${id}`, { method: 'DELETE' }); }

  uploadEpub(file: File, title?: string, userId?: string) {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    if (userId) form.append('userId', userId);
    // KHÔNG set Content-Type để browser tự thêm boundary
    return this.request('/epub', { method: 'POST', body: form });
  }

  /** ArrayBuffer EPUB (dùng cho epub.js) */
  async getEpubFileArrayBuffer(id: string | number): Promise<ArrayBuffer> {
    const baseUrl = await this.resolveBaseUrl();
    const url = `${baseUrl}/epub/file?id=${encodeURIComponent(String(id))}`;
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j?.message || j?.error || msg;
      } catch {}
      throw new Error(msg);
    }
    return await res.arrayBuffer();
  }

  /** (optional) absolute URL to EPUB file */
  async getEpubFileUrl(id: string | number): Promise<string> {
    const baseUrl = await this.resolveBaseUrl();
    return `${baseUrl}/epub/file?id=${encodeURIComponent(String(id))}`;
  }

  // ---------- Health ----------
  async healthCheck(): Promise<boolean> {
    try { await this.request('/health'); return true; } catch { return false; }
  }
}

export const apiService = new ApiService();
export default apiService;
