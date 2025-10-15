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
        <div className="max-w-4xl mx-auto p-6 font-sans">
            {manga && (
                <header className="border-b pb-3 mb-4">
                    <h1 className="text-2xl font-bold text-sky-700">{manga.title}</h1>
                    <Link href="/community/posts/create" className="text-sky-500 hover:underline text-sm">
                        ✍️ Viết bài cho manga này
                    </Link>
                </header>
            )}
            <section>
                <h2 className="text-xl font-semibold text-sky-700 mb-3">Bài viết liên quan</h2>
                {posts.length === 0 && <p className="text-sky-600 italic">Chưa có bài viết nào.</p>}
                <ul className="space-y-3">
                    {posts.map((p) => (
                        <li key={p.id} className="border rounded-lg p-3 bg-white hover:bg-sky-50 shadow-sm">
                            <Link href={`/community/posts/${p.id}`} className="font-semibold text-sky-800">
                                {p.title}
                            </Link>
                            <p className="text-sm text-sky-600 line-clamp-2">{p.content?.slice(0, 120)}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
