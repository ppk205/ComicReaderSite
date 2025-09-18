interface Manga {
    coverUrl?: string;
    cover?: string;
    title: string;
    chapters?: (string | { number: number })[];
}

export default function MangaCard({
    manga,
    featured = false,
}: {
    manga: Manga;
    featured?: boolean;
}) {
    return (
        <div
            className={`bg-gray-500 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${featured ? "h-64" : "h-56"
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
                        className={`font-semibold text-white mb-2 ${featured ? "text-lg" : "text-base"
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
                                        {typeof chapter === "string"
                                            ? chapter
                                            : `Chapter ${chapter.number}`}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-400">
                                    No chapters available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
<<<<<<< HEAD
}
=======
}
>>>>>>> 0513a7d4e42677d6ab370642dedce9ec0dd33125
