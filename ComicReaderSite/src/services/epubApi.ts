// src/services/epubApi.ts
// Epub-only service

const RAW_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_EPUB_API_BASE) ||
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
  'http://localhost:8080/api';

const EPUB_API_BASE = RAW_BASE.replace(/\/+$/, '');

function buildUrl(endpoint: string) {
  const ep = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${EPUB_API_BASE}${ep}`;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function coreFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const url = buildUrl(endpoint);
  const mergedHeaders: Record<string, string> = { ...getAuthHeaders() };

  // merge headers người gọi truyền vào
  if (init.headers instanceof Headers) {
    init.headers.forEach((v, k) => (mergedHeaders[k] = v));
  } else if (Array.isArray(init.headers)) {
    init.headers.forEach(([k, v]) => (mergedHeaders[k] = v));
  } else if (init.headers) {
    Object.assign(mergedHeaders, init.headers as Record<string, string>);
  }

  // set Content-Type JSON khi body là object & không phải FormData/File
  const hasBody = init.body !== undefined && init.body !== null;
  const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (hasBody && !isForm && !('Content-Type' in mergedHeaders)) {
    mergedHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...init, headers: mergedHeaders });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const j = await res.json();
        msg = (j as any)?.message || (j as any)?.error || msg;
      } else {
        msg = await res.text();
      }
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null as T;
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

class EpubApi {
  // GET /epub
  getEpubList() {
    return coreFetch('/epub');
  }
  // GET /epub/user/:userId
  getUserEpubs(userId: string | number) {
    return coreFetch(`/epub/user/${userId}`);
  }
  // GET /epub/:id
  getEpubById(id: string | number) {
    return coreFetch(`/epub/${id}`);
  }
  // DELETE /epub/:id
  deleteEpub(id: string | number) {
    return coreFetch(`/epub/${id}`, { method: 'DELETE' });
  }
  // POST /epub (upload)
  uploadEpub(file: File, title?: string, userId?: string) {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    if (userId) form.append('userId', userId);
    // KHÔNG set Content-Type (browser tự thêm boundary)
    return coreFetch('/epub', { method: 'POST', body: form });
  }
  // GET binary arrayBuffer: /epub/file?id=...
  async getEpubFileArrayBuffer(id: string | number): Promise<ArrayBuffer> {
    const url = buildUrl(`/epub/file?id=${encodeURIComponent(String(id))}`);
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = (j as any)?.message || (j as any)?.error || msg;
      } catch {}
      throw new Error(msg);
    }
    return res.arrayBuffer();
  }
  // absolute URL để dùng với <a> hoặc epub.js trực tiếp
  getEpubFileUrl(id: string | number) {
    return buildUrl(`/epub/file?id=${encodeURIComponent(String(id))}`);
  }
}

export const epubApi = new EpubApi();
export default epubApi;
