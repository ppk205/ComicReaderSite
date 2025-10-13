"use client";

import { useState, useMemo, useEffect } from "react";
import MangaCard from "@/components/MangaCard";

export default function Home() {
  const [featuredManga, setFeaturedManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/sort/pagination states
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("az"); // az or za
  const [page, setPage] = useState(1);
  const perPage = 12;

  // ✅ Base URL from env or fallback
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

  // ✅ Fetch manga from backend
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:8080/api/manga", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch manga data");
        const data = await res.json();
        setFeaturedManga(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
            {featuredManga.slice(0, 5).map((manga) => (
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
            <label htmlFor="sort-select" className="sr-only">
              Sort manga
            </label>
            <select
              id="sort-select"
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
