'use client'
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChapterReaderPage({ params }: { params: { seriesId: string, chapterId: string } }) {
  const images = [
    "/img/1.jpg",
    "/img/2.jpg",
    "/img/3.jpg",
  ];

  // danh sách chapter mẫu (thay bằng dữ liệu thật nếu có)
  const chapters = Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    title: `Chapter ${i + 1}`
  }));

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // dropdown chapter
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // collapsed state đọc từ query param ban đầu
  const initialCollapsed = searchParams?.get("sidebar") === "hidden";
  const [collapsed, setCollapsedState] = useState<boolean>(initialCollapsed ?? false);

  // helper để cập nhật query param khi thay đổi collapsed
  function setCollapsedAndUpdateUrl(next: boolean) {
    setCollapsedState(next);
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    if (next) sp.set("sidebar", "hidden");
    else sp.delete("sidebar");
    const url = `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;
    // replace để không thêm lịch sử mới
    router.replace(url);
  }

  function navigateToChapterId(id?: string) {
    if (!id) return;
    setOpen(false);
    // preserve sidebar query param when navigating
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    if (collapsed) sp.set("sidebar", "hidden");
    else sp.delete("sidebar");
    const url = `/series/${params.seriesId}/${id}${sp.toString() ? `?${sp.toString()}` : ""}`;
    router.push(url);
  }

  // helper: tìm index hiện tại và id prev/next
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

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white flex flex-col justify-between border-r border-gray-700 transition-all duration-200 ${
          collapsed ? "w-0 p-0 overflow-hidden opacity-0" : "w-72 py-6 px-5"
        }`}
        aria-hidden={collapsed}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-yellow-400 rounded-lg w-10 h-10 flex items-center justify-center font-bold text-xl text-gray-900">M</div>
            <span className="font-bold text-lg">manga<br />reader.<span className="text-yellow-400">to</span></span>
          </div>

          {/* Controls redesigned */}
          <div className="mb-6">
            <div className="space-y-3">
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-3 text-center font-medium">
                Language: EN <span className="ml-2"></span>
              </button>

              <div className="relative" ref={ref}>
                <button
                  onClick={() => setOpen(v => !v)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-3 text-center font-medium flex items-center justify-center gap-2"
                >
                  <span>Chapter {params.chapterId}</span>
                  <span>▼</span>
                </button>

                {open && (
                  <div className="absolute z-30 left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow max-h-56 overflow-y-auto">
                    {chapters.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => navigateToChapterId(ch.id)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-700 ${ch.id === params.chapterId ? "bg-gray-700 font-semibold" : ""}`}
                      >
                        {ch.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={navigatePrev}
                  disabled={!hasPrev}
                  className={`flex-1 h-14 bg-gray-700 rounded text-white text-2xl flex items-center justify-center ${!hasPrev ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-600"}`}
                  aria-label="Previous chapter"
                >
                  ←
                </button>

                <button
                  onClick={navigateNext}
                  disabled={!hasNext}
                  className={`flex-1 h-14 bg-gray-700 rounded text-white text-2xl flex items-center justify-center ${!hasNext ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-600"}`}
                  aria-label="Next chapter"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Menu */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-400 font-bold text-lg">0</span>
            <span className="text-gray-300">Comments</span>
          </div>
          <nav className="flex flex-col gap-2 mb-4 text-gray-300">
            <button className="flex items-center gap-2 hover:text-yellow-400 transition"><span>⚙️</span> Settings</button>
            <button
              onClick={() => {
                // preserve sidebar query param when going back to series page
                const sp = new URLSearchParams(searchParams?.toString() ?? "");
                if (collapsed) sp.set("sidebar", "hidden"); else sp.delete("sidebar");
                const url = `/series/${params.seriesId}${sp.toString() ? `?${sp.toString()}` : ""}`;
                router.push(url);
              }}
              className="flex items-center gap-2 hover:text-yellow-400 transition"
              aria-label="Go to manga detail"
            >
              <span>ℹ️</span> Manga Detail
            </button>
            <button className="flex items-center gap-2 hover:text-yellow-400 transition"><span>📖</span> Reading List</button>
          </nav>

          {/* Toggle button: collapse / expand */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setCollapsedAndUpdateUrl(true)}
              aria-label="Collapse sidebar"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition"
            >
              <span className="text-xl">✖</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Small visible button to re-open sidebar when collapsed */}
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
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Trang ${idx + 1}`}
              className="w-full mb-6 rounded shadow-lg"
            />
          ))}

          {/* BOTTOM NAV: prev/next chapter bar (giống mockup) */}
          <div className="w-full mt-6">
            <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-4 flex items-center justify-between">
              <button
                onClick={navigatePrev}
                disabled={!hasPrev}
                className={`bg-gray-700 px-4 py-2 rounded ${!hasPrev ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-600'}`}
              >
                ← Prev Chapter
              </button>

              <button
                onClick={navigateNext}
                disabled={!hasNext}
                className={`bg-gray-700 px-4 py-2 rounded ${!hasNext ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-600'}`}
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