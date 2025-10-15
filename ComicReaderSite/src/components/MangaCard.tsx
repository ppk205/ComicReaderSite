"use client";

import Link from "next/link";
// apiService removed from this component; bookmark removal handled elsewhere if needed

interface Manga {
  id: string;
  title: string;
  cover?: string;
  chapters?: { id: string; title: string }[];
}

interface BookmarkInfo {
  bookmarkId?: number | string;
  bookmarked?: boolean;
  currentChapter?: number | null;
  totalChapters?: number | null;
  readingProgress?: number | null; // 0..1 or 0..100 depending on app
  createdAt?: string | null; // ISO date string
  updatedAt?: string | null; // ISO date string
}

export default function MangaCard({
  manga,
  featured = false,
  bookmark,
}: {
  manga: Manga;
  featured?: boolean;
  bookmark?: BookmarkInfo;
}) {
  const progressPercent =
    bookmark && bookmark.readingProgress != null
      ? bookmark.readingProgress > 1
        ? bookmark.readingProgress
        : bookmark.readingProgress * 100
      : null;

  const hasChapter = bookmark && bookmark.currentChapter != null;

  const href = hasChapter
    ? `/series/${manga.id}/${bookmark.currentChapter}`
    : `/series/${manga.id}`;

  // removal handled at parent level; UI remove button removed per request

  return (
    <Link
      href={href}
      className={`block rounded-xl overflow-hidden bg-gray-800 shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200`}
    >
      <div className="relative">
        <img
          src={manga.cover || "/placeholder.jpg"}
          alt={manga.title}
          className="w-full h-72 object-cover"
        />
        {bookmark && (
          <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
            <span className="bg-white/10 text-white px-2 py-1 rounded text-sm">
              {bookmark.bookmarked ? "Bookmarked 💜" : ""}
            </span>
            {hasChapter ? (
              <span className="bg-yellow-600 text-black px-2 py-0.5 rounded text-xs">
                Resume • Chapter {bookmark.currentChapter}
              </span>
            ) : null}

            {/* remove button intentionally omitted */}
          </div>
        )}
      </div>

      <div className="p-4 min-h-[150px] flex flex-col justify-between">
        <h3 className="text-lg font-semibold text-purple-300 hover:text-purple-400 leading-tight break-words">
          {manga.title}
        </h3>

        {bookmark ? (
          <div className="mt-3 text-sm text-gray-300">
            {/* Stats row: total chapters, read count, percent */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <div>
                Total:{" "}
                {bookmark.totalChapters != null ? bookmark.totalChapters : "?"}
              </div>
              <div>
                Read:{" "}
                {bookmark.currentChapter != null
                  ? bookmark.currentChapter
                  : "?"}
              </div>
              <div>
                {(() => {
                  let percent: string | null = null;
                  if (bookmark.readingProgress != null) {
                    const p =
                      bookmark.readingProgress > 1
                        ? bookmark.readingProgress
                        : bookmark.readingProgress * 100;
                    percent = `${Math.round(Math.max(0, Math.min(100, p)))}%`;
                  } else if (
                    bookmark.currentChapter != null &&
                    bookmark.totalChapters != null &&
                    bookmark.totalChapters > 0
                  ) {
                    percent = `${Math.round(
                      Math.max(
                        0,
                        Math.min(
                          100,
                          (bookmark.currentChapter / bookmark.totalChapters) *
                            100
                        )
                      )
                    )}%`;
                  }
                  return percent != null
                    ? `Progress: ${percent}`
                    : "Progress: ?";
                })()}
              </div>
            </div>
            <div className="flex items-center">
              <div className="break-words">
                Chapter Progress {bookmark.currentChapter ?? "?"}
                {bookmark.totalChapters != null
                  ? ` / ${bookmark.totalChapters}`
                  : ""}
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded h-2 my-3 overflow-hidden">
              <div
                className="h-full bg-yellow-400"
                style={{
                  width:
                    progressPercent != null
                      ? `${Math.max(0, Math.min(100, progressPercent))}%`
                      : "0%",
                }}
              />
            </div>

            {/* timestamps removed per requirement */}
          </div>
        ) : (
          manga.chapters && (
            <p className="text-gray-400 text-sm mt-2">
              {manga.chapters?.length ?? 0} chapters
            </p>
          )
        )}
      </div>
    </Link>
  );
}
