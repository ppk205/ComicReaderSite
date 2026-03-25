"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { apiService } from "@/services/api";

export default function ChapterReaderPage({
  params,
}: {
  params: { seriesId: string; chapterId: string };
}) {
  const uniqueKey = `${params.seriesId}-${params.chapterId}`;
  return <ChapterReader key={uniqueKey} params={params} />;
}

function ChapterReader({
  params,
}: {
  params: { seriesId: string; chapterId: string };
}) {
  const [images, setImages] = useState<{ url: string; order: number }[]>([]);
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapterSearch, setChapterSearch] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 👉 Fetch chapter images
  useEffect(() => {
    let cancelled = false;

    async function fetchChapterImages() {
      try {
        setLoading(true);
        const data = await apiService.getChapterImages(
          params.seriesId,
          params.chapterId
        );
        if (cancelled) {
          return;
        }
        const sorted = Array.isArray(data)
          ? data
              .map((entry: any) => ({
                url: String(entry.url ?? entry.imageUrl ?? ""),
                order: Number(entry.order ?? entry.position ?? 0),
              }))
              .filter((entry) => entry.url.length > 0)
              .sort((a, b) => a.order - b.order)
          : [];
        setImages(sorted);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to fetch chapter images");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchChapterImages();

    return () => {
      cancelled = true;
    };
  }, [params.seriesId, params.chapterId]);

  // 👉 Fetch chapter list
  useEffect(() => {
    let cancelled = false;

    async function fetchMangaInfo() {
      try {
        const data = await apiService.getMangaById(params.seriesId);
        if (cancelled) {
          return;
        }

        if (Array.isArray((data as any)?.chapters)) {
          const mapped = (data as any).chapters.map(
            (chapter: any, index: number) => {
              if (typeof chapter === "string") {
                return { id: String(index + 1), title: chapter };
              }

              if (chapter && typeof chapter === "object") {
                const chapterId =
                  "id" in chapter
                    ? String(chapter.id ?? index + 1)
                    : String(index + 1);
                const chapterTitle =
                  "title" in chapter
                    ? String(chapter.title ?? chapterId)
                    : chapterId;
                return { id: chapterId, title: chapterTitle };
              }

              return {
                id: String(index + 1),
                title: String(chapter ?? index + 1),
              };
            }
          );
          setChapters(mapped);
        } else {
          setChapters([]);
        }
      } catch (err) {
        console.error("Error fetching manga info:", err);
      }
    }
    fetchMangaInfo();
    return () => {
      cancelled = true;
    };
  }, [params.seriesId]);

  // 👉 Sidebar toggle
  const initialCollapsed = searchParams?.get("sidebar") === "hidden";
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);
  const setCollapsedAndUpdateUrl = (next: boolean) => {
    setCollapsed(next);
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    if (next) sp.set("sidebar", "hidden");
    else sp.delete("sidebar");
    const url = `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;
    router.replace(url);
  };

  // 👉 Navigation
  const getCurrentIndex = () =>
    chapters.findIndex((c) => c.id === params.chapterId);
  const navigateToChapter = (id: string) => {
    if (!id) return;
    router.push(`/series/${params.seriesId}/${id}`);
  };

  const hasPrev = getCurrentIndex() > 0;
  const hasNext = getCurrentIndex() < chapters.length - 1;

  // 👉 Auto-scroll to top when switching chapters
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [params.chapterId]);

  return (
    <div className="relative flex min-h-screen bg-gray-900 text-white">
      {/* 🔹 Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex gap-3">
          <Link
            href={`/series/${params.seriesId}`}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            title="Back to series"
          >
            Series
          </Link>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            title="Back to Home"
          >
            Home
          </button>
          <button
            onClick={() =>
              navigateToChapter(chapters[getCurrentIndex() - 1]?.id)
            }
            disabled={!hasPrev}
            className={`px-4 py-2 bg-gray-700 rounded ${
              !hasPrev ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-600"
            }`}
          >
            ← Prev
          </button>
          <button
            onClick={() =>
              navigateToChapter(chapters[getCurrentIndex() + 1]?.id)
            }
            disabled={!hasNext}
            className={`px-4 py-2 bg-gray-700 rounded ${
              !hasNext ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-600"
            }`}
          >
            Next →
          </button>
        </div>

        <h1 className="text-xl font-bold text-yellow-400 truncate max-w-[40%] text-center">
          {chapters[getCurrentIndex()]?.title || "Loading..."}
        </h1>

        <button
          onClick={() => setCollapsedAndUpdateUrl(!collapsed)}
          className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          {collapsed ? "☰ Chapters" : "✖ Close"}
        </button>
        {/* Save bookmark button */}
        <button
          onClick={async () => {
            const mangaData = await (async () => {
              try {
                return await apiService.getMangaById(params.seriesId);
              } catch {
                return null;
              }
            })();

            const md = mangaData as any;
            const title =
              md?.title ?? chapters[getCurrentIndex()]?.title ?? "Untitled";
            const cover = md?.cover ?? undefined;
            const totalChapters = Array.isArray(md?.chapters)
              ? md.chapters.length
              : chapters.length;
            const currentChapter =
              Number(params.chapterId) || getCurrentIndex() + 1 || 0;

            // compute reading progress strictly as currentChapter / totalChapters when possible
            const currentChapterNum = Number(currentChapter) || null;
            const totalChaptersNum = Number(totalChapters) || null;

            let readingProgress = null as number | null;
            if (
              currentChapterNum != null &&
              totalChaptersNum != null &&
              totalChaptersNum > 0
            ) {
              readingProgress = Math.max(
                0,
                Math.min(1, currentChapterNum / totalChaptersNum)
              );
            } else {
              // fallback: compute by scroll position if totalChapters unavailable
              try {
                const scrollable = document.querySelector("main");
                if (scrollable) {
                  const el = scrollable as HTMLElement;
                  const max = el.scrollHeight - el.clientHeight;
                  if (max > 0) {
                    readingProgress = Math.min(
                      1,
                      Math.max(0, el.scrollTop / max)
                    );
                  } else {
                    readingProgress = 1;
                  }
                }
              } catch {}
            }

            const payload = {
              mangaId: String(params.seriesId),
              title,
              cover,
              currentChapter: Number(currentChapter) || null,
              totalChapters: Number(totalChapters) || null,
              readingProgress: readingProgress,
            };

            try {
              await apiService.saveBookmark(payload);
              alert("Bookmark saved");
            } catch (err) {
              // fallback to localStorage
              try {
                const raw = localStorage.getItem("bookmarks");
                const arr = raw ? JSON.parse(raw) : [];
                const idx = arr.findIndex(
                  (b: any) => String(b.mangaId) === String(params.seriesId)
                );
                const item = {
                  mangaId: String(params.seriesId),
                  mangaTitle: title,
                  mangaCover: cover,
                  currentChapter: Number(currentChapter) || null,
                  totalChapters: Number(totalChapters) || null,
                  readingProgress:
                    readingProgress == null
                      ? null
                      : Math.max(0, Math.min(1, Number(readingProgress))),
                  createdAt: new Date().toISOString(),
                };
                if (idx >= 0) arr[idx] = { ...arr[idx], ...item };
                else arr.push(item);
                localStorage.setItem("bookmarks", JSON.stringify(arr));
                alert("Bookmark saved locally (offline)");
              } catch (e) {
                console.error("Failed to save bookmark locally", e);
                alert("Failed to save bookmark");
              }
            }
          }}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 ml-2"
        >
          Save bookmark
        </button>
      </div>

      {/* 🔹 Main Reader Area */}
      <main
        key={`${params.seriesId}-${params.chapterId}`}
        className="flex-1 bg-gray-900 text-white overflow-y-auto h-screen pt-[5.5rem] pb-20 flex flex-col items-center"
      >
        {/* Centered loading overlay */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900/90 z-50">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-4 border-gray-600 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
              <p className="text-yellow-400 text-lg">Đang tải ảnh...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-5rem)]">
            <p className="text-red-400 text-lg">Lỗi: {error}</p>
          </div>
        )}

        {/* Manga pages */}
        {!loading && !error && images.length > 0 && (
          <div className="flex flex-col items-center gap-6">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`Trang ${idx + 1}`}
                className="max-w-[900px] w-full h-auto rounded-lg shadow-lg select-none"
                draggable={false}
              />
            ))}
          </div>
        )}

        {/* No pages */}
        {!loading && !error && images.length === 0 && (
          <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-5rem)]">
            <p className="text-gray-400 text-lg">
              Không có ảnh cho chapter này.
            </p>
          </div>
        )}
      </main>

      {/* 🔹 Sidebar (chapter list) */}
      <aside
        className={`fixed right-0 top-[3.5rem] h-[calc(100vh-3.5rem)] w-72 bg-gray-800 border-l border-gray-700 z-40 
                transition-transform duration-200 transform ${
                  collapsed ? "translate-x-full" : "translate-x-0"
                }`}
      >
        <div className="flex flex-col h-full">
          {/* 🔹 Header with search */}
          <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-6">
            <h1 className="text-2xl font-bold text-yellow-400 mb-3">
              Chapters
            </h1>
            <input
              type="number"
              min="1"
              max={chapters.length}
              placeholder="Search chapter #"
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && chapterSearch) {
                  const targetId = String(chapterSearch);
                  const found = chapters.find((ch) => ch.id === targetId);
                  if (found) navigateToChapter(found.id);
                }
              }}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 
                                     focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* 🔹 Scrollable chapter list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
            {chapters.length > 0 ? (
              chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => navigateToChapter(ch.id)}
                  className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors ${
                    ch.id === params.chapterId
                      ? "bg-gray-700 text-yellow-400 font-semibold"
                      : "text-white"
                  }`}
                >
                  {ch.title}
                </button>
              ))
            ) : (
              <p className="text-gray-400 text-sm">
                Đang tải danh sách chapter...
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Optional backdrop when sidebar open */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setCollapsedAndUpdateUrl(true)}
        ></div>
      )}
    </div>
  );
}
