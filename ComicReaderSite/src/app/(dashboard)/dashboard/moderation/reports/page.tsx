'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, isAdmin, isModerator } from '@/types/auth';
import { apiService } from '@/services/api';
import Link from 'next/link';

interface ModerationReport {
  id: string;
  reporter: string;
  reason: string;
  targetTitle: string;
  status: 'open' | 'in_review' | 'resolved';
  createdAt: string;
}

export default function ModerationReportsPage() {
  const { state } = useAuth();
  const user = state.user;
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackend, setIsBackend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockReports: ModerationReport[] = [
    {
      id: 'rep-001',
      reporter: 'reader_92',
      reason: 'Incorrect chapter order',
      targetTitle: 'Mystic Chronicles — Chapter 14',
      status: 'open',
      createdAt: '2025-09-20T08:15:00.000Z',
    },
    {
      id: 'rep-002',
      reporter: 'otakuFan',
      reason: 'Offensive language in comments',
      targetTitle: 'City of Golems — Discussion Thread',
      status: 'in_review',
      createdAt: '2025-09-18T12:42:00.000Z',
    },
    {
      id: 'rep-003',
      reporter: 'alice.w',
      reason: 'Suspected duplicate upload',
      targetTitle: 'Dragon Academy — Chapter 03',
      status: 'resolved',
      createdAt: '2025-09-15T19:25:00.000Z',
    },
  ];

  const canModerate = useMemo(() => {
    if (!user) return false;
    return isAdmin(user) || isModerator(user) || hasPermission(user, 'manga', 'update');
  }, [user]);

  useEffect(() => {
    const loadReports = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const backendReports = await apiService.getModerationReports();
        setReports(backendReports as ModerationReport[]);
        setIsBackend(true);
      } catch (fetchError) {
  console.warn('Falling back to mock moderation reports', fetchError);
  setReports(mockReports);
  setIsBackend(false);
  setError('Unable to reach the backend. Showing illustrative reports instead.');
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-purple-600/30 bg-gray-900/80 p-8 text-center shadow-2xl text-gray-100">
          <h2 className="text-xl font-semibold text-purple-200 mb-3">Not Signed In</h2>
          <p className="text-sm text-gray-300">
            Return to the <Link className="text-purple-300 underline" href="/dashboard">dashboard</Link> and select a demo account to continue.
          </p>
        </div>
      </div>
    );
  }

  if (!canModerate) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-red-600/30 bg-gray-900/80 p-8 text-center shadow-2xl text-gray-100">
          <h2 className="text-xl font-semibold text-red-300 mb-3">No Access</h2>
          <p className="text-sm text-gray-300">The current account does not have permission to review reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Moderation Reports</h1>
            <p className="text-sm text-gray-400">
              Monitor and triage community reports. {isBackend ? 'Live data from the backend.' : 'Showing illustrative sample data.'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium ${
                isBackend
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isBackend ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              {isBackend ? 'Backend Connected' : 'Mock Data'}
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-400/50"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 border-purple-500/20"></div>
              <div className="absolute inset-0 h-12 w-12 rounded-full border-t-2 border-purple-400 animate-spin"></div>
            </div>
            <span className="ml-4 text-gray-400">Loading reports…</span>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-gray-900/70 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5 text-sm">
                <thead className="bg-white/5 text-left uppercase tracking-wide text-xs text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Report ID</th>
                    <th className="px-6 py-3">Reporter</th>
                    <th className="px-6 py-3">Details</th>
                    <th className="px-6 py-3">Target</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 font-medium text-purple-200">{report.id}</td>
                      <td className="px-6 py-4 text-gray-300">{report.reporter}</td>
                      <td className="px-6 py-4 text-gray-200">{report.reason}</td>
                      <td className="px-6 py-4 text-gray-300">{report.targetTitle}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            report.status === 'resolved'
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                              : report.status === 'in_review'
                              ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                              : 'border-red-500/40 bg-red-500/10 text-red-200'
                          }`}
                        >
                          {report.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(report.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
