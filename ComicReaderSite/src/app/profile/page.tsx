'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
    lastLogin?: string;
    roleId?: string;
    isOwnProfile?: boolean;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
    const router = useRouter();

    const fetchProfile = useCallback(async () => {
        try {
            const response = await fetch('/api/profile', {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setProfile(data.user);
                setEditedProfile({
                    username: data.user.username,
                    email: data.user.email,
                    status: data.user.status || 'active',
                });
            } else {
                setError(data.message || 'Failed to load profile');
                if (response.status === 401) {
                    router.push('/login');
                }
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleUpdateProfile = async () => {
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedProfile),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsEditing(false);
                await fetchProfile();
                alert('Profile updated successfully');
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setError('Failed to update profile');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (profile) {
            setEditedProfile({
                username: profile.username,
                email: profile.email,
                status: profile.status,
            });
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="mt-4 text-xl font-bold text-gray-900">Error</h2>
                        <p className="mt-2 text-gray-600">{error}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">{profile?.username}</h1>
                                <p className="text-blue-100 mt-1">User ID: {profile?.id}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    profile?.status === 'active' 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-500 text-white'
                                }`}>
                                    {profile?.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Profile Information */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Username */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Username
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedProfile.username || ''}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{profile?.username}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editedProfile.email || ''}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{profile?.email}</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        {isEditing ? (
                                            <select
                                                value={editedProfile.status || 'active'}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, status: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        ) : (
                                            <p className="text-gray-900 capitalize">{profile?.status}</p>
                                        )}
                                    </div>

                                    {/* Role ID */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role ID
                                        </label>
                                        <p className="text-gray-900">{profile?.roleId || 'N/A'}</p>
                                    </div>

                                    {/* Created At */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Created
                                        </label>
                                        <p className="text-gray-900">{formatDate(profile?.createdAt)}</p>
                                    </div>

                                    {/* Last Login */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Login
                                        </label>
                                        <p className="text-gray-900">{formatDate(profile?.lastLogin)}</p>
                                    </div>

                                    {/* Updated At */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Updated
                                        </label>
                                        <p className="text-gray-900">{formatDate(profile?.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
