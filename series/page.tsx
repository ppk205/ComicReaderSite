'use client'

import Link from "next/link";
import { useEffect, useState } from "react";

type Manga = {
  id: string;
  title: string;
  cover?: string;
};

export default function SeriesListPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8080/Comic/api/manga")
      .then((res) => res.json())
      .then((data) => setMangas(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = mangas.filter((m) =>
    m.title?.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">All Series</h1>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title..."
              className="bg-gray-800 text-white placeholder-gray-500 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Search series"
            />
            <Link href="/series" className="text-sm text-gray-300 hover:text-white">Reset</Link>
          </div>
        </header>

        <main>
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="bg-gray-800 rounded-lg h-48" />
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">No series found.</div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {filtered.map((manga) => (
                <Link
                  key={manga.id}
                  href={`/series/${manga.id}`}
                  className="group block bg-gray-800 rounded-lg overflow-hidden transform hover:scale-[1.02] transition"
                >
                  <div className="w-full h-56 bg-gray-700">
                    <img
                      src={manga.cover ?? "/cover-demo.jpg"}
                      alt={manga.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-3">
                    <h2 className="text-lg font-semibold truncate">{manga.title}</h2>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-400">Manga</span>
                      <span className="text-sm bg-yellow-400 text-gray-900 px-2 py-0.5 rounded font-semibold">Read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
