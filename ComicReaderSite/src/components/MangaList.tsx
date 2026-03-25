"use client";

import { useEffect, useState } from "react";
import MangaCard from "./MangaCard";
import { apiService } from "@/services/api";

interface Manga {
    id: string;
    title: string;
    cover: string;
    chapters: { id: string; title: string }[];
}

export default function MangaList() {
    const [mangaList, setMangaList] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchManga = async () => {
            setLoading(true);
            try {
                const data = await apiService.getMangaList();
                if (cancelled) {
                    return;
                }

                if (Array.isArray(data)) {
                    setMangaList(
                        data.map((item: any) => ({
                            id: String(item.id),
                            title: String(item.title ?? "Untitled"),
                            cover: typeof item.cover === "string" ? item.cover : "",
                            chapters: Array.isArray(item.chapters)
                                ? item.chapters.map((chapter: any, index: number) => ({
                                      id: String(chapter?.id ?? index + 1),
                                      title: String(chapter?.title ?? chapter ?? index + 1),
                                  }))
                                : [],
                        }))
                    );
                } else {
                    setMangaList([]);
                }
                setError(null);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message ?? "Failed to fetch manga list");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchManga();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) return <p className="text-white">Loading manga...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
            {mangaList.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
            ))}
        </div>
    );
}
