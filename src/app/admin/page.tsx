"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalManga: number;
  totalUsers: number;
  totalAdmins: number;
  totalAuthors: number;
  totalRegularUsers: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  active: boolean;
}

interface Manga {
  id: string;
  title: string;
  cover: string;
  chapters: string[];
}

interface DashboardData {
  stats: Stats;
  recentUsers: User[];
  recentManga: Manga[];
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <nav className="flex space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </Link>
              <Link href="/admin/manga" className="text-blue-600 hover:text-blue-800">
                Manage Manga
              </Link>
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-800">
                Manage Users
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total Manga</h3>
              <p className="text-3xl font-bold text-blue-600">{dashboardData.stats.totalManga}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-3xl font-bold text-green-600">{dashboardData.stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Authors</h3>
              <p className="text-3xl font-bold text-purple-600">{dashboardData.stats.totalAuthors}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Admins</h3>
              <p className="text-3xl font-bold text-red-600">{dashboardData.stats.totalAdmins}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {dashboardData?.recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-600">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{user.role}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/users" className="block mt-4 text-blue-600 hover:text-blue-800">
              View all users →
            </Link>
          </div>

          {/* Recent Manga */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Manga</h3>
            <div className="space-y-3">
              {dashboardData?.recentManga.slice(0, 5).map((manga) => (
                <div key={manga.id} className="flex items-center p-3 bg-gray-50 rounded">
                  <img
                    src={manga.cover}
                    alt={manga.title}
                    className="w-12 h-16 object-cover rounded mr-3"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64' viewBox='0 0 48 64'%3E%3Crect width='48' height='64' fill='%23f3f4f6'/%3E%3Ctext x='24' y='32' text-anchor='middle' fill='%236b7280' font-size='8'%3EManga%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-600">{manga.title}</p>
                    <p className="text-sm text-gray-600">
                      {manga.chapters?.length || 0} chapters
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/manga" className="block mt-4 text-blue-600 hover:text-blue-800">
              Manage all manga →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
