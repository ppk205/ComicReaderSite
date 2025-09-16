"use client"; // needed for hooks
import { useState, useMemo, useEffect } from "react";

const MangaCard = ({ manga, featured = false }) => (
  <div
    className={`bg-gray-500 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      featured ? "h-64" : "h-56"
    }`}
  >
    <div className="flex h-full">
      <div className={`${featured ? "w-24" : "w-20"} flex-shrink-0`}>
        <img
          src={manga.coverUrl || manga.cover}
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
            {manga.chapters && manga.chapters.length > 0 ? (
              manga.chapters.slice(0, 3).map((chapter, index) => (
                <div
                  key={index}
                  className="text-sm text-purple-300 hover:text-blue-800 cursor-pointer truncate"
                >
                  {typeof chapter === 'string' ? chapter : `Chapter ${chapter.number}`}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400">No chapters available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);


export default function Home() {
  const [featuredManga, setFeaturedManga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search/sort/pagination states
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("az"); // az or za
  const [page, setPage] = useState(1);
  const perPage = 12;

  // ✅ Base URL from env or fallback
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/Comic/api";

  // ✅ Fetch manga from backend
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}/manga`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch manga data");
        const data = await res.json();
        setFeaturedManga(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [API_BASE]);

  // ✅ filter + sort
  const filtered = useMemo(() => {
    let data = [...featuredManga];
    if (search) {
      data = data.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sort === "az") data.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "za") data.sort((a, b) => b.title.localeCompare(a.title));
    return data;
  }, [search, sort, featuredManga]);

  // ✅ pagination
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-950">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-400 mb-6">
            Featured Manga
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {featuredManga.map((manga) => (
              <MangaCard key={manga.id} manga={manga} featured />
            ))}
          </div>
        </section>

        {/* All Manga Section */}
        <section>
          <h2 className="text-2xl font-bold text-purple-400 mb-6">All Manga</h2>

          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <input
              type="text"
              placeholder="Search manga..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
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
