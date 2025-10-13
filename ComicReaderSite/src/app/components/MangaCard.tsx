// src/components/MangaCard.tsx
export default function MangaCard({ manga, featured = false }) {
  return (
    <div className={`p-4 rounded-xl shadow-md ${featured ? "bg-purple-900" : "bg-gray-800"}`}>
      <img
        src={manga.cover}
        alt={manga.title}
        className="w-full h-48 object-cover rounded-lg"
      />
      <h3 className="text-lg font-bold text-white mt-2">{manga.title}</h3>
      <ul className="text-sm text-gray-300">
        {manga.chapters.slice(0, 3).map((ch, i) => (
          <li key={i}>{ch}</li>
        ))}
      </ul>
    </div>
  );
}
