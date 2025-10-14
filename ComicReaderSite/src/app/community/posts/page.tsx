'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Post = { id:number; title:string; excerpt?:string; author?:string; createdAt?:string };

async function api<T>(path: string) {
  const res = await fetch(`/api${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export default function PostsList() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api<Post[]>(`/posts?page=1&size=20&q=${encodeURIComponent(q)}`));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bài viết</h1>
      <div className="flex gap-2">
        <input className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
               placeholder="Tìm tiêu đề / tác giả…" value={q} onChange={e=>setQ(e.target.value)} />
        <button className="px-4 py-2 rounded-md bg-blue-400 text-black font-semibold" onClick={load}>Tìm</button>
        <Link className="px-4 py-2 rounded-md border border-neutral-700" href="/community/posts/create">Viết bài</Link>
      </div>
      {loading && <p>Đang tải…</p>}
      <ul className="space-y-3">
        {items.map(p => (
          <li key={p.id} className="rounded-lg border border-neutral-800 p-3 bg-neutral-900">
            <h3 className="font-semibold">
              <Link href={`/community/posts/${p.id}`}>{p.title}</Link>
            </h3>
            <p className="text-sm opacity-70">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
