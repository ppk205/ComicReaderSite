"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Manga {
  id: string;
  title: string;
  cover: string;
  chapters: string[];
}

export default function MangaManagement() {
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingManga, setEditingManga] = useState<Manga | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    cover: '',
    chapters: ''
  });

  useEffect(() => {
    fetchManga();
  }, []);

  const fetchManga = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/manga');
      const data = await response.json();
      setManga(data);
    } catch (error) {
      console.error('Error fetching manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const mangaData = {
      ...formData,
      chapters: formData.chapters.split(',').map(ch => ch.trim()).filter(ch => ch)
    };

    try {
      if (editingManga) {
        // Update existing manga
        await fetch(`http://localhost:8080/api/manga/${editingManga.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mangaData),
        });
      } else {
        // Add new manga
        await fetch('http://localhost:8080/api/manga', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mangaData),
        });
      }
      
      setFormData({ title: '', cover: '', chapters: '' });
      setShowAddForm(false);
      setEditingManga(null);
      fetchManga();
    } catch (error) {
      console.error('Error saving manga:', error);
    }
  };

  const handleEdit = (mangaItem: Manga) => {
    setEditingManga(mangaItem);
    setFormData({
      title: mangaItem.title,
      cover: mangaItem.cover,
      chapters: mangaItem.chapters.join(', ')
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this manga?')) {
      try {
        await fetch(`http://localhost:8080/api/manga/${id}`, {
          method: 'DELETE',
        });
        fetchManga();
      } catch (error) {
        console.error('Error deleting manga:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', cover: '', chapters: '' });
    setShowAddForm(false);
    setEditingManga(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading manga...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Manga Management</h1>
            <nav className="flex space-x-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                Dashboard
              </Link>
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-800">
                Manage Users
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editingManga ? 'Edit Manga' : 'Add New Manga'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover URL
                </label>
                <input
                  type="url"
                  value={formData.cover}
                  onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapters (comma-separated)
                </label>
                <textarea
                  value={formData.chapters}
                  onChange={(e) => setFormData({ ...formData, chapters: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-400"
                  rows={3}
                  placeholder="Chapter 1, Chapter 2, Chapter 3..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingManga ? 'Update' : 'Add'} Manga
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add New Manga
            </button>
          </div>
        )}

        {/* Manga List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">All Manga ({manga.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {manga.map((mangaItem) => (
              <div key={mangaItem.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={mangaItem.cover}
                    alt={mangaItem.title}
                    className="w-16 h-20 object-cover rounded mr-4"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='80' viewBox='0 0 64 80'%3E%3Crect width='64' height='80' fill='%23f3f4f6'/%3E%3Ctext x='32' y='40' text-anchor='middle' fill='%236b7280' font-size='10'%3EManga%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{mangaItem.title}</h3>
                    <p className="text-gray-600">{mangaItem.chapters?.length || 0} chapters</p>
                    <p className="text-sm text-gray-500">ID: {mangaItem.id}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(mangaItem)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(mangaItem.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
