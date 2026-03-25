'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Book, Rendition, Location } from 'epubjs';
import apiService from '@/services/api';

const NAV_HEIGHT = 72;     // header
const CONTROL_BAR = 42;    // thanh Prev/Next

// ===== Utils =====
interface SpineItem {
  index: number;
  href: string;
  idref: string;
  props: string;
}

const isCoverItem = (x: SpineItem) => {
  const href = String(x.href || '').toLowerCase();
const idref = String(x.idref || '').toLowerCase();

// ép props thành string để tránh crash
const propsValue = Array.isArray(x.props)
  ? x.props.join(' ')
  : typeof x.props === 'object'
    ? JSON.stringify(x.props)
    : String(x.props || '');

const props = propsValue.toLowerCase();
  return (
    href.includes('cover') ||
    idref.includes('cover') ||
    props.includes('cover') ||
    href.endsWith('cover.xhtml') ||
    href.endsWith('cover.html')
  );
};

// Sửa layout trong iframe của epub.js
function applySafeFixes(doc: Document) {
  doc.documentElement.style.margin = '0';
  doc.documentElement.style.padding = '0';
  doc.body.style.margin = '0';
  doc.body.style.padding = '0';

  doc.querySelectorAll<HTMLElement>('img, image, svg, canvas').forEach((el) => {
    el.style.maxWidth = '100%';
    el.style.height = 'auto';
    el.style.display = 'block';
    el.style.margin = '0 auto';
  });

  doc.querySelectorAll<HTMLElement>('p, li, h1,h2,h3,h4,h5,h6,blockquote').forEach((el) => {
    el.style.overflowWrap = 'anywhere';
    el.style.wordBreak = 'break-word';
  });
}

/* ---------------------- NEW: tách phần reader vào component con ---------------------- */
function ReaderInner() {
  const params = useSearchParams();
  const bookId = params.get('id');

  // Refs
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const bookRef = useRef<Book | null>(null);

  const spineRef = useRef<SpineItem[]>([]);
  const coverIdxRef = useRef<number | null>(null);
  const firstNonCoverIdxRef = useRef<number | null>(null);
  const curIdxRef = useRef<number | null>(null);
  const skipCoverOnceRef = useRef<boolean>(false);

  // State
  const [bookTitle, setBookTitle] = useState<string>('Loading EPUB...');
  const [msg, setMsg] = useState<string>('Loading...');
  const [isReady, setIsReady] = useState<boolean>(false);

  // NEXT
  const handleNext = useCallback(async () => {
    const r = renditionRef.current;
    if (!r) return;

    const cur = curIdxRef.current ?? 0;
    const cover = coverIdxRef.current;
    const first = firstNonCoverIdxRef.current ?? 0;
    const items = spineRef.current;

    if (skipCoverOnceRef.current && cover !== null && cur === cover && first > cover) {
      skipCoverOnceRef.current = false;
      await r.display(items[first].href);
      curIdxRef.current = first;
      return;
    }

    await r.next();
  }, []);

  // PREV
  const handlePrev = useCallback(async () => {
    const r = renditionRef.current;
    if (!r) return;
    await r.prev();
  }, []);

  // MAIN
  useEffect(() => {
    setIsReady(false);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    (async () => {
      try {
        if (!bookId) throw new Error('Missing ?id');
        if (!viewerRef.current) throw new Error('Viewer not mounted');

        const viewer = viewerRef.current;
        viewer.innerHTML = '';
        viewer.style.padding = '20px 32px';
        viewer.style.background = '#000';
        viewer.style.overflow = 'hidden';

        // dùng epubApi để lấy ArrayBuffer EPUB
        const ab = await apiService.getEpubFileArrayBuffer(bookId);

        const ePub = (await import('epubjs')).default;
        const book = ePub(ab) as Book;
        bookRef.current = book;
        await book.ready;

        // Render EPUB
        const rendition = book.renderTo(viewer, {
          width: '100%',
          height: `calc(100vh - ${NAV_HEIGHT + CONTROL_BAR}px)`,
          flow: 'paginated',
          spread: 'none',
          manager: 'default',
          allowScriptedContent: true,
          minSpreadWidth: 99999,
        });
        rendition.spread('none');
        renditionRef.current = rendition;

        // Theme
        rendition.themes.default({
          'html, body': {
            margin: '0 !important',
            padding: '0 !important',
            background: '#111',
            color: '#fff',
            'box-sizing': 'border-box',
          },
          '*': { 'box-sizing': 'border-box' },
        });

        // Chuẩn bị spine items
        const items: SpineItem[] = [];
        const spine = book.spine as any;

        if (spine && typeof spine.each === 'function') {
          spine.each((it: any, i: number) => {
            items.push({
              index: i,
              href: it?.href ?? '',
              idref: it?.idref ?? '',
              props: it?.props ?? it?.properties ?? '',
            });
          });
        }

        // Gộp cover nếu có
        const firstCover = items.find(isCoverItem);
        const secondCover = items.find((x, i) => i > (firstCover?.index ?? 0) && isCoverItem(x));
        const firstNon =
          items.find(
            (x, i) => i > (secondCover?.index ?? (firstCover?.index ?? -1)) && !isCoverItem(x)
          ) || items[0];

        coverIdxRef.current = firstCover?.index ?? null;
        firstNonCoverIdxRef.current = firstNon.index;
        spineRef.current = items;

        // Hiển thị cover hoặc nội dung đầu tiên
        const startIdx = coverIdxRef.current ?? firstNonCoverIdxRef.current ?? 0;
        await rendition.display(items[startIdx]?.href);
        curIdxRef.current = startIdx;
        skipCoverOnceRef.current = coverIdxRef.current !== null && startIdx === coverIdxRef.current;

        // Mỗi khi hiển thị page → fix layout
        rendition.on('displayed', (view: any) => {
          const doc =
            (view)?.document ||
            (view)?.contents?.document ||
            null;
          if (doc) applySafeFixes(doc as Document);
        });

        // Cập nhật index hiện tại
        rendition.on('relocated', (loc: Location) => {
          curIdxRef.current = loc?.start?.index ?? 0;
        });

        document.addEventListener('keydown', onKey);

        setBookTitle(book.packaging?.metadata?.title || `Book ID: ${bookId}`);
        setMsg('Ready');
        setIsReady(true);
      } catch (e: any) {
        console.error('[Reader] error:', e);
        setMsg(e?.message || 'Error');
        setIsReady(false);
      }
    })();

    return () => {
      document.removeEventListener('keydown', onKey);
      try { renditionRef.current?.destroy(); } catch {}
      try { bookRef.current?.destroy(); } catch {}
      if (viewerRef.current) viewerRef.current.innerHTML = '';
    };
  }, [bookId, handleNext, handlePrev]);

  // UI
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* Thanh điều khiển */}
      <div
        style={{
          height: CONTROL_BAR,
          lineHeight: `${CONTROL_BAR}px`,
          padding: '0 12px',
          borderBottom: '1px solid #333',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#111',
        }}
      >
        <span style={{ opacity: 0.8, marginRight: 8 }}>Reading:</span>
        <strong style={{ marginLeft: 6 }}>{bookTitle}</strong>
        <span style={{ float: 'right' }}>
          <button onClick={handlePrev} style={{ marginRight: 8 }} disabled={!isReady}>
            ◀ Prev
          </button>
          <button onClick={handleNext} disabled={!isReady}>
            Next ▶
          </button>
        </span>
      </div>

      {/* Viewer */}
      <div
        ref={viewerRef}
        id="epub-viewer"
        style={{
          height: `calc(100vh - ${NAV_HEIGHT + CONTROL_BAR}px) + 54px`,
          background: '#000',
        }}
      />

      {msg && (
        <div
          style={{
            position: 'fixed',
            left: 12,
            bottom: 12,
            opacity: 0.9,
            fontSize: 13,
          }}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
/* ------------------------------------------------------------------------------------ */

// Giữ tên export mặc định `ReaderPage`, chỉ bọc Suspense bên ngoài:
export default function ReaderPage() {
  return (
    <Suspense fallback={<div>Loading reader...</div>}>
      <ReaderInner />
    </Suspense>
  );
}
