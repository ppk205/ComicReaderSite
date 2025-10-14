'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type Manga = { id: number; title: string; cover?: string | null };

export default function CommunityHome() {
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<Manga[]>('/manga');
        setManga(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
        </div>
        <Link
          href="/community/posts/create"
          className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
        >
          ✍️ Tạo bài viết
        </Link>
      </header>

      <div>
        <h2 className="text-xl font-semibold mb-3">Manga mới</h2>
        {loading && <p>Đang tải…</p>}
        <ul className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {manga.map((m) => (
            <li key={m.id} className="card">
              {m.cover && (
                <img src={m.cover} className="cover" alt={m.title} />
              )}
              <h3 className="mt-2 font-semibold">
                <Link href={`/community/manga/${m.id}`}>{m.title}</Link>
              </h3>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
