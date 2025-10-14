'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Manga = { id:number; title:string; cover?:string|null };
type Post  = { id:number; title:string; excerpt?:string };

async function api<T>(path:string){ const r=await fetch(`/api${path}`, { cache:'no-store' }); if(!r.ok) throw new Error(await r.text()); return r.json() as Promise<T>; }

export default function MangaPage({ params }:{ params:{ id:string }}) {
  const { id } = params;
  const [manga,setManga] = useState<Manga|null>(null);
  const [posts,setPosts] = useState<Post[]>([]);

  useEffect(()=>{
    (async()=>{
      const [m,p] = await Promise.all([
        api<Manga>(`/manga/${id}`),
        api<Post[]>(`/posts?page=1&size=20&mangaId=${id}`),
      ]);
      setManga(m); setPosts(p);
    })();
  },[id]);

  if(!manga) return <p>Đang tải…</p>;
  return (
    <div className="space-y-5">
      <header className="rounded-lg border border-neutral-800 p-3 bg-neutral-900">
        <div className="flex gap-3 items-center">
          {manga.cover && <img src={manga.cover} alt={manga.title} className="w-28 h-28 object-cover rounded-md border border-neutral-800" />}
          <div>
            <h1 className="text-2xl font-bold">{manga.title}</h1>
            <Link className="text-blue-400 text-sm" href={`/community/posts/create`}>Viết bài cho manga này</Link>
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">Bài viết liên quan</h2>
        <ul className="space-y-3">
          {posts.map(p=>(
            <li key={p.id} className="rounded-lg border border-neutral-800 p-3 bg-neutral-900">
              <h3 className="font-semibold"><Link href={`/community/posts/${p.id}`}>{p.title}</Link></h3>
              <p className="text-sm opacity-70">{p.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
