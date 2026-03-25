"use client";

import { useEffect, useState } from "react";
import MangaCard from "@/components/MangaCard";
import Link from "next/link";
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
  // alpha filter and delete state
  const [alphaFilter, setAlphaFilter] = useState<"all" | "A" | "B" | "C">(
    "all"
  );

  // Delete a bookmark: try server delete using bookmark id if available, otherwise remove from localStorage
  async function handleDeleteBookmark(bm: BookmarkItem) {
    if (!bm) return;
    const confirmMsg = `Delete bookmark for "${bm.mangaTitle}"?`;
    if (!confirm(confirmMsg)) return;

    // Try server-side delete if we have an id
    if (bm.id != null) {
      try {
        await apiService.deleteBookmark(bm.id as any);
        setBookmarks((prev) =>
          prev.filter((x) => String(x.mangaId) !== String(bm.mangaId))
        );
        return;
      } catch (err) {
        console.warn("Server delete failed, will try local removal", err);
      }
    }

    // Fallback: remove from localStorage
    try {
      const raw = localStorage.getItem("bookmarks");
      const arr = raw ? JSON.parse(raw) : [];
      const newArr = arr.filter(
        (b: any) => String(b.mangaId) !== String(bm.mangaId)
      );
      localStorage.setItem("bookmarks", JSON.stringify(newArr));
      setBookmarks((prev) =>
        prev.filter((x) => String(x.mangaId) !== String(bm.mangaId))
      );
    } catch (e) {
      console.error("Failed to remove bookmark locally", e);
      alert("Failed to delete bookmark");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await apiService.getBookmarks();
        // DEV: log raw response to help debug missing fields
        if (
          typeof window !== "undefined" &&
          process.env.NODE_ENV !== "production"
        ) {
          console.debug("[BookmarksPage] raw bookmarks response:", result);
        }
        if (cancelled) return;

        if (Array.isArray(result) && result.length > 0) {
          // normalize items (preserve bookmark metadata)
          const items = result.map((payload: any) =>
            normalizeBookmark(payload)
          );
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
        const items = readBookmarksFromLocalStorage();
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
                const targetHref = bm.currentChapter
                  ? `/series/${bm.mangaId}/${bm.currentChapter}`
                  : `/series/${bm.mangaId}`;
                return (
                  <div key={bm.mangaId} className="space-y-2 relative">
                    <Link href={targetHref} className="block">
                      <div className="relative">
                        <MangaCard
                          noLink={true}
                          manga={{
                            id: bm.mangaId,
                            title: bm.mangaTitle,
                            cover: bm.mangaCover,
                            chapters: bm.totalChapters
                              ? Array.from({ length: bm.totalChapters }).map(
                                  (_, i) => ({
                                    id: String(i + 1),
                                    title: `Chapter ${i + 1}`,
                                  })
                                )
                              : undefined,
                          }}
                        />
                        {bm.currentChapter != null && (
                          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded">
                            Chap {bm.currentChapter}
                          </div>
                        )}
                      </div>
                      <div className="rounded-lg border border-purple-500/20 bg-gray-900/60 px-3 py-2 text-xs text-purple-200 mt-2">
                        {bm.currentChapter != null &&
                        bm.totalChapters != null ? (
                          <div className="flex items-center justify-between">
                            <div>
                              Chapter {bm.currentChapter} of {bm.totalChapters}
                            </div>
                            {typeof bm.readingProgress === "number" && (
                              <div className="text-xs text-gray-700 bg-gray-200 px-2 py-0.5 rounded">
                                {Math.round(bm.readingProgress * 100)}%
                              </div>
                            )}
                          </div>
                        ) : bm.currentChapter != null ? (
                          <div>Current chapter: {bm.currentChapter}</div>
                        ) : (
                          <div className="text-gray-400">No progress yet</div>
                        )}

                        {typeof bm.readingProgress === "number" && (
                          <div className="w-full bg-gray-800 h-2 rounded mt-2 overflow-hidden">
                            <div
                              className="bg-yellow-400 h-2"
                              style={{
                                width: `${Math.round(
                                  bm.readingProgress * 100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex gap-2">
                      <Link
                        href={targetHref}
                        className="px-3 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 text-sm"
                      >
                        Continue
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteBookmark(bm);
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500 text-sm"
                        title={`Delete bookmark for ${bm.mangaTitle}`}
                      >
                        Delete
                      </button>
                    </div>
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
  const getNumber = (v: any) => {
    if (v == null) return null;
    if (typeof v === "number") return v;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const mangaObj = source?.manga ?? {};
  const rawCurrent =
    source?.currentChapter ??
    source?.current_chapter ??
    mangaObj?.currentChapter ??
    mangaObj?.current_chapter ??
    source?.chapter ??
    null;
  const rawTotal =
    source?.totalChapters ??
    source?.total_chapters ??
    mangaObj?.totalChapters ??
    mangaObj?.total_chapters ??
    (Array.isArray(mangaObj?.chapters) ? mangaObj.chapters.length : null) ??
    null;
  const rawProgress =
    source?.readingProgress ??
    source?.reading_progress ??
    mangaObj?.readingProgress ??
    mangaObj?.reading_progress ??
    null;

  return {
    mangaId: String(source?.mangaId ?? source?.id ?? mangaObj?.id ?? ""),
    mangaTitle: String(
      source?.mangaTitle ?? source?.title ?? mangaObj?.title ?? "Untitled"
    ),
    mangaCover:
      source?.mangaCover ?? source?.cover ?? mangaObj?.cover ?? undefined,
    id: source?.id ?? null,
    currentChapter: getNumber(rawCurrent),
    totalChapters: getNumber(rawTotal),
    readingProgress:
      typeof rawProgress === "number" ? rawProgress : getNumber(rawProgress),
    createdAt: source?.createdAt ?? source?.created_at ?? null,
    updatedAt: source?.updatedAt ?? source?.updated_at ?? null,
  };
}

function readBookmarksFromLocalStorage(): BookmarkItem[] {
  try {
    const raw = localStorage.getItem("bookmarks");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
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
