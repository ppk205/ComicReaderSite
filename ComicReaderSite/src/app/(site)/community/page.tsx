'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';

type Post = {
    id: number;
    title: string;
    content?: string;
    coverImage?: string;
    createdAt?: string;
    authorId?: string;
};

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [err, setErr] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const list = await apiService.getPosts('?limit=50');
                setPosts(list);
            } catch (e: any) {
                console.error(e);
                setErr('Failed to load posts.');
            }
        })();
    }, []);

    return (
        <main className="max-w-6xl mx-auto p-8 bg-[#0b0b12] text-[#f3f0ff] rounded-2xl shadow-lg mt-8 border border-[#3b3b5c] font-sans">
            <div className="flex justify-between items-center mb-8 border-b border-[#3b3b5c] pb-3">
                <h1 className="text-3xl font-extrabold text-[#c4b5fd]">💬 Community</h1>
                <Link
                    href="/community/posts/create"
                    className="bg-gradient-to-r from-purple-700 to-violet-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition"
                >
                    ✍️ Create Post
                </Link>
            </div>

            {err && <p className="text-red-400 bg-red-900/30 border border-red-600 p-3 rounded-lg mb-4">⚠️ {err}</p>}

            {posts.length === 0 ? (
                <p className="text-gray-400 italic">No posts yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {posts.map((p) => (
                        <Link
                            key={p.id}
                            href={`/community/posts/${p.id}`}
                            className="group rounded-xl border border-[#3b3b5c] bg-[#1a1a29] hover:bg-[#252537] shadow-md hover:shadow-lg transition transform hover:-translate-y-1 overflow-hidden flex flex-col"
                        >
                            {p.coverImage ? (
                                <img src={p.coverImage} alt={p.title} className="h-44 w-full object-cover" />
                            ) : (
                                <div className="h-44 w-full flex items-center justify-center bg-[#2a2a3d] text-gray-400 italic">
                                    (No image)
                                </div>
                            )}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-[#d0bfff] line-clamp-2">{p.title}</h2>
                                    <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                                        {p.content ? p.content.slice(0, 100) + '…' : 'No content.'}
                                    </p>
                                </div>
                                <p className="text-xs text-[#a78bfa] mt-3">
                                    👤 {p.authorId ?? '—'} •{' '}
                                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Unknown date'}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
