'use client';

import { useEffect, useMemo, useState } from 'react';

interface Manga {
  id: string;
  title: string;
  // thêm fields nếu có
}

export default function SearchBar() {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ưu tiên proxy của Next: /api/manga -> http://localhost:8080/Comic/api/manga
  // (đã cấu hình trong next.config.ts)
  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || '/api/manga';

  useEffect(() => {
    const ac = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL, { signal: ac.signal, cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Manga[] = await res.json();
        setMangaList(data);
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e.message || 'Fetch failed');
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => ac.abort();
  }, [API_URL]);

  const filtered = useMemo(
    () =>
      mangaList.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [mangaList, searchTerm]
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search manga..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {searchTerm && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto z-50 shadow-md">
          {isLoading ? (
            <div className="p-4 text-gray-700">Loading...</div>
          ) : error ? (
            <div className="p-4 text-red-600">Error: {error}</div>
          ) : filtered.length > 0 ? (
            filtered.slice(0, 10).map((manga) => (
              <button
                key={manga.id}
                className="w-full text-left p-3 hover:bg-purple-100 cursor-pointer border-b last:border-b-0"
                onClick={() => (window.location.href = `/manga/${manga.id}`)}
              >
                {manga.title}
              </button>
            ))
          ) : (
            <div className="p-4 text-gray-500">No manga found</div>
          )}
        </div>
      )}
    </div>
  );
}
