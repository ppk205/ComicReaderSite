'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';
import { User } from "@/types/auth";

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
                setErr('Failed to load manga list.');
            }
        })();
    }, []);

    const submit = async () => {
        try {
            if (!title.trim()) return setErr('Title cannot be empty.');
            if (!content.trim()) return setErr('Content cannot be empty.');
            setErr('');
            setLoading(true);

            const me: User | null = await apiService.getCurrentUser();
            if (!me || !me.id) {
                alert("User not logged in or session expired");
                return;
            }

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
                authorId: me.id,
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
        <main className="max-w-4xl mx-auto p-8 bg-[#0b0b12] text-[#f3f0ff] rounded-2xl shadow-xl border border-[#3b3b5c] mt-10 font-sans space-y-8">
            <div className="flex justify-between border-b border-[#3b3b5c] pb-4">
                <h1 className="text-3xl font-extrabold text-[#c4b5fd]">✍️ Create New Post</h1>
                <button
                    onClick={() => router.back()}
                    className="border border-[#a78bfa] text-[#a78bfa] px-4 py-2 rounded-lg hover:bg-[#a78bfa]/20"
                >
                    ← Back
                </button>
            </div>

            {err && <p className="text-red-400 bg-red-900/30 border border-red-600 p-3 rounded-lg text-sm">{err}</p>}

            <label className="flex flex-col gap-2">
                <span>Manga</span>
                <select
                    value={selectedMangaId ?? ''}
                    onChange={(e) => setSelectedMangaId(Number(e.target.value) || null)}
                    className="border border-[#3b3b5c] bg-[#1a1a29] rounded-lg p-2 text-[#f3f0ff]"
                >
                    <option value="">-- Select manga --</option>
                    {mangas.map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-2">
                <span>Title</span>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border border-[#3b3b5c] bg-[#1a1a29] rounded-lg p-2 text-[#f3f0ff]"
                    placeholder="Enter title..."
                />
            </label>

            <label className="flex flex-col gap-2">
                <span>Content</span>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="border border-[#3b3b5c] bg-[#1a1a29] rounded-lg p-2 text-[#f3f0ff]"
                    rows={10}
                    placeholder="Write your post..."
                />
            </label>

            <label className="flex flex-col gap-2">
                <span>Cover Image (URL)</span>
                <input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="border border-[#3b3b5c] bg-[#1a1a29] rounded-lg p-2 text-[#f3f0ff]"
                    placeholder="https://example.com/image.jpg"
                />
            </label>

            <label className="flex flex-col gap-2">
                <span>Tags (comma separated)</span>
                <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="border border-[#3b3b5c] bg-[#1a1a29] rounded-lg p-2 text-[#f3f0ff]"
                    placeholder="e.g. action, fantasy"
                />
            </label>

            <div className="flex justify-end gap-3 border-t border-[#3b3b5c] pt-4">
                <button
                    disabled={loading}
                    onClick={submit}
                    className="rounded-lg px-5 py-2 bg-gradient-to-r from-purple-700 to-violet-500 text-white font-semibold shadow disabled:opacity-60"
                >
                    {loading ? 'Posting...' : '🚀 Publish'}
                </button>
            </div>
        </main>
    );
}
