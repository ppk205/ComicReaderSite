import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '@/services/api';

/**
 * Tests for the API client: URL construction, auth header injection,
 * login payload normalisation, and error handling. fetch is mocked.
 */

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('apiService', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    localStorage.clear();
    // Pre-resolve the base URL so tests don't trigger the /health probe
    // (apiService is a module singleton that caches resolvedBaseUrl).
    (apiService as unknown as { resolvedBaseUrl: string | null }).resolvedBaseUrl =
      'http://test.local/api';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('login sends email+password payload to /auth/login', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ token: 't', user: { id: 'u1' } }));

    await apiService.login({ username: 'alice', password: 'secret' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/auth/login');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ email: 'alice', password: 'secret' });
  });

  it('login accepts (identifier, password) positional form', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ token: 't', user: { id: 'u1' } }));

    await apiService.login('bob@test.local', 'pw123');

    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ email: 'bob@test.local', password: 'pw123' });
  });

  it('attaches Authorization header when token is in localStorage', async () => {
    localStorage.setItem('authToken', 'my-token');
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'u1' }));

    await apiService.getCurrentUser();

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer my-token');
  });

  it('omits Authorization header when no token is stored', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    await apiService.getMangaList();

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers['Authorization']).toBeUndefined();
  });

  it('sets Content-Type json for object bodies', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiService.register('carol', 'carol@test.local', 'pw');

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({
      username: 'carol',
      email: 'carol@test.local',
      password: 'pw',
    });
  });

  it('throws with backend message on non-OK response', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Invalid credentials' }, 401));

    await expect(apiService.login('x', 'y')).rejects.toThrow('Invalid credentials');
  });

  it('throws generic HTTP error when error body has no message', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

    await expect(apiService.getDashboardStats()).rejects.toThrow('HTTP error! status: 500');
  });

  it('returns null for 204 responses', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await apiService.logout();
    expect(result).toBeNull();
  });

  it('getEpubFileUrl builds an absolute URL with encoded id', () => {
    const url = apiService.getEpubFileUrl('book 1&2');
    expect(url).toContain('/epub/file?id=book%201%262');
    expect(url.startsWith('http')).toBe(true);
  });

  it('healthCheck returns true on OK response', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 'UP' }));

    await expect(apiService.healthCheck()).resolves.toBe(true);
  });
});
