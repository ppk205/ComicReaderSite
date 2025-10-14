'use client';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChapterReaderPage({ params }: { params: { seriesId: string, chapterId: string } }) {
    // ✅ Tạo key để ép component reload khi đổi chapter
    const uniqueKey = `${params.seriesId}-${params.chapterId}`;
    return <ChapterReader key={uniqueKey} params={params} />;
}

function ChapterReader({ params }: { params: { seriesId: string; chapterId: string } }) {
    const [images, setImages] = useState<{ url: string; order: number }[]>([]);
    const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/Comic/api";
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 👉 Fetch ảnh chapter
    useEffect(() => {
        async function fetchChapterImages() {
            try {
                setLoading(true);
                const res = await fetch(
                    `${API_BASE}/chapter-images?mangaId=${params.seriesId}&chapterId=${params.chapterId}`
                );
                if (!res.ok) throw new Error("Failed to fetch chapter images");
                const data = await res.json();
                setImages(data.sort((a: any, b: any) => a.order - b.order));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchChapterImages();
    }, [params.seriesId, params.chapterId]);

    // 👉 Fetch danh sách chapter thật từ backend
    useEffect(() => {
        async function fetchMangaInfo() {
            try {
                const res = await fetch(`${API_BASE}/manga/${params.seriesId}`);
                if (!res.ok) throw new Error("Failed to fetch manga info");
                const data = await res.json();
                if (Array.isArray(data.chapters)) {
                    const mapped = data.chapters.map((name: string, index: number) => ({
                        id: String(index + 1),
                        title: name,
                    }));
                    setChapters(mapped);
                }
            } catch (err) {
                console.error("Error fetching manga info:", err);
            }
        }
        fetchMangaInfo();
    }, [params.seriesId]);

    // 👉 Sidebar toggle
    const [collapsed, setCollapsed] = useState(searchParams?.get("sidebar") === "hidden" ?? false);
    const setCollapsedAndUpdateUrl = (next: boolean) => {
        setCollapsed(next);
        const sp = new URLSearchParams(searchParams?.toString() ?? "");
        if (next) sp.set("sidebar", "hidden");
        else sp.delete("sidebar");
        const url = `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;
        router.replace(url);
    };

    // 👉 Navigation
    const getCurrentIndex = () => chapters.findIndex((c) => c.id === params.chapterId);
    const navigateToChapter = (id: string) => router.push(`/series/${params.seriesId}/${id}`);

    const hasPrev = getCurrentIndex() > 0;
    const hasNext = getCurrentIndex() < chapters.length - 1;

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <aside
                className={`bg-gray-800 border-r border-gray-700 transition-all duration-200 ${
                    collapsed ? "w-0 overflow-hidden opacity-0" : "w-72 p-5"
                }`}
            >
                <div className="flex justify-between mb-6">
                    <h1 className="text-xl font-bold text-yellow-400">Manga Reader</h1>
                    <button onClick={() => setCollapsedAndUpdateUrl(true)} className="text-gray-400 hover:text-white">
                        ✖
                    </button>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[80vh]">
                    {chapters.length > 0 ? (
                        chapters.map((ch) => (
                            <button
                                key={ch.id}
                                onClick={() => navigateToChapter(ch.id)}
                                className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
                                    ch.id === params.chapterId ? "bg-gray-700 text-yellow-400 font-semibold" : ""
                                }`}
                            >
                                {ch.title}
                            </button>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm">Đang tải danh sách chapter...</p>
                    )}
                </div>
            </aside>

            {/* Nút mở sidebar */}
            {collapsed && (
                <button
                    onClick={() => setCollapsedAndUpdateUrl(false)}
                    className="fixed left-2 top-6 z-50 bg-gray-700 p-2 rounded hover:bg-gray-600"
                >
                    ☰
                </button>
            )}

            {/* Nội dung đọc truyện */}
            <main
                key={`${params.seriesId}-${params.chapterId}`} // 🔥 ép React vẽ lại mỗi lần đổi chapter
                className="flex-1 flex flex-col items-center py-8 overflow-y-auto"
            >
                {loading && <p className="text-gray-400">Đang tải ảnh...</p>}
                {error && <p className="text-red-400">Lỗi: {error}</p>}

                {!loading &&
                    !error &&
                    images.length > 0 &&
                    images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img.url}
                            alt={`Trang ${idx + 1}`}
                            className="w-full max-w-3xl mb-6 rounded shadow-lg"
                        />
                    ))}

                {!loading && !error && images.length === 0 && (
                    <p className="text-gray-400">Không có ảnh cho chapter này.</p>
                )}

                {/* Thanh điều hướng dưới */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => navigateToChapter(chapters[getCurrentIndex() - 1]?.id)}
                        disabled={!hasPrev}
                        className={`px-4 py-2 bg-gray-700 rounded ${
                            !hasPrev ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-600"
                        }`}
                    >
                        ← Prev
                    </button>
                    <button
                        onClick={() => navigateToChapter(chapters[getCurrentIndex() + 1]?.id)}
                        disabled={!hasNext}
                        className={`px-4 py-2 bg-gray-700 rounded ${
                            !hasNext ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-600"
                        }`}
                    >
                        Next →
                    </button>
                </div>
            </main>
        </div>
    );
}
