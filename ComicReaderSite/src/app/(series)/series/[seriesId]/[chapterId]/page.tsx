'use client'
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ImageItem = { url: string; order: number };
type ChapterItem = { id: string; title: string };

export default function ChapterReaderPage({ params }: { params: { seriesId: string; chapterId: string } }) {
  return <ChapterReader params={params} />;
}

function ChapterReader({ params }: { params: { seriesId: string; chapterId: string } }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/Comic/api";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [images, setImages] = useState<ImageItem[]>([]);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [seriesTitle, setSeriesTitle] = useState<string>("");
  const [seriesImage, setSeriesImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const initialCollapsed = searchParams?.get("sidebar") === "hidden";
  const [collapsed, setCollapsedState] = useState<boolean>(initialCollapsed ?? false);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    let abort = false;
    async function fetchChapterImages() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/chapter-images?mangaId=${encodeURIComponent(params.seriesId)}&chapterId=${encodeURIComponent(params.chapterId)}`);
        if (!res.ok) throw new Error(`Lỗi khi tải ảnh (status ${res.status})`);
        const data = await res.json();
        const imgs: ImageItem[] = Array.isArray(data)
          ? data.map((it: any) => ({
              url: it.url ?? it.path ?? it.imageUrl ?? it.src,
              order: Number(it.order ?? it.index ?? 0),
            }))
          : [];
        imgs.sort((a, b) => a.order - b.order);
        if (!abort) setImages(imgs);
      } catch (err: any) {
        if (!abort) setError(err?.message ?? "Unknown error");
      } finally {
        if (!abort) setLoading(false);
      }
    }
    fetchChapterImages();
    return () => {
      abort = true;
    };
  }, [API_BASE, params.seriesId, params.chapterId]);

  useEffect(() => {
    let abort = false;
    async function fetchMangaInfo() {
      try {
        const res = await fetch(`${API_BASE}/manga/${encodeURIComponent(params.seriesId)}`);
        if (!res.ok) throw new Error(`Lỗi khi tải thông tin manga (status ${res.status})`);
        const data = await res.json();
        if (!abort) {
          setSeriesTitle(String(data.title ?? data.name ?? data.mangaTitle ?? ""));
          setSeriesImage(data.image ?? data.cover ?? data.thumbnail ?? data.thumb ?? data.poster ?? null);
        }
        if (Array.isArray(data.chapters)) {
          const mapped = data.chapters.map((ch: any, idx: number) => {
            if (typeof ch === "string") return { id: String(idx + 1), title: ch };
            if (typeof ch === "object")
              return { id: String(ch.id ?? idx + 1), title: ch.title ?? ch.name ?? `Chapter ${idx + 1}` };
            return { id: String(idx + 1), title: `Chapter ${idx + 1}` };
          });
          if (!abort) setChapters(mapped);
        } else if (Array.isArray(data)) {
          const mapped = data.map((ch: any, idx: number) => ({
            id: String(ch.id ?? idx + 1),
            title: ch.title ?? ch.name ?? String(ch),
          }));
          if (!abort) setChapters(mapped);
        } else {
          if (!abort) setChapters([]);
        }
      } catch (err) {
        if (!abort) console.error("Error fetching manga info:", err);
      }
    }
    fetchMangaInfo();
    return () => {
      abort = true;
    };
  }, [API_BASE, params.seriesId]);

  function setCollapsedAndUpdateUrl(next: boolean) {
    setCollapsedState(next);
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    if (next) sp.set("sidebar", "hidden");
    else sp.delete("sidebar");
    const url = `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;
    router.replace(url);
  }

  function buildUrlForChapter(id: string) {
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    if (collapsed) sp.set("sidebar", "hidden");
    else sp.delete("sidebar");
    return `/series/${params.seriesId}/${id}${sp.toString() ? `?${sp.toString()}` : ""}`;
  }

  function navigateToChapterId(id?: string) {
    if (!id) return;
    setOpen(false);
    router.push(buildUrlForChapter(id));
  }

  function getCurrentIndex() {
    return chapters.findIndex((c) => c.id === params.chapterId);
  }

  function navigatePrev() {
    const idx = getCurrentIndex();
    if (idx > 0) navigateToChapterId(chapters[idx - 1].id);
  }

  function navigateNext() {
    const idx = getCurrentIndex();
    if (idx >= 0 && idx < chapters.length - 1) navigateToChapterId(chapters[idx + 1].id);
  }

  const currentIndex = getCurrentIndex();
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < chapters.length - 1;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [params.chapterId]);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white flex flex-col border-r border-gray-700 transition-all duration-200 ${
          collapsed ? "w-0 p-0 overflow-hidden opacity-0" : "w-72 py-6 px-5"
        }`}
        aria-hidden={collapsed}
      >
        <div>
          {/* Controls */}
          <div className="mb-6">
            <div className="space-y-3">
              {/* chọn chapter */}
              {/* Series cover */}
              <div className="mb-3 flex flex-col items-center gap-2">
                {seriesImage ? (
                  <img
                    src={seriesImage}
                    alt={seriesTitle}
                    className="w-40 h-56 object-cover rounded shadow-md"
                  />
                ) : (
                  <div className="w-40 h-56 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-300">
                    No cover
                  </div>
                )}
                <div className="text-center">
                  <div className="font-extrabold text-xl sm:text-2xl line-clamp-2">{seriesTitle || `Series ${params.seriesId}`}</div>
                </div>
              </div>
               <div className="relative" ref={dropdownRef}>
                 <button
                   onClick={() => setOpen((v) => !v)}
                   className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-3 text-center font-medium flex items-center justify-center gap-2"
                 >
                   <span>Chapter {params.chapterId}</span>
                   <span className="text-sm">▼</span>
                 </button>

                 {open && (
                   <div className="absolute z-30 left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow max-h-56 overflow-y-auto">
                     {chapters.length > 0 ? (
                       chapters.map((ch) => (
                         <button
                           key={ch.id}
                           onClick={() => navigateToChapterId(ch.id)}
                           className={`w-full text-left px-3 py-2 hover:bg-gray-700 ${
                             ch.id === params.chapterId
                               ? "bg-gray-700 font-semibold text-yellow-400"
                               : "text-white"
                           }`}
                         >
                           {ch.title}
                         </button>
                       ))
                     ) : (
                       <div className="px-3 py-2 text-gray-400">Đang tải danh sách...</div>
                     )}
                   </div>
                 )}
               </div>

              {/* Nút chuyển chap */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={navigatePrev}
                  disabled={!hasPrev}
                  className={`flex-1 h-14 bg-gray-700 rounded text-white text-2xl flex items-center justify-center ${
                    !hasPrev ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-600"
                  }`}
                >
                  ←
                </button>
                <button
                  onClick={navigateNext}
                  disabled={!hasNext}
                  className={`flex-1 h-14 bg-gray-700 rounded text-white text-2xl flex items-center justify-center ${
                    !hasNext ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-600"
                  }`}
                >
                  →
                </button>
              </div>

              {/* nút back */}
              <div className="mt-6 border-t border-gray-700 pt-4 bg-gray-800 rounded-xl p-4 shadow-inner">
                <nav className="grid grid-cols-1 gap-2 text-gray-300">
                    <button
                    onClick={() => {
                        const sp = new URLSearchParams(searchParams?.toString() ?? "");
                        if (collapsed) sp.set("sidebar", "hidden");
                        else sp.delete("sidebar");
                        const url = `/${sp.toString() ? `?${sp.toString()}` : ""}`;
                        router.push(url);
                    }}
                    className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 rounded px-4 py-2 transition"
                  >
                    🏠 <span>Home</span>
                  </button>
                  <button
                    onClick={() => {
                      const sp = new URLSearchParams(searchParams?.toString() ?? "");
                      if (collapsed) sp.set("sidebar", "hidden");
                      else sp.delete("sidebar");
                      const url = `/series/${params.seriesId}${sp.toString() ? `?${sp.toString()}` : ""}`;
                      router.push(url);
                    }}
                    className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 rounded px-4 py-2 transition"
                  >
                    ℹ️ <span>Manga Detail</span>
                  </button>
                  
                </nav>
                <div className="flex items-center justify-center mt-4">
                  <button
                    onClick={() => setCollapsedAndUpdateUrl(true)}
                    aria-label="Collapse sidebar"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition text-xl"
                  >
                    ✖
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {collapsed && (
        <button
          onClick={() => setCollapsedAndUpdateUrl(false)}
          aria-label="Open sidebar"
          className="fixed left-2 top-6 z-50 w-10 h-10 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-white"
        >
          ☰
        </button>
      )}

      {/* Reader Content */}
      <main className="flex-1 flex flex-col items-center py-8 overflow-y-auto">
        <div className="max-w-3xl w-full flex flex-col items-center">
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900/90 z-50">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 border-4 border-gray-600 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
                <p className="text-yellow-400 text-lg">Đang tải ảnh...</p>
              </div>
            </div>
          )}

          {error && <div className="w-full p-8 text-center text-red-400">Lỗi: {error}</div>}

          {!loading &&
            !error &&
            images.length > 0 &&
            images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`Trang ${idx + 1}`}
                className="w-full mb-6 rounded shadow-lg"
                loading="lazy"
                draggable={false}
              />
            ))}

          {!loading && !error && images.length === 0 && (
            <div className="w-full p-8 text-center text-gray-400">Không có ảnh cho chapter này.</div>
          )}

          <div className="w-full mt-6">
            <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-4 flex items-center justify-between">
              <button
                onClick={navigatePrev}
                disabled={!hasPrev}
                className={`bg-gray-700 px-4 py-2 rounded ${
                  !hasPrev ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-600"
                }`}
              >
                ← Prev Chapter
              </button>

              <div className="text-sm text-gray-300">
                {chapters[currentIndex]?.title ?? `Chapter ${params.chapterId}`}
              </div>

              <button
                onClick={navigateNext}
                disabled={!hasNext}
                className={`bg-gray-700 px-4 py-2 rounded ${
                  !hasNext ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-600"
                }`}
              >
                Next Chapter →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
