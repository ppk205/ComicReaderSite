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
  const [activeIndex, setActiveIndex] = useState<number>(-1); // highlight row when clicked

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

  // thêm ở đầu component (trước return)
  const topTags = [
    { label: "⚡ Latest Updated", className: "bg-green-100 text-gray-900" },
    { label: "✌️ New Release", className: "bg-yellow-100 text-gray-900" },
    { label: "🔥 Most Viewed", className: "bg-pink-200 text-gray-900" },
    { label: "✅ Completed", className: "bg-cyan-100 text-gray-900" },
  ];

  const otherTags = [
    "Action","Adventure","Cars","Comedy","Dementia","Demons","Doujinshi","Drama","Ecchi",
    "Fantasy","Game","Gender Bender","Harem","Hentai","Historical","Horror","Josei","Kids","Magic",
    "Martial Arts","Mecha","Military","Music","Mystery","Parody","Police","Psychological","Romance",
    "Samurai","School","Sci-Fi","Seinen","Shoujo","Shoujo Ai","Shounen","Shounen Ai","Slice of Life",
    "Space","Sports","Super Power","Supernatural","Thriller","Vampire","Yaoi","Yuri","Isekai",
    "Romance Comedy","Slice of Life Comedy","Psychological Thriller","Historical Drama"
  ];

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

      {/* --- Chapter List (styled like mockup) --- */}
      <div className="flex gap-8 px-16 pb-10">
        <div className="flex-2 bg-gray-800 rounded-xl overflow-hidden w-full">
          {/* header bar */}
          <div className="bg-[#222] border-b border-purple-700/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-white font-semibold pl-1">List Chapter</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Number of Chapter"
                className="bg-gray-900 text-gray-300 placeholder-gray-600 rounded px-3 py-2 text-sm"
                aria-label="Search chapter number"
              />
            </div>
          </div>

          {/* scrollable list */}
          <div className="max-h-[520px] overflow-y-auto">
            <ul className="divide-y divide-gray-700">
              {manga.chapters && manga.chapters.length > 0 ? (
                manga.chapters.map((ch, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <li
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`flex items-center justify-between px-4 py-4 cursor-pointer transition ${isActive ? "bg-gray-900 border-l-4 border-purple-600" : "hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-gray-400">📄</div>
                        <div className={`text-sm ${isActive ? "text-purple-300 font-semibold" : "text-gray-200"}`}>
                          {ch}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-400 hidden sm:block"> {/* optional meta */} </div>
                        <Link
                          href={`/series/${params.seriesId}/${idx + 1}`}
                          className={`px-3 py-1 rounded-md text-sm font-semibold transition ${isActive ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
                        >
                          Read
                        </Link>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="py-6 text-center text-gray-400">No chapters found.</li>
              )}
            </ul>
          </div>
        </div>

        {/* --- Sidebar (keep existing tags/sidebar) --- */}
        <div className="flex-1 bg-gray-800 rounded-xl p-6">
          <div className="font-bold text-xl mb-4">Genres</div>

          {/* Top highlighted tags */}
          <div className="flex gap-2 flex-wrap mb-4">
            {topTags.map((t) => (
              <button
                key={t.label}
                type="button"
                className={`${t.className} rounded px-4 py-2 font-semibold text-sm`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tag pills */}
          <div className="flex gap-2 flex-wrap">
            {otherTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="bg-gray-800 text-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-700 transition"
                aria-label={`Tag ${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
