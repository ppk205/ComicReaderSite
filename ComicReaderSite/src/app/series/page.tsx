'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Manga {
  id: string;
  title: string;
  cover: string;
  author: string;
  genre: string;
  status: string;
  rating: number;
  views: number;
  description: string;
  chapters: any[];
  totalChapters: number;
}

export default function SeriesPage() {
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'views' | 'latest'>('title');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const genres = ['All', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Slice of Life', 'Mystery'];
  const statuses = ['All', 'Ongoing', 'Completed', 'Hiatus'];

  useEffect(() => {
    fetchManga();
  }, []);

  const fetchManga = async () => {
    try {
      const res = await fetch('http://localhost:8080/Comic/api/manga', {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch manga data');
      const data = await res.json();
      setManga(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort manga
  const filteredManga = useMemo(() => {
    let filtered = [...manga];

    // Search filter
    if (search) {
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.author?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(m =>
        m.genre?.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(m =>
        m.status?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    // Sort
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'latest':
        filtered.reverse();
        break;
    }

    return filtered;
  }, [manga, search, selectedGenre, selectedStatus, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredManga.length / itemsPerPage);
  const paginatedManga = filteredManga.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading series...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Browse Series</h1>
          <p className="text-purple-200">Explore {filteredManga.length} manga series</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title or author..."
              className="w-full bg-white/10 backdrop-blur-sm border border-purple-300/30 rounded-xl px-12 py-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-300/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => {
                  setSelectedGenre(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre.toLowerCase()} className="bg-gray-800">
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
              >
                {statuses.map(status => (
                  <option key={status} value={status.toLowerCase()} className="bg-gray-800">
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
              >
                <option value="title" className="bg-gray-800">Title (A-Z)</option>
                <option value="rating" className="bg-gray-800">Highest Rated</option>
                <option value="views" className="bg-gray-800">Most Popular</option>
                <option value="latest" className="bg-gray-800">Latest Updates</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">View Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    viewMode === 'grid'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    viewMode === 'list'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-purple-200">
          Showing {paginatedManga.length} of {filteredManga.length} series
        </div>

        {/* Manga Grid/List */}
        {paginatedManga.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-purple-300 text-xl mb-2">No series found</div>
            <div className="text-purple-400">Try adjusting your filters</div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {paginatedManga.map((item) => (
              <Link
                key={item.id}
                href={`/comics/${item.id}`}
                className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-300/20 hover:border-purple-300/50 transition hover:transform hover:scale-105"
              >
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=No+Cover';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white text-lg mb-1 line-clamp-2 group-hover:text-purple-300 transition">
                    {item.title}
                  </h3>
                  <div className="text-purple-300 text-sm mb-2">{item.author || 'Unknown Author'}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-200">
                      ⭐ {item.rating?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-purple-200">
                      👁 {item.views || 0}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'ongoing' ? 'bg-green-500/20 text-green-300' :
                      item.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {item.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {paginatedManga.map((item) => (
              <Link
                key={item.id}
                href={`/comics/${item.id}`}
                className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-300/20 hover:border-purple-300/50 transition flex"
              >
                <div className="w-32 h-48 flex-shrink-0 overflow-hidden">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150x200/8B5CF6/FFFFFF?text=No+Cover';
                    }}
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white text-xl mb-1 group-hover:text-purple-300 transition">
                        {item.title}
                      </h3>
                      <div className="text-purple-300 text-sm mb-2">by {item.author || 'Unknown Author'}</div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      item.status === 'ongoing' ? 'bg-green-500/20 text-green-300' :
                      item.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {item.status || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-purple-200 text-sm mb-3 line-clamp-2">
                    {item.description || 'No description available.'}
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-purple-200">
                      ⭐ {item.rating?.toFixed(1) || 'N/A'} Rating
                    </span>
                    <span className="text-purple-200">
                      👁 {item.views || 0} Views
                    </span>
                    <span className="text-purple-200">
                      📖 {item.totalChapters || 0} Chapters
                    </span>
                    {item.genre && (
                      <span className="text-purple-200">
                        🏷 {item.genre}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === pageNum
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

