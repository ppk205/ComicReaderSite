"use client";

import Link from "next/link";

interface Manga {
  id: string;
  title: string;
  cover?: string;
  chapters?: { id: string; title: string }[];
}

export default function MangaCard({
  manga,
  featured = false,
  noLink = false,
}: {
  manga: Manga;
  featured?: boolean;
  noLink?: boolean;
}) {
  const inner = (
    <>
      <div className="relative">
        <img
          src={manga.cover || "/placeholder.jpg"}
          alt={manga.title}
          className="w-full h-60 object-cover"
        />
      </div>
      <div className="p-3 text-center">
        <h3 className="text-lg font-semibold text-purple-300 hover:text-purple-400">
          {manga.title}
        </h3>
        {manga.chapters && (
          <p className="text-gray-400 text-sm mt-1">
            {manga.chapters.length} chapters
          </p>
        )}
      </div>
    </>
  );

  if (noLink) {
    return (
      <div
        className={`block rounded-xl overflow-hidden bg-gray-800 shadow-md transition-transform duration-200`}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/series/${manga.id}`}
      className={`block rounded-xl overflow-hidden bg-gray-800 shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200`}
    >
      {inner}
    </Link>
  );
}
