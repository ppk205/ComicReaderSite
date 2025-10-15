'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/apiService'; // ⚙️ đường dẫn đến file bạn gửi
// nếu khác thư mục, bạn chỉ cần chỉnh lại import tương ứng

type Manga = {
  id: number;
  title: string;
  cover?: string;
};

export default function CreatePostPage() {
  const router = useRouter();

  const [mangas, setMangas] = useState<Manga[]>([]);
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // 🟢 Lấy danh sách manga
  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getMangaList();
        const list = Array.isArray(data) ? data : data.data || [];
        setMangas(list);
      } catch (e: any) {
        console.error(e);
        setErr('Không thể tải danh sách manga.');
      }
    })();
  }, []);

  // 🟢 Khi chọn manga, tự lấy ảnh bìa
  const handleMangaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mangaId = e.target.value;
    if (!mangaId) {
      setSelectedManga(null);
      setCoverImage('');
      return;
    }
    const manga = mangas.find((m) => String(m.id) === mangaId) || null;
    setSelectedManga(manga);
    if (manga?.cover) setCoverImage(manga.cover);
  };

  // 🟢 Gửi bài viết
  const submit = async () => {
    try {
      if (!title.trim()) return setErr('Tiêu đề không được trống.');
      if (!content.trim()) return setErr('Nội dung không được trống.');

      setErr('');
      setLoading(true);

      // ✅ Lấy user hiện tại qua API (tự gửi token)
      const currentUser = await apiService.getCurrentUser();
      if (!currentUser?.id) throw new Error('Bạn cần đăng nhập trước khi đăng bài.');

      const payload = {
        mangaId: selectedManga ? Number(selectedManga.id) : null,
        title: title.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || selectedManga?.cover || null,
        tags: tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        authorId: currentUser.id, // 🧠 user thật từ token
      };

      // ✅ Gửi bài viết đến backend (POST /api/posts)
      const result = await apiService['request']('/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      router.push(`/community/posts/${result.id}`);
    } catch (e: any) {
      setErr(e.message || 'Có lỗi xảy ra khi đăng bài.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="font-sans max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 rounded-2xl shadow-2xl border border-gray-200 mt-10 space-y-8 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold text-blue-600 flex items-center gap-2">
          ✍️ Viết bài mới
        </h1>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
        >
          ← Quay lại
        </button>
      </div>

      {err && (
        <p className="text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg text-sm shadow-sm">
          ⚠️ {err}
        </p>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Manga</span>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
            value={selectedManga?.id || ''}
            onChange={handleMangaChange}
          >
            <option value="">-- Chọn manga --</option>
            {mangas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Tiêu đề</span>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề..."
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Ảnh bìa (URL, tùy chọn)</span>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Dán URL ảnh bìa (hoặc để trống để dùng ảnh manga)"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Tags (phẩy , cách nhau)</span>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ví dụ: hành động, phiêu lưu, hài hước"
          />
        </label>
      </div>

      {/* Preview cover */}
      {(coverImage || selectedManga?.cover) && (
        <div className="rounded-xl border border-gray-300 bg-white shadow-md overflow-hidden">
          <img
            src={coverImage || selectedManga?.cover}
            alt="preview"
            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Nội dung */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Nội dung</label>
        <textarea
          rows={10}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 leading-relaxed shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết cảm nhận, review hoặc chia sẻ của bạn..."
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-600 transition"
        >
          Hủy
        </button>
        <button
          disabled={loading}
          onClick={submit}
          className="rounded-lg px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-500 transition disabled:opacity-60"
        >
          {loading ? 'Đang đăng...' : '🚀 Đăng bài viết'}
        </button>
      </div>
    </main>
  );
}
