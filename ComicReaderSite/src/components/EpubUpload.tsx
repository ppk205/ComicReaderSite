'use client';

import { useState } from 'react';

// Giả định API_BASE
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE;
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // Giới hạn upload 50MB cho mỗi file (Tùy chọn)

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
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setMessage({
          text: `File is too large. Max size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`,
          type: 'error',
        });
        setFile(null);
        return;
      }
      setFile(selectedFile);
      // Đặt tiêu đề mặc định là tên file (bỏ đuôi .epub)
      setTitle(selectedFile.name.replace(/\.epub$/i, ''));
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setMessage({ text: 'Please select a file and enter a title.', type: 'error' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('title', title);
    // Giả định backend chấp nhận form-data cho việc upload

    try {
      // Giả định endpoint API: /api/epub (POST)
      const res = await fetch(`${API_BASE}/epub`, {
        method: 'POST',
        // Next.js/Browser sẽ tự thêm Content-Type: multipart/form-data
        body: formData,
      });

      if (res.ok) {
        // Xóa form và cập nhật danh sách
        setFile(null);
        setTitle('');
        onUploadSuccess();
        setMessage({ text: 'Epub book uploaded successfully!', type: 'success' });
      } else {
        const errorData = await res.json();
        // Xử lý lỗi từ backend (ví dụ: Vượt quá 500MB)
        const errorMsg = errorData?.error || 'Failed to upload book.';
        setMessage({ text: errorMsg, type: 'error' });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage({ text: 'An unexpected error occurred during upload.', type: 'error' });
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
        <p className={`mt-4 p-3 rounded-lg text-sm font-semibold ${
          message.type === 'success'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </p>
      )}
    </form>
  );
}