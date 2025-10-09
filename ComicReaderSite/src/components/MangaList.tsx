"use client";

import { useEffect, useState } from "react";
import MangaCard from "./MangaCard";

interface Manga {
    id: string;
    title: string;
    cover: string;
    chapters: string[];
}

export default function MangaList() {
    const [mangaList, setMangaList] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // ✅ Replace this with your actual API endpoint
        fetch("https://your-api-endpoint.com/manga")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch manga list");
                return res.json();
            })
            .then((data: Manga[]) => {
                setMangaList(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
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
