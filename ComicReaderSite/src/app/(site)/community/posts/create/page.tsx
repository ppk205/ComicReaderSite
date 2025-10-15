'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

type Manga = { id: number; title: string; cover?: string | null };

export default function CreatePostPage() {
    const router = useRouter();
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [selectedMangaId, setSelectedMangaId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data: any = await apiService.getMangaList();
                setMangas(Array.isArray(data) ? data : []);
            } catch {
                setErr('Không thể tải danh sách manga.');
            }
        })();
    }, []);

    const submit = async () => {
        try {
            if (!title.trim()) return setErr('Tiêu đề không được trống.');
            if (!content.trim()) return setErr('Nội dung không được trống.');
            setErr('');
            setLoading(true);

            const me = await apiService.getCurrentUser();

            const payload = {
                mangaId: selectedMangaId,
                title: title.trim(),
                content: content.trim(),
                coverImage: coverImage || null,
                tagsCsv: tags
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .join(','),
            };

            const result = await apiService.createPost(payload);
            router.push(`/community/posts/${result.id}`);
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 rounded-2xl shadow-2xl border border-gray-200 mt-10 font-sans space-y-8">
            <div className="flex justify-between border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-extrabold text-blue-600">✍️ Viết bài mới</h1>
                <button onClick={() => router.back()} className="border px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                    ← Quay lại
                </button>
            </div>

            {err && <p className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-sm">{err}</p>}

            <label className="flex flex-col gap-2">
                <span>Manga</span>
                <select
                    value={selectedMangaId ?? ''}
                    onChange={(e) => setSelectedMangaId(Number(e.target.value) || null)}
                    className="border rounded-lg p-2"
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
                <span>Tiêu đề</span>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border rounded-lg p-2"
                    placeholder="Nhập tiêu đề..."
                />
            </label>

            <label className="flex flex-col gap-2">
                <span>Nội dung</span>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="border rounded-lg p-2"
                    rows={10}
                    placeholder="Viết cảm nhận..."
                />
            </label>

            <label className="flex flex-col gap-2">
                <span>Ảnh bìa (URL)</span>
                <input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="border rounded-lg p-2"
                    placeholder="https://example.com/image.jpg"
                />
            </label>

            <label className="flex flex-col gap-2">
                <span>Tags (phẩy , cách nhau)</span>
                <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="border rounded-lg p-2"
                    placeholder="ví dụ: hành động, phiêu lưu"
                />
            </label>

            <div className="flex justify-end gap-3 border-t pt-4">
                <button
                    disabled={loading}
                    onClick={submit}
                    className="rounded-lg px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold shadow disabled:opacity-60"
                >
                    {loading ? 'Đang đăng...' : '🚀 Đăng bài viết'}
                </button>
            </div>
        </main>
    );
}
