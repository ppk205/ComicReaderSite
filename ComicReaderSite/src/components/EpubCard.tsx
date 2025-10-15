'use client';

import Link from 'next/link';
import apiService from '@/services/api';

export interface EpubBook {
  id: number;
  title: string;
  fileName: string;
  fileSizeInBytes: number;
  uploadDate: string;
}

export default function EpubCard({
  book,
  onBookDeleted,
}: {
  book: EpubBook;
  onBookDeleted: () => void;
}) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;

    try {
      await apiService.deleteEpub(book.id);
      onBookDeleted();
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(`Failed to delete book: ${err?.message || 'Unknown error'}`);
    }
  };

  const readerHref = `/reader?id=${book.id}`;

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between">
      <div>
        <h4 className="text-xl font-bold text-purple-800 mb-2 line-clamp-2">
          {book.title}
        </h4>

        <p className="text-sm text-gray-600">
          <span className="font-semibold">File Name</span>: {book.fileName}
        </p>

        <p className="text-sm text-gray-600">
          <span className="font-semibold">Size</span>: {formatBytes(book.fileSizeInBytes)}
        </p>

        <p className="text-sm text-gray-600">
          <span className="font-semibold">Uploaded</span>:{' '}
          {new Date(book.uploadDate).toLocaleDateString()}
        </p>
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
        <Link
          href={readerHref}
          className="bg-blue-500 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-blue-600 transition-colors"
        >
          Read Book
        </Link>

        <button
          onClick={handleDelete}
          className="text-red-500 text-sm font-semibold hover:text-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
