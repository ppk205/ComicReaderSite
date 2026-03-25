'use client';

import { useState } from 'react';
import apiService from '@/services/api';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export default function EpubUpload({
  userId,
  onUploadSuccess,
}: {
  userId: string;
  onUploadSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Kiểm tra kích thước
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setMessage({
        text: `File is too large. Max size is ${Math.floor(MAX_FILE_SIZE_BYTES / 1024 / 1024)} MB.`,
        type: 'error',
      });
      setFile(null);
      return;
    }

    // Kiểm tra phần mở rộng
    if (!/\.epub$/i.test(selectedFile.name)) {
      setMessage({ text: 'Please select a .epub file.', type: 'error' });
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.epub$/i, '')); // đặt tiêu đề mặc định
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setMessage({ text: 'Please select a file and enter a title.', type: 'error' });
      return;
    }

    try {
      setIsUploading(true);
      setMessage(null);

      // ✅ Dùng epubApi: tự gắn Authorization + tự resolve baseURL
      // Nếu backend cần userId trong form, method uploadEpub nên nhận tham số thứ 3.
      await (apiService as any).uploadEpub(file, title.trim(), userId);

      // Reset form
      setFile(null);
      setTitle('');
      onUploadSuccess();
      setMessage({ text: 'Epub book uploaded successfully!', type: 'success' });
    } catch (err: any) {
      console.error('Upload failed:', err);
      const msg = err?.message || 'Failed to upload book.';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-purple-50 p-6 rounded-lg shadow-inner border border-purple-200 mb-8"
    >
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">Upload New Epub</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* File Input */}
        <div>
          <label htmlFor="epubFile" className="block text-gray-700 font-medium mb-1">
            Choose Epub File (.epub)
          </label>
          <input
            id="epubFile"
            type="file"
            accept=".epub"
            onChange={handleFileChange}
            className="w-full text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white"
            disabled={isUploading}
          />
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title"
            className="w-full border border-gray-300 rounded-lg p-2 text-gray-900"
            required
            disabled={isUploading}
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 h-10"
            disabled={isUploading || !file}
          >
            {isUploading ? 'Uploading...' : 'Upload Book'}
          </button>
        </div>
      </div>

      {/* Message Area */}
      {message && (
        <p
          className={`mt-4 p-3 rounded-lg text-sm font-semibold ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
