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
          const items = result.map((it: any) => ({
            mangaId: String(it.mangaId ?? it.id ?? it.manga?.id ?? ""),
            mangaTitle: String(it.title ?? it.manga?.title ?? "Untitled"),
            mangaCover: it.cover ?? it.manga?.cover,
            id: it.id ?? null,
            currentChapter: it.currentChapter ?? it.current_chapter ?? null,
            totalChapters: it.totalChapters ?? it.total_chapters ?? null,
            readingProgress: it.readingProgress ?? it.reading_progress ?? null,
            createdAt: it.createdAt ?? it.created_at ?? null,
            updatedAt: it.updatedAt ?? it.updated_at ?? null,
          }));
          setBookmarks(items);
          setError(null);
        } else {
          // No server bookmarks found for this user. Try localStorage as optional fallback.
          try {
            const raw = localStorage.getItem("bookmarks");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const items = parsed.map((it: any) => ({
                  mangaId: String(it.mangaId ?? it.id ?? ""),
                  mangaTitle: it.title ?? it.mangaTitle ?? "Untitled",
                  mangaCover: it.cover ?? it.mangaCover,
                  id: it.id ?? null,
                  currentChapter:
                    it.currentChapter ?? it.current_chapter ?? null,
                  totalChapters: it.totalChapters ?? it.total_chapters ?? null,
                  readingProgress:
                    it.readingProgress ?? it.reading_progress ?? null,
                  createdAt: it.createdAt ?? it.created_at ?? null,
                  updatedAt: it.updatedAt ?? it.updated_at ?? null,
                }));
                setBookmarks(items);
                setError(null);
              }
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (err: any) {
        // fallback to localStorage on error
        // fallback to localStorage or built-in sample data
        let items: BookmarkItem[] = [];
        try {
          const raw = localStorage.getItem("bookmarks");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              items = parsed.map((it: any) => ({
                mangaId: String(it.mangaId ?? it.id ?? ""),
                mangaTitle: it.mangaTitle ?? it.title ?? "Untitled",
                mangaCover: it.mangaCover ?? it.cover,
                id: it.id ?? null,
                currentChapter: it.currentChapter ?? it.current_chapter ?? null,
                totalChapters: it.totalChapters ?? it.total_chapters ?? null,
                readingProgress:
                  it.readingProgress ?? it.reading_progress ?? null,
                createdAt: it.createdAt ?? it.created_at ?? null,
                updatedAt: it.updatedAt ?? it.updated_at ?? null,
              }));
            }
          }
        } catch (e) {
          // ignore
        }

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
            // match title
            if (
              q &&
              !(bm.mangaTitle ?? bm.mangaTitle ?? "").toLowerCase().includes(q)
            )
              return false;

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
              {filtered.map((bm: any) => (
                <MangaCard
                  key={bm.mangaId}
                  manga={{
                    id: bm.mangaId,
                    title: bm.title ?? bm.mangaTitle,
                    cover: bm.cover ?? bm.mangaCover,
                    chapters: bm.totalChapters
                      ? Array.from({ length: bm.totalChapters }).map(
                          (_, i) => ({
                            id: String(i + 1),
                            title: `Chapter ${i + 1}`,
                          })
                        )
                      : undefined,
                  }}
                  bookmark={{
                    bookmarkId: bm.id ?? undefined,
                    bookmarked: true,
                    currentChapter: bm.currentChapter ?? null,
                    totalChapters: bm.totalChapters ?? null,
                    readingProgress: bm.readingProgress ?? null,
                    createdAt: bm.createdAt ?? bm.created_at ?? null,
                    updatedAt: bm.updatedAt ?? bm.updated_at ?? null,
                  }}
                />
              ))}
            </div>
          );
        })()}
      </main>
    </div>
  );
}
