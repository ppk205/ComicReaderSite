"use client";

import { useState, useMemo, useEffect } from "react";
import MangaCard from "@/components/MangaCard";
import { apiService } from "@/services/api";

type ChapterSummary = {
  id: string;
  title: string;
};

type MangaSummary = {
  id: string;
  title: string;
  cover?: string;
  coverUrl?: string;
  picture?: string;
  chapters?: ChapterSummary[];
};

export default function Home() {
  const [featuredManga, setFeaturedManga] = useState<MangaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/sort/pagination states
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("az"); // az or za
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const data = (await apiService.getMangaList()) as unknown;

        if (cancelled) {
          return;
        }

        const normaliseManga = (item: any): MangaSummary | null => {
          if (!item || (typeof item.id !== "string" && typeof item.id !== "number") || typeof item.title !== "string") {
            return null;
          }

          const chapters = Array.isArray(item.chapters)
            ? item.chapters.map((chapter: any, index: number): ChapterSummary => {
                if (typeof chapter === "string") {
                  return { id: String(index + 1), title: chapter };
                }

                if (chapter && typeof chapter === "object") {
                  const chapterId = "id" in chapter ? String(chapter.id ?? index + 1) : String(index + 1);
                  const chapterTitle = "title" in chapter ? String(chapter.title ?? chapterId) : chapterId;
                  return { id: chapterId, title: chapterTitle };
                }

                return { id: String(index + 1), title: String(chapter ?? index + 1) };
              })
            : undefined;

          const coverCandidate = [item.cover, item.coverUrl, item.picture].find(
            (value) => typeof value === "string" && value.length > 0
          );

          return {
            id: String(item.id),
            title: item.title,
            cover: coverCandidate,
            coverUrl: typeof item.coverUrl === "string" ? item.coverUrl : undefined,
            picture: typeof item.picture === "string" ? item.picture : undefined,
            chapters,
          };
        };

        if (Array.isArray(data)) {
          const normalised = data
            .map(normaliseManga)
            .filter((item): item is MangaSummary => item !== null);
          setFeaturedManga(normalised);
        } else {
          setFeaturedManga([]);
        }
        setError(null);
      } catch (err: any) {
        if (cancelled) {
          return;
        }
        setError(err?.message ?? "Unable to load manga data");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    const base = search
      ? featuredManga.filter((manga) =>
          manga.title.toLowerCase().includes(lowerSearch)
        )
      : featuredManga;

    const sorted = [...base];
    if (sort === "az") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "za") {
      sorted.sort((a, b) => b.title.localeCompare(a.title));
    }

    return sorted;
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
