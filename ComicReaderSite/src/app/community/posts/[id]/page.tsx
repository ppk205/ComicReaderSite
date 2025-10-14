'use client';

import { useEffect, useState } from 'react';

type Post = { id:number; title:string; content:string; coverImage?:string|null; createdAt?:string; author?:{username?:string} };
type Comment = { id:number; content:string; author:{username?:string}; createdAt:string };

function token(){ if (typeof window==='undefined') return null; return localStorage.getItem('token'); }

async function getPost(id:string){ const r = await fetch(`/api/posts/${id}`, { cache:'no-store' }); if(!r.ok) throw new Error(await r.text()); return r.json() as Promise<Post>; }
async function getComments(id:string){ const r = await fetch(`/api/posts/${id}/comments?limit=500`, { cache:'no-store' }); if(!r.ok) throw new Error(await r.text()); return r.json() as Promise<Comment[]>; }
async function addComment(id:string, content:string){
  const r = await fetch(`/api/posts/${id}/comments`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token()?{Authorization:`Bearer ${token()}`}:{}) }, body: JSON.stringify({ content }) });
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function PostDetail({ params }:{ params:{ id:string }}) {
  const { id } = params;
  const [post,setPost] = useState<Post|null>(null);
  const [comments,setComments] = useState<Comment[]>([]);
  const [content,setContent] = useState('');
  const [err,setErr] = useState('');

  const load = async () => {
    const [p,cs] = await Promise.all([getPost(id), getComments(id)]);
    setPost(p); setComments(cs);
  };

  useEffect(()=>{ load(); },[id]);

  const submit = async () => {
    try {
      if (!token()) return setErr('Bạn cần đăng nhập.');
      setErr('');
      await addComment(id, content);
      setContent('');
      await load();
    } catch(e:any){ setErr(e.message); }
  };

  if(!post) return <p>Đang tải…</p>;
  return (
    <article className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-sm opacity-70">bởi {post.author?.username ?? '—'} • {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</p>
        {post.coverImage && <img src={post.coverImage} alt="cover" className="w-full max-h-96 object-cover rounded-md border border-neutral-800" />}
      </header>

      <div className="leading-7 whitespace-pre-wrap">{post.content}</div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Bình luận</h2>
        {err && <p className="text-red-400">{err}</p>}
        <div className="flex gap-2">
          <textarea rows={3} className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
            placeholder="Viết bình luận…" value={content} onChange={e=>setContent(e.target.value)} />
          <button className="px-4 py-2 rounded-md bg-blue-400 text-black font-semibold" onClick={submit}>Gửi</button>
        </div>
        <ul className="space-y-2">
          {comments.map(c => (
            <li key={c.id} className="rounded-md border border-neutral-800 p-3 bg-neutral-900">
              <div className="text-sm opacity-70 mb-1">{c.author?.username ?? '—'} • {new Date(c.createdAt).toLocaleString()}</div>
              <div className="whitespace-pre-wrap">{c.content}</div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
