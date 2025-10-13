// API Service for communicating with Tomcat backend
const DEFAULT_API_BASE_URL = 'http://localhost:8080/Comic/api';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || DEFAULT_API_BASE_URL;

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    // Helper method to get auth headers
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    }

    // Generic fetch method
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const normalisedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${this.baseUrl}${normalisedEndpoint}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getAuthHeaders(),
                    ...options.headers,
                },
            });

            if (!response.ok) {
                // try to parse error body for better message
                let errBody = null;
                try { errBody = await response.json(); } catch {}
                const msg = errBody && errBody.message ? errBody.message : `HTTP error! status: ${response.status}`;
                throw new Error(msg);
            }

            return await response.json();
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

        if (typeof identifierOrObj === 'object' && identifierOrObj !== null) {
            identifier = identifierOrObj.email ?? identifierOrObj.username;
            password = identifierOrObj.password;
        } else {
            identifier = identifierOrObj;
        }

        // always send as "email" so backend's LoginRequest.email is populated
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: identifier, password }),
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
    async register(username: string, email: string, password: string) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    }

    // ... other methods unchanged ...
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    async getRecentActivity() {
        return this.request('/dashboard/activity');
    }

    async getMangaList() {
        return this.request('/manga');
    }

    async getMangaById(id: string) {
        return this.request(`/manga/${id}`);
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

    async getModerationReports() {
        return this.request('/moderation/reports');
    }

    async getModerationQueue() {
        return this.request('/moderation/approval');
    }

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