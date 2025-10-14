'use client';

import { use, useEffect, useState } from 'react';

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

const API_BASE = 'http://localhost:8080/Comic/api';

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
        const [postRes, commentRes] = await Promise.all([
          fetch(`${API_BASE}/posts/${id}`, { cache: 'no-store' }),
          fetch(`${API_BASE}/comments?postId=${id}&limit=500`, { cache: 'no-store' }),
        ]);

        if (!postRes.ok) throw new Error(await postRes.text());
        if (!commentRes.ok) throw new Error(await commentRes.text());

        const postData = await postRes.json();
        const commentData = await commentRes.json();

        const safeComments = Array.isArray(commentData)
          ? commentData
          : commentData.data || commentData.comments || [];

        setPost(postData);
        setComments(safeComments);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, [id]);

  const submit = async () => {
    if (!content.trim()) return setErr('Vui lòng nhập nội dung bình luận!');
    setErr('');

    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: Number(id),
          authorId: 'admin-001',
          content,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const newComment = await res.json();
      setComments((old) => [...old, newComment]);
      setContent('');
    } catch (e: any) {
      setErr(e.message);
    }
  };

  if (!post)
    return (
      <p className="p-6 text-center text-sky-700 bg-sky-50 rounded-xl shadow-sm mt-10 font-sans">
        Đang tải bài viết...
      </p>
    );

  return (
    <main className="max-w-3xl mx-auto p-8 bg-sky-50 text-sky-900 font-sans rounded-2xl shadow-xl border border-sky-200 mt-10 space-y-8 transition-all duration-300">
      {/* Header */}
      <header className="space-y-2 border-b border-sky-200 pb-3">
        <h1 className="text-3xl font-bold text-sky-700">{post.title}</h1>
        <p className="text-sm text-sky-600">
          Tác giả:{' '}
          <span className="font-medium text-sky-800">{post.authorId ?? '—'}</span> •{' '}
          {post.createdAt && !isNaN(Date.parse(post.createdAt))
            ? new Date(post.createdAt).toLocaleString('vi-VN')
            : 'Không rõ thời gian'}
        </p>
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt="cover"
            className="w-full max-h-[400px] object-cover rounded-xl border border-sky-200 shadow-md"
          />
        )}
      </header>

      {/* Nội dung bài viết */}
      <article className="leading-relaxed text-sky-900 whitespace-pre-wrap bg-white/80 rounded-xl p-5 border border-sky-100 shadow-inner">
        {post.content || '—'}
      </article>

      {/* Bình luận */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-sky-700">💬 Bình luận</h2>

        {err && (
          <p className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-sm">
            ⚠️ {err}
          </p>
        )}

        {/* Form nhập bình luận */}
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            rows={3}
            className="flex-1 rounded-lg border border-sky-200 bg-white px-4 py-2 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
            placeholder="Viết bình luận của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            onClick={submit}
            className="shrink-0 px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-medium shadow-md transition"
          >
            Gửi
          </button>
        </div>

        {/* Danh sách bình luận */}
        <ul className="space-y-3">
          {comments.length === 0 && (
            <p className="text-sky-600 italic">Chưa có bình luận nào.</p>
          )}

          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-sky-100 bg-white p-3 shadow-sm hover:bg-sky-50 transition"
            >
              <div className="text-sm text-sky-600 mb-1">
                <span className="font-medium text-sky-800">
                  {c.authorId ?? 'Người dùng ẩn'}
                </span>{' '}
                •{' '}
                {c.createdAt && !isNaN(Date.parse(c.createdAt))
                  ? new Date(c.createdAt).toLocaleString('vi-VN')
                  : 'Không rõ thời gian'}
              </div>
              <div className="text-sky-900 whitespace-pre-wrap">{c.content}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
