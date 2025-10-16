'use client';
import { use, useEffect, useState } from 'react';
import { apiService } from '@/services/api';

type Post = {
    id: number;
    title: string;
    content?: string;
    coverImage?: string;
    createdAt?: string;
    authorId?: string;
};

type Comment = {
    id: number;
    content: string;
    authorId?: string;
    createdAt: string;
};

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState('');
    const [err, setErr] = useState('');

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const postData = await apiService.getPostById(Number(id));
                const commentData = await apiService.getComments(Number(id));
                setPost(postData);
                setComments(Array.isArray(commentData) ? commentData : []);
            } catch (e: any) {
                setErr(e.message);
            }
        })();
    }, [id]);

    const submit = async () => {
        if (!content.trim()) return setErr('Please enter a comment!');
        setErr('');
        try {
            const newCmt = await apiService.createComment({
                postId: Number(id),
                authorId: 'annonymous',
                content,
            });
            setComments((old) => [...old, newCmt]);
            setContent('');
        } catch (e: any) {
            setErr(e.message);
        }
    };

    if (!post) return <p className="p-4 text-[#f3f0ff]">Loading post...</p>;

    return (
        <main className="max-w-3xl mx-auto p-8 bg-[#0b0b12] text-[#f3f0ff] rounded-2xl shadow-xl border border-[#3b3b5c] mt-10 font-sans space-y-8">
            <header className="border-b border-[#3b3b5c] pb-3 flex flex-col gap-3">
                <button
                    onClick={() => window.history.back()}
                    className="self-start px-4 py-2 rounded-lg border border-[#a78bfa] text-[#a78bfa] hover:bg-[#a78bfa]/20 transition"
                >
                    ← Back
                </button>

                <h1 className="text-3xl font-bold text-[#c4b5fd]">{post.title}</h1>
                <p className="text-sm text-[#a78bfa]">
                    👤 {post.authorId ?? '—'} •{' '}
                    {post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : ''}
                </p>
                {post.coverImage && (
                    <img
                        src={post.coverImage}
                        alt="cover"
                        className="w-full max-h-[400px] object-cover rounded-xl mt-3 border border-[#3b3b5c] shadow-md"
                    />
                )}
            </header>

            <article className="leading-relaxed whitespace-pre-wrap bg-[#1a1a29] rounded-xl p-5 border border-[#3b3b5c] shadow-inner">
                {post.content}
            </article>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#c4b5fd]">💬 Comments</h2>
                {err && (
                    <p className="text-red-400 bg-red-900/30 border border-red-600 p-3 rounded-lg text-sm">
                        ⚠️ {err}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
          <textarea
              rows={3}
              className="flex-1 rounded-lg border border-[#3b3b5c] bg-[#1a1a29] px-4 py-2 text-[#f3f0ff] placeholder-gray-400"
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
          />
                    <button
                        onClick={submit}
                        className="shrink-0 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-violet-500 text-white font-medium shadow-md hover:opacity-90 transition"
                    >
                        Send
                    </button>
                </div>

                <ul className="space-y-3">
                    {comments.length === 0 && <p className="text-gray-400 italic">No comments yet.</p>}
                    {comments.map((c) => (
                        <li
                            key={c.id}
                            className="rounded-lg border border-[#3b3b5c] bg-[#1a1a29] p-3 shadow-sm hover:bg-[#252537] transition"
                        >
                            <div className="text-sm text-[#a78bfa] mb-1">
                                <span className="font-medium text-[#c4b5fd]">{c.authorId ?? 'Anonymous'}</span>{' '}
                                • {new Date(c.createdAt).toLocaleString('vi-VN')}
                            </div>
                            <div className="text-[#f3f0ff] whitespace-pre-wrap">{c.content}</div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
