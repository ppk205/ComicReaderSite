'use client';
import {use, useEffect, useState} from 'react';
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
        (async () => {
            try {
                const p = await apiService.getPostById(Number(id));
                const c = await apiService.getComments(Number(id));
                setPost(p);
                setComments(c);
            } catch (e: any) {
                setErr(e.message);
            }
        })();
    }, [id]);

    const submit = async () => {
        if (!content.trim()) return setErr('Vui lòng nhập nội dung bình luận!');
        try {
            const newCmt = await apiService.createComment({
                postId: Number(id),
                authorId: 'admin-001',
                content,
            });
            setComments((old) => [...old, newCmt]);
            setContent('');
        } catch (e: any) {
            setErr(e.message);
        }
    };

    if (!post) return <p className="p-4">Đang tải bài viết...</p>;

    return (
        <main className="max-w-3xl mx-auto p-8 bg-sky-50 text-sky-900 rounded-2xl shadow-xl border border-sky-200 mt-10 font-sans space-y-8">
            <header className="border-b border-sky-200 pb-3">
                <h1 className="text-3xl font-bold text-sky-700">{post.title}</h1>
                <p className="text-sm text-sky-600">
                    👤 {post.authorId ?? '—'} •{' '}
                    {post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : ''}
                </p>
                {post.coverImage && (
                    <img src={post.coverImage} alt="cover" className="w-full max-h-[400px] object-cover rounded-xl mt-3" />
                )}
            </header>

            <article className="leading-relaxed whitespace-pre-wrap bg-white rounded-xl p-5 border border-sky-100 shadow-inner">
                {post.content}
            </article>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-sky-700">💬 Bình luận</h2>
                {err && <p className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-sm">⚠️ {err}</p>}
                <div className="flex flex-col sm:flex-row gap-3">
          <textarea
              rows={3}
              className="flex-1 rounded-lg border border-sky-200 bg-white px-4 py-2"
              placeholder="Viết bình luận..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
          />
                    <button
                        onClick={submit}
                        className="shrink-0 px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 text-white font-medium shadow-md transition"
                    >
                        Gửi
                    </button>
                </div>
                <ul className="space-y-3">
                    {comments.length === 0 && <p className="text-sky-600 italic">Chưa có bình luận nào.</p>}
                    {comments.map((c) => (
                        <li key={c.id} className="rounded-lg border border-sky-100 bg-white p-3 shadow-sm">
                            <div className="text-sm text-sky-600 mb-1">
                                <span className="font-medium text-sky-800">{c.authorId ?? 'Người dùng ẩn'}</span> •{' '}
                                {new Date(c.createdAt).toLocaleString('vi-VN')}
                            </div>
                            <div className="text-sky-900 whitespace-pre-wrap">{c.content}</div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
