'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, isAdmin, isModerator } from '@/types/auth';
import { apiService } from '@/services/api';
import Link from 'next/link';

interface ApprovalSubmission {
  id: string;
  title: string;
  uploader: string;
  chapters: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'changes_requested' | 'rejected';
}

export default function ModerationApprovalPage() {
  const { state } = useAuth();
  const user = state.user;
  const [queue, setQueue] = useState<ApprovalSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackend, setIsBackend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockQueue: ApprovalSubmission[] = [
    {
      id: 'sub-101',
      title: 'Blade of Dawn',
      uploader: 'studio-hikari',
      chapters: 2,
      submittedAt: '2025-09-21T09:32:00.000Z',
      status: 'pending',
    },
    {
      id: 'sub-102',
      title: 'Galactic Postman',
      uploader: 'indie-sensei',
      chapters: 1,
      submittedAt: '2025-09-19T14:18:00.000Z',
      status: 'changes_requested',
    },
    {
      id: 'sub-103',
      title: 'Wings of Clay',
      uploader: 'manga-vault',
      chapters: 3,
      submittedAt: '2025-09-17T20:41:00.000Z',
      status: 'pending',
    },
  ];

  const canApprove = useMemo(() => {
    if (!user) return false;
    return isAdmin(user) || isModerator(user) || hasPermission(user, 'manga', 'update');
  }, [user]);

  useEffect(() => {
    const loadQueue = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const backendQueue = await apiService.getModerationQueue();
        setQueue(backendQueue as ApprovalSubmission[]);
        setIsBackend(true);
      } catch (fetchError) {
  console.warn('Falling back to mock approval queue', fetchError);
  setQueue(mockQueue);
  setIsBackend(false);
  setError('Unable to reach the backend. Displaying demonstration queue instead.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQueue();
  }, [user]);

  const updateStatus = useCallback((id: string, status: ApprovalSubmission['status']) => {
    setQueue((prev) => prev.map((submission) => (submission.id === id ? { ...submission, status } : submission)));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-purple-600/30 bg-gray-900/80 p-8 text-center shadow-2xl text-gray-100">
          <h2 className="text-xl font-semibold text-purple-200 mb-3">Not Signed In</h2>
          <p className="text-sm text-gray-300">
            Go back to the <Link className="text-purple-300 underline" href="/dashboard">dashboard</Link> and select a demo account to continue.
          </p>
        </div>
      </div>
    );
  }

  if (!canApprove) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-red-600/30 bg-gray-900/80 p-8 text-center shadow-2xl text-gray-100">
          <h2 className="text-xl font-semibold text-red-300 mb-3">No Access</h2>
          <p className="text-sm text-gray-300">The current account does not have permission to approve content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Content Approval Queue</h1>
            <p className="text-sm text-gray-400">
              Review and approve freshly submitted chapters. {isBackend ? 'Live data from the backend.' : 'Showing illustrative sample data.'}
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
            <span className="ml-4 text-gray-400">Loading approval queue…</span>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((submission) => (
              <div
                key={submission.id}
                className="rounded-2xl border border-white/5 bg-gray-900/70 p-6 shadow-lg transition hover:border-purple-400/40"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-white">{submission.title}</div>
                    <div className="text-sm text-gray-400">
                      Submitted by <span className="text-gray-200">{submission.uploader}</span> • Chapters:{' '}
                      <span className="text-gray-200">{submission.chapters}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold ${
                        submission.status === 'approved'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          : submission.status === 'changes_requested'
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                          : submission.status === 'rejected'
                          ? 'border-red-500/40 bg-red-500/10 text-red-200'
                          : 'border-purple-500/40 bg-purple-500/10 text-purple-200'
                      }`}
                    >
                      {submission.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(submission.id, 'approved')}
                        className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-100 transition hover:border-emerald-400/50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(submission.id, 'changes_requested')}
                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-100 transition hover:border-amber-400/50"
                      >
                        Request changes
                      </button>
                      <button
                        onClick={() => updateStatus(submission.id, 'rejected')}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-100 transition hover:border-red-400/50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {queue.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center text-sm text-gray-400">
                Nothing is currently awaiting approval.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
