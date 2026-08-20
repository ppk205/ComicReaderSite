import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  isAdmin,
  isModerator,
  canManageUsers,
  canManageManga,
  User,
  Permission,
} from '@/types/auth';

function makeUser(roleName: 'admin' | 'moderator' | 'user', permissions: Permission[] = []): User {
  return {
    id: 'u1',
    username: 'tester',
    email: 'tester@test.local',
    role: {
      id: `role-${roleName}`,
      name: roleName,
      permissions,
      description: `${roleName} role`,
    },
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function perm(resource: Permission['resource'], action: Permission['action']): Permission {
  return {
    id: `perm.${resource}.${action}`,
    name: `${resource} ${action}`,
    resource,
    action,
    description: `Can ${action} ${resource}`,
  };
}

describe('auth permission helpers', () => {
  it('hasPermission returns false for null user', () => {
    expect(hasPermission(null, 'manga', 'read')).toBe(false);
  });

  it('hasPermission matches resource and action', () => {
    const user = makeUser('user', [perm('manga', 'read')]);
    expect(hasPermission(user, 'manga', 'read')).toBe(true);
    expect(hasPermission(user, 'manga', 'delete')).toBe(false);
    expect(hasPermission(user, 'user', 'read')).toBe(false);
  });

  it('isAdmin detects admin role only', () => {
    expect(isAdmin(makeUser('admin'))).toBe(true);
    expect(isAdmin(makeUser('moderator'))).toBe(false);
    expect(isAdmin(makeUser('user'))).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });

  it('isModerator detects moderator role only', () => {
    expect(isModerator(makeUser('moderator'))).toBe(true);
    expect(isModerator(makeUser('admin'))).toBe(false);
    expect(isModerator(null)).toBe(false);
  });

  it('canManageUsers is true for admins even without explicit permission', () => {
    expect(canManageUsers(makeUser('admin', []))).toBe(true);
    expect(canManageUsers(makeUser('user', [perm('user', 'manage')]))).toBe(true);
    expect(canManageUsers(makeUser('user', [perm('manga', 'read')]))).toBe(false);
    expect(canManageUsers(null)).toBe(false);
  });

  it('canManageManga requires manage or create permission', () => {
    expect(canManageManga(makeUser('user', [perm('manga', 'create')]))).toBe(true);
    expect(canManageManga(makeUser('user', [perm('manga', 'manage')]))).toBe(true);
    expect(canManageManga(makeUser('user', [perm('manga', 'read')]))).toBe(false);
    expect(canManageManga(null)).toBe(false);
  });
});
