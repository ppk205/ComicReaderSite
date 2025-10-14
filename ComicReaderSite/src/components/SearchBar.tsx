'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Manga {
  id: string;
  title: string;
  cover?: string;
  // Add other manga properties as needed
}

export default function SearchBar() {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMangaList = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/manga");
        if (res.ok) {
          const data = await res.json();
          setMangaList(data);
        }
      } catch (err) {
        console.error("Failed to fetch manga list:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMangaList();
  }, []);

  const filteredManga = mangaList.filter((manga) =>
    manga.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search manga..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white"
      />

      {searchTerm && (
        <div className="absolute top-full left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg mt-1 max-h-60 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-gray-400">Loading...</div>
          ) : filteredManga.length > 0 ? (
            filteredManga.slice(0, 10).map((manga) => (
              <div
                key={manga.id}
                className="flex items-center gap-3 p-3 hover:bg-purple-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                onClick={() => {
                  router.push(`/series/${manga.id}`);
                  setSearchTerm(''); // Clear search after click
                }}
              >
                {manga.cover && (
                  <img
                    src={manga.cover}
                    alt={manga.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                )}
                <span className="text-white">{manga.title}</span>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-500">No manga found</div>
          )}
        </div>
      )}
    </div>
  );
}
