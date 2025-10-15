"use client";

import { useEffect, useState } from "react";
import MangaCard from "@/components/MangaCard";
import { apiService } from "@/services/api";

type BookmarkItem = {
  mangaId: string;
  mangaTitle: string;
  mangaCover?: string;
  id?: string | number | null;
  currentChapter?: number | null;
  totalChapters?: number | null;
  readingProgress?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "all" | "unread" | "inprogress" | "completed"
  >("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await apiService.getBookmarks();
        if (cancelled) return;

        if (Array.isArray(result) && result.length > 0) {
          // normalize items (preserve bookmark metadata)
          const items = result.map((payload: any) => normalizeBookmark(payload));
          setBookmarks(items);
          setError(null);
        } else {
          const localItems = readBookmarksFromLocalStorage();
          if (localItems.length > 0) {
            setBookmarks(localItems);
            setError(null);
          }
        }
      } catch (err: any) {
        // fallback to localStorage on error
        // fallback to localStorage or built-in sample data
        const items = readBookmarksFromLocalStorage();

        // If server call fails and localStorage had no data, surface the error to the user.
        setBookmarks(items);
        setError(err?.message ?? "Failed to load bookmarks from server");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-950">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-purple-400 mb-6">Bookmarks</h1>
        {/* Dev helpers removed - page now loads real bookmarks from backend */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="text"
            placeholder="Search bookmarks by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
            aria-label="Filter bookmarks by status"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="inprogress">In progress</option>
            <option value="completed">Completed</option>
          </select>

          <button
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
          >
            Reset
          </button>
        </div>

        {(() => {
          const q = query.trim().toLowerCase();
          const filtered = bookmarks.filter((bm) => {
            const title = bm.mangaTitle ? bm.mangaTitle.toLowerCase() : "";
            if (q && !title.includes(q)) {
              return false;
            }

            if (filter === "unread") {
              return bm.currentChapter == null || bm.currentChapter === 0;
            }
            if (filter === "inprogress") {
              return (
                bm.currentChapter != null &&
                bm.totalChapters != null &&
                bm.totalChapters > 0 &&
                bm.currentChapter < bm.totalChapters
              );
            }
            if (filter === "completed") {
              return (
                bm.currentChapter != null &&
                bm.totalChapters != null &&
                bm.totalChapters > 0 &&
                bm.currentChapter >= bm.totalChapters
              );
            }
            return true;
          });

          if (filtered.length === 0) {
            return <p className="text-gray-400">No bookmarks found.</p>;
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((bm: BookmarkItem) => {
                const progressLabel = deriveProgressLabel(bm);
                return (
                  <div key={bm.mangaId} className="space-y-2">
                    <MangaCard
                      manga={{
                        id: bm.mangaId,
                        title: bm.mangaTitle,
                        cover: bm.mangaCover,
                        chapters: bm.totalChapters
                          ? Array.from({ length: bm.totalChapters }).map((_, i) => ({
                              id: String(i + 1),
                              title: `Chapter ${i + 1}`,
                            }))
                          : undefined,
                      }}
                    />
                    {progressLabel && (
                      <div className="rounded-lg border border-purple-500/20 bg-gray-900/60 px-3 py-2 text-xs text-purple-200">
                        {progressLabel}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </main>
    </div>
  );
}

function normalizeBookmark(source: any): BookmarkItem {
  return {
    mangaId: String(source?.mangaId ?? source?.id ?? source?.manga?.id ?? ""),
    mangaTitle: String(source?.mangaTitle ?? source?.title ?? source?.manga?.title ?? "Untitled"),
    mangaCover: source?.mangaCover ?? source?.cover ?? source?.manga?.cover ?? undefined,
    id: source?.id ?? null,
    currentChapter: source?.currentChapter ?? source?.current_chapter ?? null,
    totalChapters: source?.totalChapters ?? source?.total_chapters ?? null,
    readingProgress: source?.readingProgress ?? source?.reading_progress ?? null,
    createdAt: source?.createdAt ?? source?.created_at ?? null,
    updatedAt: source?.updatedAt ?? source?.updated_at ?? null,
  };
}

function readBookmarksFromLocalStorage(): BookmarkItem[] {
  try {
    const raw = localStorage.getItem("bookmarks");
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item: any) => normalizeBookmark(item))
      .filter((item) => Boolean(item.mangaId));
  } catch {
    return [];
  }
}

function deriveProgressLabel(bookmark: BookmarkItem): string | null {
  const { currentChapter, totalChapters, readingProgress } = bookmark;

  if (readingProgress != null) {
    return `Progress: ${Math.round(readingProgress * 100)}%`;
  }

  if (totalChapters && totalChapters > 0) {
    const current = currentChapter ?? 0;
    return `Chapter ${current} of ${totalChapters}`;
  }

  if (currentChapter != null) {
    return `Current chapter: ${currentChapter}`;
  }

  return null;
}