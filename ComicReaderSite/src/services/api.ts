// API Service for communicating with Tomcat backend
const DEFAULT_API_BASE_CANDIDATES = [
    process.env.NEXT_PUBLIC_API_BASE,
    'http://localhost:8080/api'
]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.replace(/\/$/, ''));

const uniqueCandidates = Array.from(new Set(DEFAULT_API_BASE_CANDIDATES));

let candidateBaseUrls = uniqueCandidates.length > 0
    ? [...uniqueCandidates]
    : ['http://localhost:8080/api'];

if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const origins = [ `${protocol}//${hostname}:8080/api` ];

    candidateBaseUrls.push(...origins);
}

const CANDIDATE_BASE_URLS = Array.from(new Set(candidateBaseUrls));

class ApiService {
    private candidateBaseUrls: string[];
    private resolvedBaseUrl: string | null = null;
    private resolvingPromise: Promise<string> | null = null;

    constructor(baseUrls: string[] = CANDIDATE_BASE_URLS) {
        this.candidateBaseUrls = baseUrls;
    }

    // Helper method to get auth headers
    private getAuthHeaders(): Record<string, string> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
        return {};
    }

    // Generic fetch method
    private async resolveBaseUrl(): Promise<string> {
        if (this.resolvedBaseUrl) {
            return this.resolvedBaseUrl;
        }

        if (this.resolvingPromise) {
            return this.resolvingPromise;
        }

        this.resolvingPromise = (async () => {
            console.debug('[ApiService] Resolving backend base URL from candidates:', this.candidateBaseUrls);
            for (const baseUrlCandidate of this.candidateBaseUrls) {
                try {
                    const response = await fetch(`${baseUrlCandidate}/health`, { method: 'GET', mode: 'cors' });
                    if (response.ok) {
                        this.resolvedBaseUrl = baseUrlCandidate;
                        console.info(`[ApiService] Using backend base URL: ${baseUrlCandidate}`);
                        return baseUrlCandidate;
                    }
                } catch (error) {
                    console.warn(`API base URL candidate failed (${baseUrlCandidate}/health):`, error);
                }
            }

            const fallback = this.candidateBaseUrls[0];
            this.resolvedBaseUrl = fallback;
            console.warn(`[ApiService] Falling back to first candidate base URL: ${fallback}`);
            return fallback;
        })().finally(() => {
            this.resolvingPromise = null;
        });

        return this.resolvingPromise as Promise<string>;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const normalisedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const baseUrl = await this.resolveBaseUrl();
        const url = `${baseUrl}${normalisedEndpoint}`;

        const authHeaders = this.getAuthHeaders();
        const mergedHeaders: Record<string, string> = { ...authHeaders };

        if (options.headers instanceof Headers) {
            options.headers.forEach((value, key) => {
                mergedHeaders[key] = value;
            });
        } else if (Array.isArray(options.headers)) {
            options.headers.forEach(([key, value]) => {
                mergedHeaders[key] = value;
            });
        } else if (options.headers) {
            Object.assign(mergedHeaders, options.headers as Record<string, string>);
        }

        const hasBody = options.body !== undefined && options.body !== null;
        if (hasBody && !mergedHeaders['Content-Type']) {
            mergedHeaders['Content-Type'] = 'application/json';
        }

        try {
            console.debug('[ApiService] request', { url, options });
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...mergedHeaders,
                },
                mode: 'cors',
            });

            if (!response.ok) {
                // try to parse error body for better message
                let errBody = null;
                try { errBody = await response.json(); } catch {}
                const msg = errBody && errBody.message ? errBody.message : `HTTP error! status: ${response.status}`;
                throw new Error(msg);
            }

            const contentLength = response.headers.get('content-length');
            if (response.status === 204 || contentLength === '0') {
                return null as T;
            }

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                return await response.json();
            }

            // Fallback for non-JSON responses
            const text = await response.text();
            return text as unknown as T;
        } catch (error) {
            console.error(`API request failed for ${url}:`, error);
            if (error instanceof TypeError) {
                const hint = 'The browser blocked this request. Double-check that the backend is running and that the URL includes the correct Tomcat context path (for example http://localhost:8080/ComicDashboard-1.0-SNAPSHOT/api).';
                throw new Error(`${error.message} - ${hint}`);
            }
            throw error;
        }
    }

    // Authentication endpoints
    async login(username: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST',
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Register endpoint (matches /api/auth/register on backend)
    async register(username: string, email: string, password: string, role: 'reader' | 'editor' = 'reader') {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, role }),
        });
    }

    // Dashboard endpoints
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    async getRecentActivity() {
        return this.request('/dashboard/activity');
    }

    // Manga endpoints
    async getMangaList() {
        return this.request('/manga');
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
        return this.request('/manga-chapters', {
            method: 'POST',
            body: JSON.stringify(chapterData),
        });
    }

    async updateMangaChapter(id: string, chapterData: any) {
        return this.request(`/manga-chapters/${id}`, {
            method: 'PUT',
            body: JSON.stringify(chapterData),
        });
    }

    async deleteMangaChapter(id: string) {
        return this.request(`/manga-chapters/${id}`, {
            method: 'DELETE',
        });
    }

    async createManga(mangaData: any) {
        return this.request('/manga', {
            method: 'POST',
            body: JSON.stringify(mangaData),
        });
    }

    async updateManga(id: string, mangaData: any) {
        return this.request(`/manga/${id}`, {
            method: 'PUT',
            body: JSON.stringify(mangaData),
        });
    }

    async deleteManga(id: string) {
        return this.request(`/manga/${id}`, {
            method: 'DELETE',
        });
    }

    // Moderation endpoints
    async getModerationReports() {
        return this.request('/moderation/reports');
    }

    async getModerationQueue() {
        return this.request('/moderation/approval');
    }

    // User management endpoints
    async getUserList(page: number = 1, limit: number = 10) {
        return this.request(`/users?page=${page}&limit=${limit}`);
    }

    async getUserById(id: string) {
        return this.request(`/users/${id}`);
    }

    async createUser(userData: any) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(id: string, userData: any) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(id: string) {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    // Profile endpoints
    async getProfile(userId: string) {
        return this.request(`/users/${userId}`);  // Dùng /users thay vì /profile
    }

    async updateProfile(userId: string, profileData: any) {
        return this.request(`/users/${userId}`, {  // Dùng /users thay vì /profile
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // Reading History endpoints
    async getReadingHistory(userId: string) {
        return this.request(`/reading-history?userId=${userId}`);
    }

    async saveReadingProgress(mangaId: string, chapterId: string, currentPage: number, completed?: boolean) {
        return this.request('/reading-history', {
            method: 'POST',
            body: JSON.stringify({
                mangaId,
                chapterId,
                currentPage,
                completed: completed || false,
            }),
        });
    }

    async deleteReadingHistory(historyId: string) {
        return this.request(`/reading-history/${historyId}`, {
            method: 'DELETE',
        });
    }

    // User Follow endpoints
    async followUser(userId: string) {
        return this.request(`/follow/${userId}`, {
            method: 'POST',
        });
    }

    async unfollowUser(userId: string) {
        return this.request(`/follow/${userId}`, {
            method: 'DELETE',
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
            await this.request('/health');
            return true;
        } catch {
            return false;
        }
    }
}

export const apiService = new ApiService();
export default apiService;