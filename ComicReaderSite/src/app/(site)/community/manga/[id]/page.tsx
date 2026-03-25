'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';

type Manga = { id: number; title: string; cover?: string | null };
type Post = { id: number; title: string; content?: string };

export default function MangaPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [manga, setManga] = useState<Manga | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const list = await apiService.getPosts(`?mangaId=${id}`);
                setPosts(list);
            } catch {
                setPosts([]);
            }
        })();
    }, [id]);

    return (
        <div className="max-w-4xl mx-auto p-6 font-sans bg-[#0b0b12] text-[#f3f0ff] rounded-2xl border border-[#3b3b5c] mt-8">
            {manga && (
                <header className="border-b border-[#3b3b5c] pb-3 mb-4">
                    <h1 className="text-2xl font-bold text-[#c4b5fd]">{manga.title}</h1>
                    <Link href="/community/posts/create" className="text-[#a78bfa] hover:underline text-sm">
                        ✍️ Write a post for this manga
                    </Link>
                </header>
            )}

            <section>
                <h2 className="text-xl font-semibold text-[#c4b5fd] mb-3">Related Posts</h2>
                {posts.length === 0 && <p className="text-gray-400 italic">No posts found.</p>}
                <ul className="space-y-3">
                    {posts.map((p) => (
                        <li key={p.id} className="border border-[#3b3b5c] rounded-lg p-3 bg-[#1a1a29] hover:bg-[#252537] shadow-sm transition">
                            <Link href={`/community/posts/${p.id}`} className="font-semibold text-[#d0bfff]">
                                {p.title}
                            </Link>
                            <p className="text-sm text-gray-400 line-clamp-2">{p.content?.slice(0, 120)}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
