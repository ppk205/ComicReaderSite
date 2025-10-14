'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, isAdmin, isModerator } from '@/types/auth';
import { DashboardStats } from '@/types/dashboard';
import { apiService } from '@/services/api';
import { BackendSetupGuide } from '@/components/BackendSetupGuide';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActionTile } from '@/components/dashboard/ActionTile';

interface ActivityItem {
  id: string;
  type: 'success' | 'info' | 'warning';
  message: string;
  timestamp: string;
}

export default function Dashboard() {
  const { state, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalManga: 0,
    publishedManga: 0,
    totalChapters: 0,
    totalViews: 0,
    newUsersThisMonth: 0,
    newMangaThisMonth: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);


  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsData, activityData] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getRecentActivity(),
        ]);
        setStats(statsData as DashboardStats);
        setRecentActivity(activityData as ActivityItem[]);
        setBackendConnected(true);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalManga: 0,
          publishedManga: 0,
          totalChapters: 0,
          totalViews: 0,
          newUsersThisMonth: 0,
          newMangaThisMonth: 0,
        });
        setRecentActivity([]);
        setBackendConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [state.user]);

  type ActionTone = 'purple' | 'sky' | 'amber' | 'indigo' | 'fuchsia' | 'red' | 'orange' | 'teal';
  interface ActionDefinition {
    title: string;
    description: string;
    href: string;
    tone: ActionTone;
  }

  const user = state.user;

  const statCards = useMemo(
    () => [
      {
        label: 'Total Users',
        value: stats.totalUsers,
        accent: 'from-purple-500/60 to-indigo-500/60',
        monogram: 'U',
      },
      {
        label: 'Active Users',
        value: stats.activeUsers,
        accent: 'from-emerald-500/60 to-teal-500/60',
        monogram: 'A',
      },
      {
        label: 'Total Manga',
        value: stats.totalManga,
        accent: 'from-pink-500/60 to-rose-500/60',
        monogram: 'M',
      },
      {
        label: 'Published Manga',
        value: stats.publishedManga,
        accent: 'from-blue-500/60 to-cyan-500/60',
        monogram: 'P',
      },
      {
        label: 'Total Chapters',
        value: stats.totalChapters,
        accent: 'from-indigo-500/60 to-purple-500/60',
        monogram: 'C',
      },
      {
        label: 'Total Views',
        value: stats.totalViews.toLocaleString(),
        accent: 'from-amber-500/60 to-orange-500/60',
        monogram: 'V',
      },
      {
        label: 'New Users (30d)',
        value: stats.newUsersThisMonth,
        accent: 'from-emerald-500/60 to-lime-500/60',
        monogram: '+',
      },
      {
        label: 'New Manga (30d)',
        value: stats.newMangaThisMonth,
        accent: 'from-fuchsia-500/60 to-purple-500/60',
        monogram: 'N',
      },
    ],
    [stats]
  );

  const mangaActions = useMemo<ActionDefinition[]>(() => {
    if (!user) {
      return [];
    }

    const entries: ActionDefinition[] = [];

    if (hasPermission(user, 'manga', 'create')) {
      entries.push({
        title: 'Create New Manga',
        description: 'Upload cover art, metadata, and launch a new series.',
        href: '/dashboard/manga',
        tone: 'purple',
      });
    }

    if (hasPermission(user, 'manga', 'read')) {
      entries.push({
        title: 'Browse & Manage Manga',
        description: 'Edit chapters, update descriptions, and monitor performance.',
        href: '/dashboard/manga',
        tone: 'sky',
      });
    }

    if (hasPermission(user, 'manga', 'update')) {
      entries.push({
        title: 'Review Pending Chapters',
        description: 'Approve or request changes before publication.',
        href: '/dashboard/moderation/approval',
        tone: 'amber',
      });
    }

    return entries;
  }, [user]);

  const adminActions = useMemo<ActionDefinition[]>(() => {
    if (!isAdmin(user)) {
      return [];
    }

    return [
      {
        title: 'User Directory',
        description: 'Invite, deactivate, or audit user accounts.',
        href: '/dashboard/users',
        tone: 'indigo',
      },
      {
        title: 'System Settings',
        description: 'Configure platform behaviour, integrations, and alerts.',
        href: '/dashboard/settings',
        tone: 'red',
      },
    ];
  }, [user]);

  const moderatorActions = useMemo<ActionDefinition[]>(() => {
    if (!user || isAdmin(user) || !isModerator(user)) {
      return [];
    }

    return [
      {
        title: 'Review Reports',
        description: 'Triage user reports and respond with moderation actions.',
        href: '/dashboard/moderation/reports',
        tone: 'orange',
      },
      {
        title: 'Content Approval',
        description: 'Approve, edit, or reject pending chapters.',
        href: '/dashboard/moderation/approval',
        tone: 'teal',
      },
    ];
  }, [user]);

  // Redirect if no dashboard access permission
  if (user && !hasPermission(user, 'dashboard', 'read')) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900/80 border border-red-600/30 px-8 py-10 rounded-2xl text-center max-w-md shadow-2xl">
          <h2 className="text-2xl font-semibold text-red-300 mb-4">Access Denied</h2>
          <p className="text-gray-300">You do not have permission to view the dashboard.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900/80 border border-purple-600/30 px-8 py-10 rounded-2xl max-w-md w-full shadow-2xl text-center">
          <h2 className="text-2xl font-semibold text-purple-200 mb-4">Authentication Required</h2>
          <p className="text-gray-300">
            Please sign in to access the Comic Reader dashboard and live backend data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-purple-800/30 bg-gradient-to-r from-purple-900 via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
                <span className="inline-flex items-center rounded-full border border-purple-500/50 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-200">
                  {user.role.name.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-300">
                Welcome back, <span className="text-purple-200 font-medium">{user.username}</span>
              </p>
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium ${
                    backendConnected
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  {backendConnected ? 'Backend Connected' : 'Backend Unreachable'}
                </span>
                <span className="text-gray-400">
                  Last login:{' '}
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'No activity recorded'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200 transition hover:border-purple-400 hover:bg-purple-500/20"
              >
                Back to Home
              </button>
              <button
                onClick={async () => {
                  await logout();
                  router.push('/');
                }}
                className="inline-flex items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-400 hover:bg-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-2 border-purple-500/20"></div>
              <div className="absolute inset-0 h-14 w-14 rounded-full border-t-2 border-purple-400 animate-spin"></div>
            </div>
            <span className="ml-4 text-gray-400">Loading dashboard data…</span>
          </div>
        ) : (
          <>
            {isAdmin(user) && !backendConnected && <BackendSetupGuide />}

            <section>
              <h2 className="text-lg font-semibold text-purple-200 mb-4">Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map((card) => (
                  <StatCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    accent={card.accent}
                    monogram={card.monogram}
                  />
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-200">Manga Management</h3>
                  <span className="text-xs text-gray-500">Tools you can access</span>
                </div>
                <div className="space-y-3">
                  {mangaActions.map((action) => (
                    <ActionTile
                      key={action?.title}
                      title={action!.title}
                      description={action!.description}
                      href={action!.href}
                      tone={action!.tone}
                    />
                  ))}
                </div>
              </div>

              {isAdmin(user) && (
                <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-purple-200">Administration</h3>
                    <span className="text-xs text-gray-500">Full control</span>
                  </div>
                  <div className="space-y-3">
                    {adminActions.map((action) => (
                      <ActionTile
                        key={action.title}
                        title={action.title}
                        description={action.description}
                        href={action.href}
                        tone={action.tone}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!isAdmin(user) && isModerator(user) && (
                <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-purple-200">Moderation Suite</h3>
                    <span className="text-xs text-gray-500">Focused tools</span>
                  </div>
                  <div className="space-y-3">
                    {moderatorActions.map((action) => (
                      <ActionTile
                        key={action.title}
                        title={action.title}
                        description={action.description}
                        href={action.href}
                        tone={action.tone}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/5 bg-gray-900/70 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-200">Recent Activity</h3>
                <span className="text-xs text-gray-500">Live stream of changes</span>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-gray-300"
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        activity.type === 'success'
                          ? 'bg-emerald-400'
                          : activity.type === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-sky-400'
                      }`}
                    ></span>
                    <span className="flex-1 text-gray-200">{activity.message}</span>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}