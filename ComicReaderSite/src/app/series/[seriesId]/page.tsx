'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

type Manga = {
  id: number;
  title: string;
  cover?: string;
  chapters?: string[]; // Mảng chapter đã parse
};

export default function SeriesDetailPage({ params }: { params: { seriesId: string } }) {
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`http://localhost:8080/Comic/api/manga/${params.seriesId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // ⚙️ Xử lý chuỗi chapters từ DB
        let chapters: string[] = [];
        if (typeof data.chapters === "string") {
          try {
            chapters = JSON.parse(data.chapters);
          } catch {
            // Nếu không parse được => tách bằng dấu phẩy hoặc để trống
            chapters = data.chapters.split(",").map((s: string) => s.trim());
          }
        } else if (Array.isArray(data.chapters)) {
          chapters = data.chapters;
        }

        if (active) {
          setManga({
            id: data.id,
            title: data.title,
            cover: data.cover,
            chapters: chapters,
          });
        }
      })
      .catch((err) => {
        console.error("❌ Failed to load manga:", err);
        setManga(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.seriesId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-xl">
        Loading manga...
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-xl">
        Manga not found.
      </div>
    );
  }

  const firstChapterId = manga.chapters && manga.chapters.length > 0 ? "1" : "";

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* --- Header Info --- */}
      <div className="flex gap-8 px-16 py-10">
        {/* Cover */}
        <div>
          <img
            src={manga.cover || "/cover-demo.jpg"}
            alt={manga.title}
            className="w-44 rounded-xl shadow-lg"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{manga.title}</h1>
          <div className="text-lg text-gray-300 mb-2">Manga Series</div>

          {firstChapterId && (
            <Link href={`/series/${params.seriesId}/${firstChapterId}`} className="inline-block">
              <button className="bg-yellow-400 text-gray-900 rounded-lg px-8 py-2 font-semibold text-lg mb-4">
                Read Now
              </button>
            </Link>
          )}
          <span className="ml-4 text-2xl cursor-pointer">🔖</span>

          <div className="my-4">
            <span className="bg-gray-800 rounded px-3 py-1 mr-2">Comedy</span>
          </div>

          <div className="text-gray-400 mb-3">
            {/* synopsis có thể thêm sau nếu backend trả về */}
          </div>
        </div>

        {/* Stats */}
        <div className="min-w-[220px] bg-gray-800 rounded-xl p-4">
          <div>Type: <b>Manga</b></div>
          <div>Status: <b>Ongoing</b></div>
          <div>Score: <b>9.0</b></div>
          <div>Views: <b>407</b></div>
        </div>
      </div>

      {/* --- Chapter List --- */}
      <div className="flex gap-8 px-16 pb-10">
        <div className="flex-2 bg-gray-800 rounded-xl p-6 w-full">
          <div className="flex items-center mb-4">
            <div className="font-bold text-xl text-purple-400 mr-4">List Chapter</div>
            <div className="bg-gray-900 rounded px-3 py-1 mr-4">Language: EN</div>
            <input
              type="text"
              placeholder="Search chapter..."
              className="bg-gray-900 rounded px-3 py-1 text-white border-none"
            />
          </div>

          <ul className="divide-y divide-gray-700">
            {manga.chapters && manga.chapters.length > 0 ? (
              manga.chapters.map((ch, idx) => (
                <li key={idx} className="flex items-center py-3">
                  <span className="mr-3 text-lg">📄</span>
                  <span className="flex-1">{ch}</span>
                  <Link
                    href={`/series/${params.seriesId}/${idx + 1}`}
                    className="bg-gray-700 rounded px-4 py-1 font-semibold hover:bg-gray-600 transition"
                  >
                    Read
                  </Link>
                </li>
              ))
            ) : (
              <li className="py-3 text-gray-400">No chapters found.</li>
            )}
          </ul>
        </div>

        {/* --- Sidebar --- */}
        <div className="flex-1 bg-gray-800 rounded-xl p-6">
          <div className="font-bold text-xl mb-4">Genres</div>
          <div className="flex gap-2 flex-wrap mb-4">
            <span className="bg-green-100 text-gray-900 rounded px-3 py-1 font-semibold">Latest</span>
            <span className="bg-yellow-100 text-gray-900 rounded px-3 py-1 font-semibold">New</span>
            <span className="bg-pink-200 text-gray-900 rounded px-3 py-1 font-semibold">Popular</span>
          </div>
        </div>
      </div>
    </div>
  );
}
