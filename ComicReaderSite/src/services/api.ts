// API Service for communicating with Tomcat backend
// Prefer local env in development. If NEXT_PUBLIC_API_BASE is not set,
// fallback to localhost so local dev doesn't call production by accident.
const DEFAULT_API_BASE_URL =
  "https://backend-comicreadersite.wonderfulbay-fb92c756.eastasia.azurecontainerapps.io/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || DEFAULT_API_BASE_URL;

class ApiService {
  private baseUrl: string;
  private resolvedBaseUrl: string | null = null;
  private resolvingPromise: Promise<string> | null = null;
  private candidateBaseUrls: string[];
  constructor(baseUrl: string = API_BASE_URL) {
    const sanitizedBase = baseUrl.replace(/\/$/, "");
    this.baseUrl = sanitizedBase;

    const envCandidates = (process.env.NEXT_PUBLIC_API_BASE_CANDIDATES || "")
      .split(",")
      .map((candidate) => candidate.trim())
      .filter(Boolean)
      .map((candidate) => candidate.replace(/\/$/, ""));

    const candidates = [
      sanitizedBase,
      ...envCandidates,
      DEFAULT_API_BASE_URL,
    ].map((candidate) => candidate.replace(/\/$/, ""));

    this.candidateBaseUrls = Array.from(new Set(candidates));
    if (this.candidateBaseUrls.length === 0) {
      this.candidateBaseUrls = [DEFAULT_API_BASE_URL];
    }
    this.baseUrl = this.candidateBaseUrls[0];
  }
  public getResolvedBaseUrl(): string {
    return this.resolvedBaseUrl ?? this.baseUrl;
  }

  get base(): string {
    return this.resolvedBaseUrl ?? this.baseUrl;
  }

  // ✅ Helper: add token if exists
  private getAuthHeaders(): Record<string, string> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }
  private async resolveBaseUrl(): Promise<string> {
    if (this.resolvedBaseUrl) return this.resolvedBaseUrl;
    if (this.resolvingPromise) return this.resolvingPromise;

    this.resolvingPromise = (async () => {
      console.debug(
        "[ApiService] Resolve base URL from:",
        this.candidateBaseUrls
      );
      for (const base of this.candidateBaseUrls) {
        try {
          const r = await fetch(`${base}/health`, {
            method: "GET",
            mode: "cors",
          });
          if (r.ok) {
            this.resolvedBaseUrl = base;
            console.info(`[ApiService] Using backend base URL: ${base}`);
            return base;
          }
        } catch (error) {
          console.warn(`[ApiService] Probe failed: ${base}/health`, error);
        }
      }
      const fallback = this.candidateBaseUrls[0];
      this.resolvedBaseUrl = fallback;
      console.warn(`[ApiService] Falling back to: ${fallback}`);
      return fallback;
    })().finally(() => {
      this.resolvingPromise = null;
    });

    return this.resolvingPromise as Promise<string>;
  }
  // ✅ Generic fetch method (your provided code + safe merge)
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const normalisedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const base =
      this.resolvedBaseUrl ??
      (await this.resolveBaseUrl().catch(() => this.baseUrl));
    const url = `${base}${normalisedEndpoint}`;

    const authHeaders = this.getAuthHeaders();
    const mergedHeaders: Record<string, string> = { ...authHeaders };

    // Merge user headers if any
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => (mergedHeaders[key] = value));
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => (mergedHeaders[key] = value));
    } else if (options.headers) {
      Object.assign(mergedHeaders, options.headers as Record<string, string>);
    }

    const hasBody = options.body !== undefined && options.body !== null;
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (hasBody && !isFormData && !mergedHeaders["Content-Type"]) {
      mergedHeaders["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: mergedHeaders,
      });

      if (!response.ok) {
        // Try to parse error message if available
        let errBody = null;
        try {
          errBody = await response.json();
        } catch {}
        const msg =
          errBody && errBody.message
            ? errBody.message
            : `HTTP error! status: ${response.status}`;
        throw new Error(msg);
      }

      const contentLength = response.headers.get("content-length");
      if (response.status === 204 || contentLength === "0") {
        return null as T;
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      const text = await response.text();
      return text as unknown as T;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  // Authentication endpoints
  // login supports being called either:
  //  - login(identifier, password)
  //  - login({ email | username, password })
  // It will always send a payload that has an "email" property (the server expects that field name).
  async login(identifierOrObj: any, password?: string) {
    let identifier: string | undefined;

    if (typeof identifierOrObj === "object" && identifierOrObj !== null) {
      identifier = identifierOrObj.email ?? identifierOrObj.username;
      password = identifierOrObj.password;
    } else {
      identifier = identifierOrObj;
    }

    // always send as "email" so backend's LoginRequest.email is populated
    return this.request("/auth/login", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email: identifier, password }),
    });
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  // Register endpoint (matches /api/auth/register on backend)
  async register(username: string, email: string, password: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request("/dashboard/stats");
  }

  async getRecentActivity() {
    return this.request("/dashboard/activity");
  }

  // Manga endpoints
  async getMangaList() {
    return this.request("/manga");
  }

  async getMangaById(id: string) {
    return this.request(`/manga/${id}`);
  }

  async getChapterImages(mangaId: string, chapterId: string) {
    const query = new URLSearchParams({ mangaId, chapterId });
    return this.request(`/chapter-images?${query.toString()}`);
  }

  async getMangaChapters(mangaId: string) {
    const query = new URLSearchParams({ mangaId });
    return this.request(`/manga-chapters?${query.toString()}`);
  }

  async getMangaChapterById(id: string) {
    return this.request(`/manga-chapters/${id}`);
  }

  async createMangaChapter(chapterData: any) {
    return this.request("/manga-chapters", {
      method: "POST",
      body: JSON.stringify(chapterData),
    });
  }

  async updateMangaChapter(id: string, chapterData: any) {
    return this.request(`/manga-chapters/${id}`, {
      method: "PUT",
      body: JSON.stringify(chapterData),
    });
  }

  async deleteMangaChapter(id: string) {
    return this.request(`/manga-chapters/${id}`, {
      method: "DELETE",
    });
  }

  async createManga(mangaData: any) {
    return this.request("/manga", {
      method: "POST",
      body: JSON.stringify(mangaData),
    });
  }

  async updateManga(id: string, mangaData: any) {
    return this.request(`/manga/${id}`, {
      method: "PUT",
      body: JSON.stringify(mangaData),
    });
  }

  async deleteManga(id: string) {
    return this.request(`/manga/${id}`, {
      method: "DELETE",
    });
  }

  // Moderation endpoints
  async getModerationReports() {
    return this.request("/moderation/reports");
  }

  async getModerationQueue() {
    return this.request("/moderation/approval");
  }

  // User management endpoints
  async getUserList(page: number = 1, limit: number = 10) {
    return this.request(`/users?page=${page}&limit=${limit}`);
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    });
  }

  // Profile endpoints
  async getProfile(userId: string) {
    return this.request(`/users/${userId}`); // Dùng /users thay vì /profile
  }

  async updateProfile(userId: string, profileData: any) {
    return this.request(`/users/${userId}`, {
      // Dùng /users thay vì /profile
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // User Follow endpoints
  async followUser(userId: string) {
    return this.request(`/follow/${userId}`, {
      method: "POST",
    });
  }

  async unfollowUser(userId: string) {
    return this.request(`/follow/${userId}`, {
      method: "DELETE",
    });
  }

  async getFollowers(userId: string) {
    return this.request(`/follow/followers?userId=${userId}`);
  }

  async getFollowing(userId: string) {
    return this.request(`/follow/following?userId=${userId}`);
  }

  // Check if backend is reachable
  async healthCheck(): Promise<boolean> {
    try {
      await this.request("/health");
      return true;
    } catch {
      return false;
    }
  }

  async getPosts(query = "") {
    const base = await this.resolveBaseUrl().catch(() => this.base);
    const r = await fetch(`${base}/posts${query}`, { cache: "no-store" });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async getPostById(id: number) {
    const base = await this.resolveBaseUrl().catch(() => this.base);
    const r = await fetch(`${base}/posts/${id}`, { cache: "no-store" });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async createPost(data: any) {
    const base = await this.resolveBaseUrl().catch(() => this.base);
    const r = await fetch(`${base}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async getComments(postId: number) {
    const base = await this.resolveBaseUrl().catch(() => this.base);
    const r = await fetch(`${base}/comments?postId=${postId}`);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async createComment(data: any) {
    const base = await this.resolveBaseUrl().catch(() => this.base);
    const r = await fetch(`${base}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }
  async getBookmarks() {
    return this.request("/bookmarks");
  }

  async saveBookmark(bookmark: any) {
    return this.request("/bookmarks", {
      method: "POST",
      body: JSON.stringify(bookmark),
    });
  }

  async deleteBookmark(id: string | number) {
    return this.request(`/bookmarks/${id}`, {
      method: "DELETE",
    });
  }

  // ---------- EPUB ----------
  getEpubList() {
    return this.request("/epub");
  }

  getUserEpubs(userId: string | number) {
    return this.request(`/epub/user/${userId}`);
  }

  getEpubById(id: string | number) {
    return this.request(`/epub/${id}`);
  }

  deleteEpub(id: string | number) {
    return this.request(`/epub/${id}`, { method: "DELETE" });
  }

  uploadEpub(file: File, title?: string, userId?: string) {
    if (typeof FormData === "undefined") {
      throw new Error("FormData is not available in the current environment.");
    }
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);
    if (userId) form.append("userId", userId);
    // Do not set Content-Type so browser can add boundary automatically
    return this.request("/epub", { method: "POST", body: form });
  }

  /** ArrayBuffer EPUB (dùng cho epub.js) */
  async getEpubFileArrayBuffer(id: string | number): Promise<ArrayBuffer> {
    const baseUrl = await this.resolveBaseUrl();
    const url = `${baseUrl}/epub/file?id=${encodeURIComponent(String(id))}`;
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const payload = await res.json();
        msg = payload?.message || payload?.error || msg;
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
}

export const apiService = new ApiService();
export default apiService;
