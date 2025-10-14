'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, CreateUserRequest, UpdateUserRequest } from '@/types/auth';
import { hasPermission, isAdmin } from '@/types/auth';
import { apiService } from '@/services/api';
import { useRouter } from 'next/navigation';
import { BackButton } from '@/components/BackButton';

interface UserFilter {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy: 'username' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder: 'asc' | 'desc';
}

export default function UserManagement() {
  const { state } = useAuth();
  const router = useRouter();
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<UserFilter>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchUsers();
    }
  }, [state.isAuthenticated, filter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data: any = await apiService.getUserList(filter.page, filter.limit);
      setUserList(data.items || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Fallback to mock data
      setUserList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (!isLoading) {
      fetchUsers();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 text-gray-100">
        <div className="max-w-md rounded-2xl border border-purple-600/30 bg-gray-900/80 p-8 text-center shadow-2xl">
          <h2 className="text-xl font-semibold text-purple-200 mb-3">Access Denied</h2>
          <p className="text-sm text-gray-300">Sign in with an appropriate role to manage user accounts.</p>
        </div>
      </div>
    );
  }

  const { user } = state;

  // Check if user has admin permissions
  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 text-gray-100">
        <div className="max-w-md rounded-2xl border border-red-600/30 bg-gray-900/80 p-8 text-center shadow-2xl">
          <h2 className="text-xl font-semibold text-red-300 mb-3">Insufficient Permissions</h2>
          <p className="text-sm text-gray-300">Only administrators can manage user accounts. Switch to an admin profile to continue.</p>
        </div>
      </div>
    );
  }

  const canCreate = hasPermission(user, 'user', 'create');
  const canUpdate = hasPermission(user, 'user', 'update');
  const canDelete = hasPermission(user, 'user', 'delete');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <BackButton />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">User Administration</h1>
              <p className="text-sm text-gray-400 mt-1">Onboard, update, or suspend members across the platform.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-purple-400/60 hover:bg-purple-600/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Refreshing…' : 'Refresh Data'}
              </button>
              {canCreate && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center rounded-lg border border-purple-500/40 bg-purple-600/20 px-4 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/30"
                >
                  + Add New User
                </button>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-5 shadow-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <input
                type="text"
                placeholder="Search by username or email..."
                className="rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={filter.search || ''}
                onChange={(e) => setFilter({ ...filter, search: e.target.value, page: 1 })}
              />

              <select
                className="rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={filter.role || ''}
                onChange={(e) => setFilter({ ...filter, role: e.target.value, page: 1 })}
                title="Filter by role"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>

              <select
                className="rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={filter.status || ''}
                onChange={(e) => setFilter({ ...filter, status: e.target.value, page: 1 })}
                title="Filter by status"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              <select
                className="rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={`${filter.sortBy}-${filter.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilter({ ...filter, sortBy: sortBy as any, sortOrder: sortOrder as any, page: 1 });
                }}
                title="Sort by"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="username-asc">Username A-Z</option>
                <option value="email-asc">Email A-Z</option>
                <option value="lastLogin-desc">Last Login</option>
              </select>
            </div>
          </div>

          {/* User List */}
          <div className="rounded-2xl border border-white/5 bg-gray-900/70 shadow-lg">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-sm text-gray-400">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-400"></div>
                Loading users…
              </div>
            ) : userList.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-sm text-gray-400">
                <p>No users match the current filters.</p>
                {canCreate && (
                  <button
                    onClick={handleCreate}
                    className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-4 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/30"
                  >
                    Create First User
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {userList.map((userItem) => (
                  <li key={userItem.id} className="px-6 py-5 transition hover:bg-white/5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10 text-lg font-semibold text-purple-100">
                          {userItem.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{userItem.username}</h3>
                          <p className="text-sm text-gray-400">{userItem.email}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold ${
                              userItem.role.name === 'admin'
                                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                                : userItem.role.name === 'moderator'
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                                : 'border-blue-500/40 bg-blue-500/10 text-blue-200'
                            }`}>
                              {userItem.role.name.toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold ${
                              userItem.status === 'active'
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                : userItem.status === 'suspended'
                                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                                : 'border-white/10 bg-white/5 text-gray-200'
                            }`}>
                              {userItem.status.toUpperCase()}
                            </span>
                            <span className="text-gray-400">
                              Last login: {userItem.lastLogin ? new Date(userItem.lastLogin).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(userItem)}
                            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-100 transition hover:border-amber-400/60 hover:bg-amber-500/20"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && userItem.id !== user?.id && (
                          <button
                            onClick={() => handleDelete(userItem.id)}
                            className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:border-red-400/60 hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-400">Page {filter.page} of users</div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter({ ...filter, page: (filter.page || 1) - 1 })}
                disabled={filter.page === 1}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:border-purple-400/50 hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilter({ ...filter, page: (filter.page || 1) + 1 })}
                className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-4 py-2 text-sm text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/30"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

// Modal component for creating/editing users
function UserModal({ 
  user, 
  onClose, 
  onSave 
}: { 
  user: User | null; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role.name || 'user',
    status: user?.status || 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (user) {
        // Update existing user
        await apiService.updateUser(user.id, {
          username: formData.username,
          email: formData.email,
          roleId: formData.role,
          status: formData.status as any,
        });
      } else {
        // Create new user
        await apiService.createUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          roleId: formData.role,
        });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900/90 p-6 shadow-2xl backdrop-blur">
        <h3 className="text-lg font-semibold text-white mb-4">
          {user ? 'Edit User' : 'Create New User'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Username</label>
            <input
              type="text"
              required
              className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Email</label>
            <input
              type="email"
              required
              className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>

          {!user && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Password</label>
              <input
                type="password"
                required={!user}
                className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Set an initial password"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Role</label>
            <select
              className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'moderator' | 'admin' })}
              title="Select user role"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {user && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Status</label>
              <select
                className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                title="Select user status"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:border-purple-400/50 hover:bg-purple-500/10"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/30 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving…' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}