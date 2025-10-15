'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import EpubUpload from '@/components/EpubUpload';
import EpubCard from '@/components/EpubCard';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

interface EpubBook {
  id: number;
  title: string;
  fileName: string;
  fileSizeInBytes: number;
  uploadDate: string;
  storagePath: string;
}

const STORAGE_LIMIT_MB = 500;
const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_MB * 1024 * 1024;

export default function EpubLibraryPage() {
  const { state } = useAuth();
  const USER_ID = state.user?.id ?? null;

  const [books, setBooks] = useState<EpubBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /** Load danh sách EPUB của user hiện tại (dùng api service) */
  const fetchBooks = useCallback(async () => {
    if (!USER_ID) {
      setBooks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Hủy request cũ (nếu có) trước khi tạo cái mới
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // api.getUserEpubs tự gắn Authorization + baseURL
      const data = (await api.getUserEpubs(USER_ID)) as EpubBook[];
      if (!controller.signal.aborted) {
        setBooks(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      if (controller.signal.aborted) return;
      console.error('[EPUB] Lỗi khi tải sách:', err);
      setError(err?.message || 'Failed to load library. Please try again.');
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [USER_ID]);

  /** Gọi fetchBooks khi có user */
  useEffect(() => {
    fetchBooks();
    return () => abortRef.current?.abort();
  }, [fetchBooks]);

  /** Tính toán dung lượng đã dùng */
  const totalUsedBytes = books.reduce((sum, b) => sum + (b.fileSizeInBytes || 0), 0);
  const usedPercentage = (totalUsedBytes / STORAGE_LIMIT_BYTES) * 100;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  /** Nếu chưa đăng nhập */
  if (!USER_ID) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-3xl text-slate-800 font-bold mb-4">My Epub Library</h2>
        <p className="text-slate-600">Please sign in to view and manage your EPUB library.</p>
      </main>
    );
  }

  /** Nếu đã đăng nhập */
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-slate-900 mb-6 border-b pb-3">My Epub Library</h2>

      {/* Storage Status */}
      <div className="bg-purple-100 p-4 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Storage Status</h3>
        <p className="text-gray-700 mb-2">
          Used: {formatBytes(totalUsedBytes)} of {STORAGE_LIMIT_MB} MB
        </p>
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${usedPercentage < 80 ? 'bg-purple-600' : 'bg-red-500'}`}
            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
          />
        </div>
        {usedPercentage > 80 && (
          <p className="text-sm text-red-600 mt-2 font-medium">
            Warning: Storage is running low! ({usedPercentage.toFixed(1)}%)
          </p>
        )}
      </div>

      {/* Upload */}
      <EpubUpload userId={String(USER_ID)} onUploadSuccess={fetchBooks} />

      {/* Book List */}
      <h3 className="text-3xl font-bold text-slate-900 mt-10 mb-5">My Books ({books.length})</h3>

      {isLoading && <p className="text-center text-gray-600">Loading books...</p>}
      {!isLoading && error && <p className="text-center text-red-500">{error}</p>}
      {!isLoading && !error && books.length === 0 && (
        <p className="text-center text-gray-600">You don't have any Epub books yet. Upload one!</p>
      )}
      {!isLoading && !error && books.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <EpubCard key={book.id} book={book} onBookDeleted={fetchBooks} />
          ))}
        </div>
      )}
    </main>
  );
}
