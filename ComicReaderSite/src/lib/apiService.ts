const API_BASE = 'http://localhost:8080/Comic/api';

class ApiService {
  // 🟢 Hàm chính gửi request
  async request(path: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Nếu có token (JWT hoặc session), thêm vào
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include', // ⚡ GỬI COOKIE SESSION (JSESSIONID)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ API error ${res.status}: ${errText}`);
      throw new Error(`HTTP error ${res.status}: ${errText}`);
    }

    // Nếu có JSON response thì parse
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return text;
    }
  }

  // 🟣 Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      const user = await this.request('/auth/me', { method: 'GET' });
      console.log('👤 Current user:', user);
      return user;
    } catch (e) {
      console.warn('⚠️ Not logged in:', e);
      return null;
    }
  }

  // 🟢 Lấy danh sách manga
  async getMangaList() {
    return this.request('/manga', { method: 'GET' });
  }

  // 🟣 Đăng bài viết mới
  async createPost(data: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 🟢 Lấy danh sách bài viết
  async getPosts(params = '') {
    return this.request(`/posts${params}`, { method: 'GET' });
  }

  // 🟣 Lấy chi tiết bài viết
  async getPostById(id: number) {
    return this.request(`/posts/${id}`, { method: 'GET' });
  }

  // 🔵 Đăng ký
  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 🔵 Đăng nhập
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // 🔵 Đăng xuất
  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }
}

// ✅ Export dùng chung
const apiService = new ApiService();
export default apiService;
