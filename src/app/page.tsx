"use client";
import { useState, useMemo } from "react";

const MangaCard = ({ manga, featured = false }) => (
  <div
    className={`bg-gray-500 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      featured ? "h-64" : "h-56"
    }`}
  >
    <div className="flex h-full">
      <div className={`${featured ? "w-24" : "w-20"} flex-shrink-0`}>
        <img
          src={manga.cover}
          alt={manga.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='140' viewBox='0 0 100 140'%3E%3Crect width='100' height='140' fill='%23f3f4f6'/%3E%3Ctext x='50' y='70' text-anchor='middle' fill='%236b7280' font-size='12'%3EManga%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>
      <div className="flex-1 p-3 flex flex-col">
        <h3
          className={`font-semibold text-white mb-2 ${
            featured ? "text-lg" : "text-base"
          } line-clamp-2`}
        >
          {manga.title}
        </h3>
        <div className="flex-1">
          <p className="text-sm text-white mb-1">Recent Chapters:</p>
          <div className="space-y-1">
            {manga.chapters.map((chapter, index) => (
              <div
                key={index}
                className="text-sm text-purple-300 hover:text-blue-800 cursor-pointer truncate"
              >
                {chapter}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  // this will be call in the db or will get api from mangadex or other source
  const featuredManga = [
    { id: 1, title: "One Piece", cover: "/covers/onepiece.jpg", chapters: ["Chapter 1095", "Chapter 1094", "Chapter 1093"] },
    { id: 2, title: "Naruto", cover: "/covers/naruto.jpg", chapters: ["Chapter 700", "Chapter 699", "Chapter 698"] },
    { id: 3, title: "Attack on Titan", cover: "/covers/aot.jpg", chapters: ["Chapter 139", "Chapter 138", "Chapter 137"] },
    { id: 4, title: "Demon Slayer", cover: "/covers/demonslayer.jpg", chapters: ["Chapter 205", "Chapter 204", "Chapter 203"] },
    { id: 5, title: "My Hero Academia", cover: "/covers/mha.jpg", chapters: ["Chapter 402", "Chapter 401", "Chapter 400"] },
  ];

  const allManga = [
    ...featuredManga,
    { id: 6, title: "Dragon Ball", cover: "/covers/dragonball.jpg", chapters: ["Chapter 519", "Chapter 518", "Chapter 517"] },
    { id: 7, title: "Jujutsu Kaisen", cover: "/covers/jjk.jpg", chapters: ["Chapter 242", "Chapter 241", "Chapter 240"] },
    { id: 8, title: "Bleach", cover: "/covers/bleach.jpg", chapters: ["Chapter 686", "Chapter 685", "Chapter 684"] },
    { id: 9, title: "Hunter x Hunter", cover: "/covers/hxh.jpg", chapters: ["Chapter 400", "Chapter 399", "Chapter 398"] },
    { id: 10, title: "Tokyo Ghoul", cover: "/covers/tokyoghoul.jpg", chapters: ["Chapter 179", "Chapter 178", "Chapter 177"] },
    { id: 11, title: "Chainsaw Man", cover: "/covers/chainsawman.jpg", chapters: ["Chapter 147", "Chapter 146", "Chapter 145"] },
    { id: 12, title: "Spy x Family", cover: "/covers/spyxfamily.jpg", chapters: ["Chapter 91", "Chapter 90", "Chapter 89"] },
    { id: 13, title: "Black Clover", cover: "/covers/blackclover.jpg", chapters: ["Chapter 370", "Chapter 369", "Chapter 368"] },
    { id: 14, title: "Fairy Tail", cover: "/covers/fairytail.jpg", chapters: ["Chapter 545", "Chapter 544", "Chapter 543"] },
    { id: 15, title: "Boruto", cover: "/covers/boruto.jpg", chapters: ["Chapter 82", "Chapter 81", "Chapter 80"] },
  ];

  // ✅ state for search/sort/pagination
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("az"); // az or za
  const [page, setPage] = useState(1);
  const perPage = 12;

  // ✅ filter + sort
  const filtered = useMemo(() => {
    let data = allManga.filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "az") data.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "za") data.sort((a, b) => b.title.localeCompare(a.title));
    return data;
  }, [search, sort, allManga]);

  // ✅ pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-gray-950 ">
      {/* Header */}
      <header className="bg-purple-100 shadow-sm opacity-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Manga Reader</h1>
          <p className="text-gray-600 mt-2">Discover and read your favorite manga</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-400 mb-6">Featured Manga</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {featuredManga.map((manga) => (
              <MangaCard key={manga.id} manga={manga} featured />
            ))}
          </div>
        </section>

        {/* All Manga Section */}
        <section>
          <h2 className="text-2xl font-bold text-purple-400 mb-6 ">All Manga</h2>

          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <input
              type="text"
              placeholder="Search manga..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // reset to page 1
              }}
              className="px-3 py-2 border rounded-lg w-full md:w-1/3"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="az">Sort A → Z</option>
              <option value="za">Sort Z → A</option>
            </select>
          </div>

          {/* Manga Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {paginated.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-600 rounded disabled:opacity-50 text-white hover:bg-purple-700 transition-colors"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-600 rounded disabled:opacity-50 text-white hover:bg-purple-700 transition-colors"
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
