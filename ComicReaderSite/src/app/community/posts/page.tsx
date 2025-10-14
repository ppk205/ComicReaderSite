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

// 👇 Lưu ý: params giờ là Promise<{ id: string }>
export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  // ✅ unwrap Promise đồng bộ bằng React.use()
  const { id } = use(params);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`${API_BASE}/posts/${id}`, { cache: 'no-store' }),
          fetch(`${API_BASE}/comments?postId=${id}`, { cache: 'no-store' }),
        ]);

        if (!pRes.ok) throw new Error(await pRes.text());
        if (!cRes.ok) throw new Error(await cRes.text());

        setPost(await pRes.json());
        setComments(await cRes.json());
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
          postId: id,
          authorId: 'admin-001',
          content,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setContent('');
      const newCmt = await res.json();
      setComments((old) => [...old, newCmt]);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  if (!post) return <p className="p-4">Đang tải bài viết...</p>;

  return (
    <article className="space-y-6 p-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-sm opacity-70">
          Tác giả: {post.authorId ?? '—'} •{' '}
          {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
        </p>
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt="cover"
            className="w-full max-h-96 object-cover rounded-md border border-neutral-800"
          />
        )}
      </header>

      <div className="leading-7 whitespace-pre-wrap">{post.content}</div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bình luận</h2>
        {err && <p className="text-red-400">{err}</p>}

        <div className="flex gap-2">
          <textarea
            rows={3}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
            placeholder="Viết bình luận…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            className="px-4 py-2 rounded-md bg-blue-400 text-black font-semibold"
            onClick={submit}
          >
            Gửi
          </button>
        </div>

        <ul className="space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-neutral-800 p-3 bg-neutral-900"
            >
              <div className="text-sm opacity-70 mb-1">
                {c.authorId ?? '—'} • {new Date(c.createdAt).toLocaleString()}
              </div>
              <div className="whitespace-pre-wrap">{c.content}</div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
