'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Post = {
  id: number;
  title: string;
  content?: string;
  coverImage?: string;
  createdAt?: string;
  authorId?: string;
};

const API_BASE = 'http://localhost:8080/Comic/api';

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/posts?limit=50`, { cache: 'no-store' });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setPosts(list);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-8 bg-sky-50 text-sky-900 rounded-2xl shadow-lg mt-8 border border-sky-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-sky-200 pb-3">
        <h1 className="text-3xl font-extrabold text-sky-700 tracking-tight">🌤 Community</h1>
        <Link
          href="/community/posts/create"
          className="bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition"
        >
          ✍️ Tạo bài viết
        </Link>
      </div>

      {/* Thông báo lỗi */}
      {err && (
        <p className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
          ⚠️ {err}
        </p>
      )}

      {/* Danh sách bài viết */}
      {posts.length === 0 ? (
        <p className="text-sky-600 italic">Chưa có bài viết nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/community/posts/${p.id}`}
              className="group rounded-xl border border-sky-100 bg-white hover:bg-sky-50 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              {/* Ảnh cover */}
              {p.coverImage ? (
                <img
                  src={p.coverImage}
                  alt={p.title}
                  className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="h-44 w-full flex items-center justify-center bg-sky-100 text-sky-400 text-sm italic">
                  (Không có ảnh)
                </div>
              )}

              {/* Nội dung */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-sky-800 group-hover:text-sky-600 line-clamp-2">
                    {p.title}
                  </h2>
                  <p className="text-sm text-sky-700 mt-2 line-clamp-3 leading-relaxed">
                    {p.content
                      ? p.content.replace(/\n/g, ' ').slice(0, 100) + '…'
                      : 'Không có nội dung.'}
                  </p>
                </div>
                <p className="text-xs text-sky-500 mt-3">
                  👤 {p.authorId ?? '—'} •{' '}
                  {p.createdAt && !isNaN(Date.parse(p.createdAt))
                    ? new Date(p.createdAt).toLocaleDateString('vi-VN')
                    : 'Không rõ thời gian'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
