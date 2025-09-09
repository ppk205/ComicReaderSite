'use client';

import { useState, useEffect } from 'react';

interface Manga {
  id: string;
  title: string;
  // Add other manga properties as needed
}

export default function SearchBar() {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredManga = mangaList.filter(manga =>
    manga.title.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="absolute top-full left-0 right-0 bg-black border border-black-300 rounded-lg mt-1 max-h-60 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-black">Loading...</div>
          ) : filteredManga.length > 0 ? (
            filteredManga.slice(0, 10).map((manga) => (
              <div
                key={manga.id}
                className="p-3 hover:bg-purple-300 cursor-pointer border-b last:border-b-0"
                onClick={() => {
                  // Handle manga selection
                  window.location.href = `/manga/${manga.id}`;
                }}
              >
                {manga.title}
              </div>
            ))
          ) : (
            <div className="p-4 text-black-500">No manga found</div>
          )}
        </div>
      )}
    </div>
  );
}