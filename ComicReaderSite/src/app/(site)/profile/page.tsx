'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    lastLogin?: string;
    roleId?: string;
    role?: {
        id: string;
        name: string;
        permissions: string[];
    };
    isOwnProfile?: boolean;
    seriesCount?: number;
    followersCount?: number;
    viewersCount?: number;
    isFollowing?: boolean;
    avatar?: string;
    bio?: string;
}

interface ReadingHistoryItem {
    id: string;
    mangaId: string;
    mangaTitle: string;
    mangaCover?: string;
    chapterId: string;
    currentPage: number;
    lastReadAt: string;
    completed: boolean;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
    const router = useRouter();

    const fetchProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                router.push('/login');
                return;
            }

            // Get current user from auth context
            const currentUser = await apiService.getCurrentUser();
            
            if (!currentUser) {
                router.push('/login');
                return;
            }

            setProfile({
                ...currentUser,
                isOwnProfile: true,
                seriesCount: 0,
                followersCount: 0,
                viewersCount: 0,
            });

            setEditedProfile({
                username: currentUser.username,
                email: currentUser.email,
                avatar: currentUser.avatar,
                bio: currentUser.bio,
            });

            // Fetch reading history
            try {
                const history = await apiService.getReadingHistory(currentUser.id);
                setReadingHistory(Array.isArray(history) ? history : []);
            } catch (historyError) {
                console.warn('Failed to load reading history:', historyError);
                setReadingHistory([]);
            }

        } catch (error: any) {
            console.error('Profile fetch error:', error);
            setError(error?.message || 'Failed to load profile');
            if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleUpdateProfile = async () => {
        if (!profile) return;

        try {
            await apiService.updateProfile(profile.id, editedProfile);
            setIsEditing(false);
            await fetchProfile();
            alert('Profile updated successfully');
        } catch (error: any) {
            console.error('Profile update error:', error);
            setError(error?.message || 'Failed to update profile');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (profile) {
            setEditedProfile({
                username: profile.username,
                email: profile.email,
                avatar: profile.avatar,
                bio: profile.bio,
            });
        }
    };

    const handleLogout = async () => {
        try {
            await apiService.logout();
            localStorage.removeItem('authToken');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('authToken');
            router.push('/login');
        }
    };

    const handleDeleteHistory = async (historyId: string) => {
        if (!confirm('Are you sure you want to delete this reading history?')) return;

        try {
            await apiService.deleteReadingHistory(historyId);
            setReadingHistory(readingHistory.filter(item => item.id !== historyId));
        } catch (error) {
            console.error('Delete history error:', error);
            alert('Failed to delete history');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    const getAvatarLetter = () => {
        return profile?.username?.charAt(0).toUpperCase() || 'U';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-300">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="mt-4 text-xl font-bold text-white">Error</h2>
                        <p className="mt-2 text-gray-400">{error}</p>
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Profile Card */}
                <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                    {/* Profile Header */}
                    <div className="relative h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                        <div className="absolute top-4 right-4 flex gap-3">
                            <button
                                onClick={() => router.push('/')}
                                className="p-2.5 bg-gray-900/50 hover:bg-gray-900/70 backdrop-blur-sm text-white rounded-lg transition-colors border border-white/20"
                                title="Home"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2.5 bg-red-600/80 hover:bg-red-600 backdrop-blur-sm text-white rounded-lg transition-colors"
                                title="Logout"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Avatar Section */}
                    <div className="relative px-6 pb-6">
                        <div className="flex flex-col items-center -mt-16">
                            <div className="relative">
                                {profile?.avatar ? (
                                    <img 
                                        src={profile.avatar} 
                                        alt={profile.username}
                                        className="w-32 h-32 rounded-full border-4 border-gray-800 shadow-xl object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl border-4 border-gray-800">
                                        {getAvatarLetter()}
                                    </div>
                                )}
                                {profile?.status && (
                                    <div className="absolute bottom-2 right-2">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                            profile.status === 'active' 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-gray-500 text-white'
                                        }`}>
                                            {profile.status}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="text-center mt-4">
                                <h1 className="text-3xl font-bold text-white">{profile?.username}</h1>
                                <p className="text-gray-300 mt-2">{profile?.email}</p>
                                
                                {/* Bio Section */}
                                <div className="mt-4 max-w-2xl mx-auto">
                                    {profile?.bio ? (
                                        <p className="text-gray-300 text-base leading-relaxed bg-gray-700/30 px-6 py-3 rounded-lg border border-gray-600/50">
                                            {profile.bio}
                                        </p>
                                    ) : (
                                        <p className="text-gray-500 italic text-sm">
                                            No bio yet. Click "Edit Profile" to add one.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-8 mt-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{profile?.seriesCount || 0}</div>
                                    <div className="text-sm text-gray-400">Series</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{profile?.followersCount || 0}</div>
                                    <div className="text-sm text-gray-400">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{readingHistory.length}</div>
                                    <div className="text-sm text-gray-400">Reading</div>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Profile Form */}
                {isEditing && (
                    <div className="mt-6 bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
                        {error && (
                            <div className="mb-4 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <h2 className="text-2xl font-semibold text-white mb-6">Edit Profile Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={editedProfile.username || ''}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editedProfile.email || ''}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Avatar URL</label>
                                <input
                                    type="text"
                                    value={editedProfile.avatar || ''}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, avatar: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                <textarea
                                    value={editedProfile.bio || ''}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                    rows={3}
                                    placeholder="Tell us about yourself..."
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handleUpdateProfile}
                                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Reading History Section */}
                <div className="mt-6 bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                    <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                        📚 Reading History
                    </h2>

                    {readingHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">No reading history yet</h3>
                            <p className="text-gray-400 mb-6">Start reading to see your history here</p>
                            <button
                                onClick={() => router.push('/')}
                                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Explore Manga
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {readingHistory.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                    {item.mangaCover && (
                                        <img 
                                            src={item.mangaCover} 
                                            alt={item.mangaTitle}
                                            className="w-16 h-24 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white">{item.mangaTitle}</h3>
                                        <p className="text-sm text-gray-300">Chapter {item.chapterId}</p>
                                        <p className="text-sm text-gray-400">Page {item.currentPage}</p>
                                        <p className="text-xs text-gray-500 mt-1">{formatDate(item.lastReadAt)}</p>
                                        {item.completed && (
                                            <span className="inline-block mt-1 px-2 py-1 bg-green-600 text-white text-xs rounded">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => router.push(`/series/${item.mangaId}/${item.chapterId}`)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                        >
                                            Continue
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHistory(item.id)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
