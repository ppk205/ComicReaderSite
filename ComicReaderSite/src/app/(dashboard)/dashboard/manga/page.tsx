'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/types/auth';
import { apiService } from '@/services/api';
import { BackButton } from '@/components/BackButton';

type DashboardManga = {
  id: string;
  title: string;
  cover?: string;
  chapters: string[];
};

export default function MangaManagement() {
  const { state } = useAuth();
  const [mangaList, setMangaList] = useState<DashboardManga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingManga, setEditingManga] = useState<DashboardManga | null>(null);
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    sortBy: 'title' as 'title' | 'recent',
    sortOrder: 'asc' as 'asc' | 'desc',
    search: '',
  });

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchManga();
    }
  }, [state.isAuthenticated]);

  const fetchManga = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getMangaList();
      const rawList: any[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.items)
        ? (data as any).items
        : [];

      const normalised: DashboardManga[] = rawList.map((item: any) => ({
        id: item?.id?.toString() ?? '',
        title: item?.title ?? 'Untitled',
        cover: item?.cover ?? item?.coverImage,
        chapters: Array.isArray(item?.chapters) ? item.chapters : [],
      }));

      setMangaList(normalised.filter((manga) => manga.id));
    } catch (error) {
      console.error('Failed to fetch manga:', error);
      setMangaList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredManga = useMemo(() => {
    const searchTerm = filter.search.trim().toLowerCase();
    const sortDirection = filter.sortOrder === 'asc' ? 1 : -1;

    return [...mangaList]
      .filter((manga) =>
        searchTerm ? manga.title.toLowerCase().includes(searchTerm) : true
      )
      .sort((a, b) => {
        if (filter.sortBy === 'title') {
          return a.title.localeCompare(b.title) * sortDirection;
        }

        const aId = Number.parseInt(a.id, 10) || 0;
        const bId = Number.parseInt(b.id, 10) || 0;
        return (aId - bId) * sortDirection;
      });
  }, [mangaList, filter.search, filter.sortBy, filter.sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredManga.length / filter.limit));

  const paginatedManga = useMemo(() => {
    const start = (filter.page - 1) * filter.limit;
    return filteredManga.slice(start, start + filter.limit);
  }, [filteredManga, filter.page, filter.limit]);

  useEffect(() => {
    if (!isLoading && filter.page > totalPages) {
      setFilter((prev) => ({ ...prev, page: totalPages }));
    }
  }, [filter.page, isLoading, totalPages]);

  const handleRefresh = () => {
    if (!isLoading) {
      fetchManga();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this manga?')) {
      try {
        await apiService.deleteManga(id);
        fetchManga();
      } catch (error) {
        console.error('Failed to delete manga:', error);
        alert('Failed to delete manga. Please try again.');
      }
    }
  };

  const handleEdit = (manga: DashboardManga) => {
    setEditingManga(manga);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingManga(null);
    setShowModal(true);
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 text-gray-100">
        <div className="max-w-md rounded-2xl border border-purple-600/30 bg-gray-900/80 p-8 text-center shadow-2xl">
          <h2 className="text-xl font-semibold text-purple-200 mb-3">Access Denied</h2>
          <p className="text-sm text-gray-300">You need to sign in to manage manga.</p>
        </div>
      </div>
    );
  }

  const { user } = state;
  const canCreate = hasPermission(user, 'manga', 'create');
  const canUpdate = hasPermission(user, 'manga', 'update');
  const canDelete = hasPermission(user, 'manga', 'delete');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <BackButton />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">Manga Management</h1>
              <p className="text-sm text-gray-400 mt-1">Create, update, and moderate titles across the platform.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-purple-400/60 hover:bg-purple-600/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Refreshing…' : 'Refresh Data'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-5 shadow-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <input
                type="text"
                placeholder="Search by title..."
                className="rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value, page: 1 })}
              />

              <select
                title="Sort field"
                className="rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={filter.sortBy}
                onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as 'title' | 'recent', page: 1 })}
              >
                <option value="title">Title</option>
                <option value="recent">Recently Added</option>
              </select>

              <select
                title="Sort order"
                className="rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={filter.sortOrder}
                onChange={(e) => setFilter({ ...filter, sortOrder: e.target.value as 'asc' | 'desc', page: 1 })}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>

              <select
                title="Items per page"
                className="rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={filter.limit}
                onChange={(e) => setFilter({ ...filter, limit: Number(e.target.value), page: 1 })}
              >
                {[5, 10, 15, 20].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/5 bg-gray-900/70 shadow-lg">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-sm text-gray-400">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-400"></div>
                Loading titles…
              </div>
            ) : paginatedManga.length > 0 ? (
              <ul className="divide-y divide-white/5">
                {paginatedManga.map((manga) => (
                  <li key={manga.id} className="px-6 py-5 transition hover:bg-white/5">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        {manga.cover ? (
                          <img
                            src={manga.cover}
                            alt={manga.title}
                            className="h-20 w-16 rounded-lg object-cover ring-2 ring-purple-500/20"
                            onError={(event) => {
                              event.currentTarget.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Crect width='120' height='160' fill='%2324252d'/%3E%3Ctext x='60' y='80' text-anchor='middle' fill='%238b5cf6' font-size='12'%3ENo Cover%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="flex h-20 w-16 items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/5 text-xs text-gray-500">
                            No cover
                          </div>
                        )}
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-white">{manga.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span className="inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 font-semibold text-gray-200">
                              {manga.chapters.length} chapters
                            </span>
                            {manga.chapters.length > 0 && (
                              <span className="inline-flex items-center rounded-full border border-purple-500/30 px-2.5 py-1 font-semibold text-purple-200">
                                Latest: {manga.chapters[0]}
                              </span>
                            )}
                          </div>
                          {manga.chapters.length > 1 && (
                            <div className="space-y-1 text-xs text-gray-500">
                              {manga.chapters.slice(0, 3).map((chapter, index) => (
                                <div key={index} className="truncate">
                                  • {chapter}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(manga)}
                            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-100 transition hover:border-amber-400/60 hover:bg-amber-500/20"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(manga.id)}
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
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-gray-400">
                <p>No manga found.</p>
                {canCreate && (
                  <button
                    onClick={handleCreate}
                    className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-4 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/30"
                  >
                    Add your first title
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4">
            <div className="text-sm text-gray-400">
              Page {Math.min(filter.page, totalPages)} of {totalPages}
            </div>
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
                disabled={filter.page >= totalPages}
                className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-4 py-2 text-sm text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <MangaModal
          manga={editingManga}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchManga();
          }}
        />
      )}
    </div>
  );
}

// Modal component for creating/editing manga
function MangaModal({
  manga,
  onClose,
  onSave,
}: {
  manga: DashboardManga | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: manga?.title ?? '',
    cover: manga?.cover ?? '',
    chaptersText: Array.isArray(manga?.chapters) ? (manga.chapters as string[]).join('\n') : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      title: manga?.title ?? '',
      cover: manga?.cover ?? '',
      chaptersText: Array.isArray(manga?.chapters) ? (manga.chapters as string[]).join('\n') : '',
    });
  }, [manga]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        title: formData.title.trim(),
        cover: formData.cover.trim() || undefined,
        chapters: formData.chaptersText
          .split('\n')
          .map((chapter) => chapter.trim())
          .filter(Boolean),
      };

      if (!payload.title) {
        alert('Title is required');
        return;
      }

      if (manga) {
        await apiService.updateManga(manga.id, payload);
      } else {
        await apiService.createManga(payload);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save manga:', error);
      alert('Failed to save manga. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900/90 p-6 shadow-2xl backdrop-blur">
        <h3 className="text-lg font-semibold text-white mb-4">
          {manga ? 'Edit Manga' : 'Create New Manga'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Title</label>
            <input
              type="text"
              title="Enter manga title"
              placeholder="e.g., One Piece, Naruto"
              required
              className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Cover URL</label>
            <input
              type="url"
              title="Enter cover image URL"
              placeholder="https://..."
              className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={formData.cover}
              onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Chapters</label>
            <textarea
              title="Enter chapter labels"
              placeholder="Enter one chapter per line"
              rows={5}
              className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={formData.chaptersText}
              onChange={(e) => setFormData({ ...formData, chaptersText: e.target.value })}
            />
            <p className="mt-2 text-xs text-gray-500">Example: Chapter 01 – Awakening</p>
          </div>

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
              {isSubmitting ? 'Saving…' : manga ? 'Update Manga' : 'Create Manga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}