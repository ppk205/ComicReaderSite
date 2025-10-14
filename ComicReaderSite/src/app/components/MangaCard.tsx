// src/app/components/MangaCard.tsx
import React from "react";

type Manga = {
  cover: string;
  title: string;
  chapters: string[]; // hoặc đổi sang { id: string|number; name: string }[]
};

type MangaCardProps = {
  manga: Manga;
  featured?: boolean;
};

export default function MangaCard({ manga, featured = false }: MangaCardProps) {
  return (
    <div className={`p-4 rounded-xl shadow-md ${featured ? "bg-purple-900" : "bg-gray-800"}`}>
      <img
        src={manga.cover}
        alt={manga.title}
        className="w-full h-48 object-cover rounded-lg"
      />
      <h3 className="text-lg font-bold text-white mt-2">{manga.title}</h3>
      <ul className="text-sm text-gray-300">
        {manga.chapters.slice(0, 3).map((ch: string, i: number) => (
          <li key={i}>{ch}</li>
        ))}
      </ul>
    </div>
  );
}
