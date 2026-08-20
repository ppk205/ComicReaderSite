import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { User } from '@/types/auth';

/**
 * Tests for the AuthContext provider: login/logout flows, localStorage
 * persistence, and the security fix that removed automatic login with
 * hardcoded default credentials (vuln #3).
 */

const testUser: User = {
  id: 'u1',
  username: 'alice',
  email: 'alice@test.local',
  role: {
    id: 'role-user',
    name: 'user',
    permissions: [
      {
        id: 'perm.manga.read',
        name: 'Read Manga',
        resource: 'manga',
        action: 'read',
        description: 'Can read manga',
      },
    ],
    description: 'Regular User',
  },
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function Probe() {
  const { state, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{String(state.isAuthenticated)}</span>
      <span data-testid="loading">{String(state.isLoading)}</span>
      <span data-testid="username">{state.user?.username ?? 'none'}</span>
      <span data-testid="perms">{state.permissions.length}</span>
      <button onClick={() => login({ username: 'alice', password: 'pw' }).catch(() => {})}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    (apiService as unknown as { resolvedBaseUrl: string | null }).resolvedBaseUrl =
      'http://test.local/api';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts unauthenticated with no stored session', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('username').textContent).toBe('none');
  });

  it('does NOT auto-login with default credentials (vuln #3 fix)', async () => {
    // Even with nothing in localStorage, the provider must stay logged out —
    // the old code auto-logged-in with hardcoded DEFAULT_USERNAME/PASSWORD.
    vi.spyOn(apiService, 'login');

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(apiService.login).not.toHaveBeenCalled();
  });

  it('login stores token + user and authenticates', async () => {
    vi.spyOn(apiService, 'login').mockResolvedValue({ token: 'tok-123', user: testUser });
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await user.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('true'));
    expect(screen.getByTestId('username').textContent).toBe('alice');
    expect(screen.getByTestId('perms').textContent).toBe('1');
    expect(localStorage.getItem('authToken')).toBe('tok-123');
    expect(JSON.parse(localStorage.getItem('user')!).id).toBe('u1');
  });

  it('failed login leaves state unauthenticated and rethrows', async () => {
    vi.spyOn(apiService, 'login').mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await act(async () => {
      await user.click(screen.getByText('login')).catch(() => {});
    });

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('logout clears token, user, and state', async () => {
    vi.spyOn(apiService, 'login').mockResolvedValue({ token: 'tok-123', user: testUser });
    vi.spyOn(apiService, 'logout').mockResolvedValue(null);
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await user.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('true'));

    await user.click(screen.getByText('logout'));
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('false'));

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('restores session from localStorage on mount', async () => {
    localStorage.setItem('authToken', 'stored-token');
    localStorage.setItem('user', JSON.stringify(testUser));
    vi.spyOn(apiService, 'getCurrentUser').mockResolvedValue(testUser);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('true'));
    expect(screen.getByTestId('username').textContent).toBe('alice');
  });

  it('useAuth throws outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});
