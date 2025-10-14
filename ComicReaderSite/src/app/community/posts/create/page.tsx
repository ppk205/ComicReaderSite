'use client';

import { useEffect, useState } from 'react';

type Manga = { id:number; title:string };

function token() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
async function postApi(path: string, body: any) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function CreatePost() {
  const [list, setList] = useState<Manga[]>([]);
  const [mangaId, setMangaId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [coverImage, setCover] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const m = await fetch('/api/manga', { cache: 'no-store' }).then(r => r.json());
      setList(m);
    })();
  }, []);

  const submit = async () => {
    try {
      //if (!token()) return setErr('Bạn cần đăng nhập.');
      //if (!mangaId) return setErr('Hãy chọn manga.');
      if (!title.trim()) return setErr('Tiêu đề không được trống.');
      setErr('');
      setSaving(true);
      const { id } = await postApi('/posts', {
        mangaId: Number(mangaId),
        title: title.trim(),
        content,
        coverImage: coverImage.trim() || undefined,
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      });
      location.href = `/community/posts/${id}`;
    } catch (e: any) {
      setErr(e.message || 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  // shared styles
  const input =
    'w-full rounded-lg border border-neutral-300/20 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50';
  const label = 'text-xs font-medium text-neutral-400';
  const card = 'rounded-xl border border-neutral-700/40 bg-neutral-900/60 shadow-sm';

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Viết bài</h1>
        <p className="text-sm text-gray-500">Chia sẻ cảm nhận của bạn về manga.</p>
      </div>
  
      {err && (
        <div className="rounded-lg border border-red-400 bg-red-100 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
  
      <div className="rounded-xl border border-gray-200 bg-white shadow-md">
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-gray-600">Manga</span>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={mangaId}
              onChange={e => setMangaId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">-- Chọn manga --</option>
              {list.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>
  
          <label className="grid gap-1">
            <span className="text-xs font-medium text-gray-600">Tiêu đề</span>  
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </label>
  
          <label className="grid gap-1">
            <span className="text-xs font-medium text-gray-600">Ảnh bìa (URL, tùy chọn)</span>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={coverImage}
              onChange={e => setCover(e.target.value)}
            />
          </label>
  
          <label className="grid gap-1">
            <span className="text-xs font-medium text-gray-600">Tags (phẩy , cách nhau)</span>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </label>
        </div>
  
        <div className="border-t border-gray-200 p-4">
          <label className="grid gap-2">
            <span className="text-xs font-medium text-gray-600">Nội dung</span>
            <textarea
              rows={10}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-6 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Viết cảm nhận, review, thảo luận..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </label>
        </div>
  
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={() => history.back()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            type="button"
          >
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {saving ? 'Đang đăng…' : 'Đăng bài'}
          </button>
        </div>
      </div>
    </div>
  );
              }
