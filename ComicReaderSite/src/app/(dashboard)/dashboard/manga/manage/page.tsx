'use client';

import { useEffect, useMemo, useState } from 'react';
import { BackButton } from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/types/auth';
import { apiService } from '@/services/api';

interface DashboardManga {
  id: string;
  title: string;
  cover?: string;
}

interface ChapterRecord {
  id: string;
  mangaId: string;
  chapterNumber: number | null;
  chapterTitle: string;
  imageUrl?: string | null;
  chapterUrl?: string | null;
  releaseDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ChapterFormValues {
  chapterNumber: string;
  chapterTitle: string;
  imageUrl: string;
  chapterUrl: string;
  releaseDate: string;
}

const initialChapterForm: ChapterFormValues = {
  chapterNumber: '',
  chapterTitle: '',
  imageUrl: '',
  chapterUrl: '',
  releaseDate: '',
};

export default function MangaChapterManagementPage() {
  const { state } = useAuth();
  const [mangaList, setMangaList] = useState<DashboardManga[]>([]);
  const [isLoadingManga, setIsLoadingManga] = useState(true);
  const [mangaSearch, setMangaSearch] = useState('');
  const [selectedMangaId, setSelectedMangaId] = useState<string | null>(null);
  const [chapterList, setChapterList] = useState<ChapterRecord[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterRecord | null>(null);

  useEffect(() => {
    if (!state.isAuthenticated) {
      return;
    }

    const fetchManga = async () => {
      try {
        setIsLoadingManga(true);
        const response = await apiService.getMangaList();
        const rawList: any[] = Array.isArray(response)
          ? response
          : Array.isArray((response as any)?.items)
          ? (response as any).items
          : [];

        const normalised = rawList
          .map((item: any) => ({
            id: item?.id?.toString() ?? '',
            title: item?.title ?? 'Untitled',
            cover: item?.cover ?? item?.coverImage,
          }))
          .filter((manga: DashboardManga) => manga.id);

        setMangaList(normalised);

        if (normalised.length > 0) {
          const stillSelected = selectedMangaId && normalised.some((manga) => manga.id === selectedMangaId);
          if (!stillSelected) {
            setSelectedMangaId(normalised[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch manga list:', error);
        setMangaList([]);
      } finally {
        setIsLoadingManga(false);
      }
    };

    fetchManga();
  }, [state.isAuthenticated, selectedMangaId]);

  useEffect(() => {
    if (!selectedMangaId) {
      setChapterList([]);
      return;
    }

    const fetchChapters = async () => {
      try {
        setIsLoadingChapters(true);
        setChapterError(null);
        const response = await apiService.getMangaChapters(selectedMangaId);
        setChapterList(mapChapterList(response, selectedMangaId));
      } catch (error) {
        console.error('Failed to fetch chapters:', error);
        setChapterList([]);
        setChapterError('Could not load chapters for this manga.');
      } finally {
        setIsLoadingChapters(false);
      }
    };

    fetchChapters();
  }, [selectedMangaId]);

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 text-gray-100">
        <div className="max-w-md rounded-2xl border border-purple-600/30 bg-gray-900/80 p-8 text-center shadow-2xl">
          <h2 className="text-xl font-semibold text-purple-200 mb-3">Access Denied</h2>
          <p className="text-sm text-gray-300">You need to sign in to manage manga chapters.</p>
        </div>
      </div>
    );
  }

  const { user } = state;
  const canManageChapters = hasPermission(user, 'manga', 'update') || hasPermission(user, 'manga', 'create');
  const canDeleteChapters = hasPermission(user, 'manga', 'delete');

  const selectedManga = useMemo(() => {
    if (!selectedMangaId) {
      return null;
    }
    return mangaList.find((manga) => manga.id === selectedMangaId) ?? null;
  }, [selectedMangaId, mangaList]);

  const filteredMangaList = useMemo(() => {
    const term = mangaSearch.trim().toLowerCase();
    if (!term) {
      return mangaList;
    }
    return mangaList.filter((manga) => manga.title.toLowerCase().includes(term));
  }, [mangaList, mangaSearch]);

  const openCreateModal = () => {
    if (!selectedMangaId) {
      return;
    }
    setEditingChapter(null);
    setShowChapterModal(true);
  };

  const openEditModal = (chapter: ChapterRecord) => {
    setEditingChapter(chapter);
    setShowChapterModal(true);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!selectedMangaId || !canDeleteChapters) {
      return;
    }
    if (!confirm('Delete this chapter? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteMangaChapter(chapterId);
      const refreshed = chapterList.filter((chapter) => chapter.id !== chapterId);
      setChapterList(refreshed);
      setChapterError(null);
    } catch (error) {
      console.error('Failed to delete chapter:', error);
      alert('Failed to delete chapter. Please try again.');
    }
  };

  const handleSaveChapter = async (values: ChapterFormValues) => {
    if (!selectedMangaId) {
      throw new Error('Please select a manga first.');
    }

    const chapterNumber = Number.parseInt(values.chapterNumber, 10);
    if (Number.isNaN(chapterNumber)) {
      throw new Error('Chapter number must be a valid number.');
    }

    const payload = {
      mangaId: selectedMangaId,
      chapterNumber,
      chapterTitle: values.chapterTitle.trim(),
      imageUrl: values.imageUrl.trim() || undefined,
      chapterUrl: values.chapterUrl.trim() || undefined,
      releaseDate: values.releaseDate || undefined,
    };

    if (!payload.chapterTitle) {
      throw new Error('Chapter title is required.');
    }

    if (editingChapter) {
      await apiService.updateMangaChapter(editingChapter.id, payload);
    } else {
      await apiService.createMangaChapter(payload);
    }

    setChapterError(null);
    const response = await apiService.getMangaChapters(selectedMangaId);
    setChapterList(mapChapterList(response, selectedMangaId));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <BackButton />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">Browse &amp; Manage Manga</h1>
              <p className="text-sm text-gray-400 mt-1">
                Select a series to review its chapters or add new releases directly to the catalogue.
              </p>
            </div>
            {selectedManga && canManageChapters && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center rounded-lg border border-purple-500/40 bg-purple-600/20 px-4 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/30"
              >
                + Add Chapter
              </button>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-4 shadow-lg">
                <h2 className="text-sm font-semibold text-purple-200 mb-3">Series</h2>
                <input
                  type="text"
                  placeholder="Search manga"
                  className="w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                  value={mangaSearch}
                  onChange={(event) => setMangaSearch(event.target.value)}
                />
              </div>

              <div className="rounded-2xl border border-white/5 bg-gray-900/70 shadow-lg overflow-hidden">
                {isLoadingManga ? (
                  <div className="flex items-center justify-center py-10 text-sm text-gray-400">Loading manga…</div>
                ) : filteredMangaList.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                    No manga match your search.
                  </div>
                ) : (
                  <ul className="max-h-[480px] overflow-y-auto divide-y divide-white/5">
                    {filteredMangaList.map((manga) => {
                      const isActive = manga.id === selectedMangaId;
                      return (
                        <li key={manga.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedMangaId(manga.id)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                              isActive ? 'bg-purple-600/20 text-purple-100' : 'hover:bg-white/5'
                            }`}
                          >
                            {manga.cover ? (
                              <img
                                src={manga.cover}
                                alt={manga.title}
                                className="h-12 w-9 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-9 items-center justify-center rounded-md border border-dashed border-white/10 bg-white/5 text-[10px] text-gray-500">
                                No cover
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{manga.title}</p>
                              <p className="text-xs text-gray-400">Tap to view chapters</p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </aside>

            <section className="rounded-2xl border border-white/5 bg-gray-900/70 p-6 shadow-lg min-h-[520px]">
              {!selectedManga ? (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                  Select a series from the list to see its chapters.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{selectedManga.title}</h2>
                      <p className="text-xs text-gray-400">
                        Chapter entries pulled directly from the <code className="text-gray-200">manga_chapter</code> table.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        {chapterList.length === 1 ? '1 chapter' : `${chapterList.length} chapters`}
                      </span>
                      {canManageChapters && (
                        <button
                          onClick={openCreateModal}
                          className="rounded-lg border border-purple-500/40 bg-purple-600/10 px-3 py-1.5 text-xs font-medium text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/20"
                        >
                          + Add Chapter
                        </button>
                      )}
                    </div>
                  </div>

                  {chapterError && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {chapterError}
                    </div>
                  )}

                  {isLoadingChapters ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-gray-400">
                      <div className="h-12 w-12 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-400"></div>
                      Loading chapters…
                    </div>
                  ) : chapterList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-gray-400">
                      <p>No chapters recorded yet.</p>
                      {canManageChapters && (
                        <button
                          onClick={openCreateModal}
                          className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-4 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/30"
                        >
                          Add first chapter
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm text-gray-200">
                        <thead>
                          <tr className="text-xs uppercase tracking-wide text-gray-400">
                            <th className="px-4 py-3">Number</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Image URL</th>
                            <th className="px-4 py-3">Release Date</th>
                            <th className="px-4 py-3">Updated</th>
                            {(canManageChapters || canDeleteChapters) && <th className="px-4 py-3 text-right">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {chapterList.map((chapter) => (
                            <tr key={chapter.id} className="hover:bg-white/5">
                              <td className="px-4 py-3 text-gray-100 font-medium">{chapter.chapterNumber ?? '—'}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="font-medium text-white">{chapter.chapterTitle}</span>
                                  {chapter.chapterUrl && (
                                    <a
                                      href={chapter.chapterUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-purple-300 hover:text-purple-200"
                                    >
                                      {chapter.chapterUrl}
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-300">
                                {chapter.imageUrl ? (
                                  <a
                                    href={chapter.imageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-purple-300 hover:text-purple-200 break-words"
                                  >
                                    {chapter.imageUrl}
                                  </a>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-300">{formatDateForDisplay(chapter.releaseDate)}</td>
                              <td className="px-4 py-3 text-gray-300">{formatDateForDisplay(chapter.updatedAt) ?? formatDateForDisplay(chapter.createdAt)}</td>
                              {(canManageChapters || canDeleteChapters) && (
                                <td className="px-4 py-3">
                                  <div className="flex justify-end gap-2">
                                    {canManageChapters && (
                                      <button
                                        onClick={() => openEditModal(chapter)}
                                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-100 transition hover:border-amber-400/60 hover:bg-amber-500/20"
                                      >
                                        Edit
                                      </button>
                                    )}
                                    {canDeleteChapters && (
                                      <button
                                        onClick={() => handleDeleteChapter(chapter.id)}
                                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:border-red-400/60 hover:bg-red-500/20"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {showChapterModal && selectedManga && (
        <ChapterModal
          chapter={editingChapter}
          onClose={() => {
            setShowChapterModal(false);
            setEditingChapter(null);
          }}
          onSave={handleSaveChapter}
        />
      )}
    </div>
  );
}

function ChapterModal({
  chapter,
  onClose,
  onSave,
}: {
  chapter: ChapterRecord | null;
  onClose: () => void;
  onSave: (values: ChapterFormValues) => Promise<void>;
}) {
  const [formData, setFormData] = useState<ChapterFormValues>(initialChapterForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (chapter) {
      setFormData({
        chapterNumber: (chapter.chapterNumber ?? '').toString(),
        chapterTitle: chapter.chapterTitle ?? '',
        imageUrl: chapter.imageUrl ?? '',
        chapterUrl: chapter.chapterUrl ?? '',
        releaseDate: normaliseDateForInput(chapter.releaseDate),
      });
    } else {
      setFormData(initialChapterForm);
    }
  }, [chapter]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save chapter:', error);
      const message = error instanceof Error ? error.message : 'Failed to save chapter. Please try again.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900/90 p-6 shadow-2xl backdrop-blur">
        <h3 className="text-lg font-semibold text-white mb-4">{chapter ? 'Edit Chapter' : 'Add Chapter'}</h3>
        <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Chapter Number</label>
              <input
                type="number"
                step="1"
                min="0"
                title="Chapter number"
                className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={formData.chapterNumber}
                onChange={(event) => setFormData({ ...formData, chapterNumber: event.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/cover.jpg"
                className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                value={formData.imageUrl}
                onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Chapter Title</label>
            <input
              type="text"
              placeholder="Chapter title"
              className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={formData.chapterTitle}
              onChange={(event) => setFormData({ ...formData, chapterTitle: event.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Chapter URL</label>
            <input
              type="url"
              placeholder="https://example.com/chapter"
              className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={formData.chapterUrl}
              onChange={(event) => setFormData({ ...formData, chapterUrl: event.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Release Date</label>
            <input
              type="date"
              title="Release date"
              className="mt-2 block w-full rounded-lg border border-white/10 bg-gray-900/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={formData.releaseDate}
              onChange={(event) => setFormData({ ...formData, releaseDate: event.target.value })}
            />
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
              className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving…' : chapter ? 'Save Changes' : 'Create Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function normaliseDateForInput(dateValue?: string | null): string {
  if (!dateValue) {
    return '';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  try {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const day = String(parsed.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
}

function formatDateForDisplay(value?: string | null): string {
  if (!value) {
    return '—';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function mapChapterList(response: unknown, defaultMangaId: string): ChapterRecord[] {
  const rawList: any[] = Array.isArray(response)
    ? response
    : Array.isArray((response as any)?.items)
    ? (response as any).items
    : [];

  return rawList
    .map((item: any) => ({
      id: item?.id?.toString() ?? '',
      mangaId: item?.mangaId?.toString() ?? defaultMangaId,
      chapterNumber: typeof item?.chapterNumber === 'number' ? item.chapterNumber : Number.parseInt(item?.chapterNumber, 10) || null,
    chapterTitle: item?.chapterTitle ?? 'Untitled chapter',
    imageUrl: item?.imageUrl ?? item?.image_url ?? null,
      chapterUrl: item?.chapterUrl ?? item?.url ?? null,
      releaseDate: item?.releaseDate ?? null,
      createdAt: item?.createdAt ?? null,
      updatedAt: item?.updatedAt ?? null,
    }))
    .filter((chapter: ChapterRecord) => chapter.id);
}
