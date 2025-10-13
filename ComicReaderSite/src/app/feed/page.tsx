'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  timestamp: string;
  likes: number;
  chapterRef: {
    mangaTitle: string;
    chapterNumber: string;
    mangaCover: string;
  };
  isHot?: boolean;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
}

export default function FeedPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'following' | 'hot'>('all');

  useEffect(() => {
    // Check if user is logged in
    const cookies = document.cookie.split(';');
    const userCookie = cookies.find(c => c.trim().startsWith('user='));

    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        setUser(userData);
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }

    // Load sample comments
    loadComments();
  }, []);

  const loadComments = () => {
    // Sample comments data based on chapters and reading history
    const sampleComments: Comment[] = [
      {
        id: '1',
        author: 'manga_lover_2024',
        authorAvatar: 'https://i.pravatar.cc/150?img=25',
        authorRole: 'user',
        content: 'Just finished this chapter and I\'m blown away! The plot twist was incredible! 🤯',
        timestamp: '2 hours ago',
        likes: 89,
        chapterRef: {
          mangaTitle: 'Dark Chronicles',
          chapterNumber: 'Chapter 12',
          mangaCover: 'https://via.placeholder.com/100x150/8B5CF6/FFFFFF?text=Dark+Chronicles'
        }
      },
      {
        id: '2',
        author: 'the_lemonking',
        authorAvatar: 'https://i.pravatar.cc/150?img=12',
        authorRole: 'author',
        content: 'Thank you all for the amazing support on Chapter 5! Your feedback means the world to me! 🐍💚',
        timestamp: '3 hours ago',
        likes: 234,
        chapterRef: {
          mangaTitle: 'Stupid Snake Adventures',
          chapterNumber: 'Chapter 5',
          mangaCover: 'https://via.placeholder.com/100x150/8B5CF6/FFFFFF?text=Stupid+Snake'
        },
        isHot: true
      },
      {
        id: '3',
        author: 'otaku_life',
        authorAvatar: 'https://i.pravatar.cc/150?img=32',
        authorRole: 'user',
        content: 'This fight scene is absolutely epic! Best chapter so far! ⚔️🔥',
        timestamp: '5 hours ago',
        likes: 156,
        chapterRef: {
          mangaTitle: 'Shadow Warriors',
          chapterNumber: 'Chapter 24',
          mangaCover: 'https://via.placeholder.com/100x150/6366F1/FFFFFF?text=Shadow+Warriors'
        },
        isHot: true
      },
      {
        id: '4',
        author: 'comic_enthusiast',
        authorAvatar: 'https://i.pravatar.cc/150?img=40',
        authorRole: 'user',
        content: 'The character development in this chapter is phenomenal. Can\'t wait for the next one!',
        timestamp: '8 hours ago',
        likes: 67,
        chapterRef: {
          mangaTitle: 'Romance in Bloom',
          chapterNumber: 'Chapter 18',
          mangaCover: 'https://via.placeholder.com/100x150/EC4899/FFFFFF?text=Romance'
        }
      },
      {
        id: '5',
        author: 'dark_pen_studio',
        authorAvatar: 'https://i.pravatar.cc/150?img=45',
        authorRole: 'author',
        content: 'Working on the next chapter! Get ready for more nightmares... 😈🌙',
        timestamp: '10 hours ago',
        likes: 445,
        chapterRef: {
          mangaTitle: 'Midnight Shadows',
          chapterNumber: 'Chapter 8',
          mangaCover: 'https://via.placeholder.com/100x150/7C3AED/FFFFFF?text=Midnight'
        },
        isHot: true
      },
      {
        id: '6',
        author: 'bookworm_sam',
        authorAvatar: 'https://i.pravatar.cc/150?img=52',
        authorRole: 'user',
        content: 'Just binged all the chapters! This is amazing! When is the next update?',
        timestamp: '12 hours ago',
        likes: 34,
        chapterRef: {
          mangaTitle: 'Fantasy Quest',
          chapterNumber: 'Chapter 15',
          mangaCover: 'https://via.placeholder.com/100x150/10B981/FFFFFF?text=Fantasy'
        }
      },
      {
        id: '7',
        author: 'casual_reader',
        authorAvatar: 'https://i.pravatar.cc/150?img=15',
        authorRole: 'user',
        content: 'The mystery is getting deeper! I have so many theories about who the villain is! 🕵️',
        timestamp: '1 day ago',
        likes: 92,
        chapterRef: {
          mangaTitle: 'Detective Files',
          chapterNumber: 'Chapter 22',
          mangaCover: 'https://via.placeholder.com/100x150/F59E0B/FFFFFF?text=Detective'
        }
      },
      {
        id: '8',
        author: 'manga_artist_ken',
        authorAvatar: 'https://i.pravatar.cc/150?img=33',
        authorRole: 'author',
        content: 'New chapter is live! Thank you for 10k reads on this series! 🎉',
        timestamp: '1 day ago',
        likes: 567,
        chapterRef: {
          mangaTitle: 'Dragon\'s Legacy',
          chapterNumber: 'Chapter 30',
          mangaCover: 'https://via.placeholder.com/100x150/EF4444/FFFFFF?text=Dragon'
        },
        isHot: true
      }
    ];

    setComments(sampleComments);
    setLoading(false);
  };

  const getFilteredComments = () => {
    let filtered = [...comments];

    if (filter === 'hot') {
      // Show hot/trending comments (sorted by likes, or marked as hot)
      filtered = filtered.filter(c => c.isHot || c.likes > 100).sort((a, b) => b.likes - a.likes);
    } else if (filter === 'following') {
      // Filter by followed users (placeholder logic)
      filtered = filtered.slice(0, 5);
    }

    return filtered;
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: user.username,
      authorAvatar: user.avatarUrl || `https://i.pravatar.cc/150?u=${user.username}`,
      authorRole: user.role,
      content: newComment,
      timestamp: 'Just now',
      likes: 0,
      chapterRef: {
        mangaTitle: 'Sample Manga',
        chapterNumber: 'Chapter 1',
        mangaCover: 'https://via.placeholder.com/100x150/8B5CF6/FFFFFF?text=Sample'
      }
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'author': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Community Feed</h1>
          <p className="text-purple-200">Recent comments from readers and authors</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-purple-500 text-white'
                : 'text-purple-200 hover:bg-white/10'
            }`}
          >
            All Comments
          </button>
          <button
            onClick={() => setFilter('following')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'following'
                ? 'bg-purple-500 text-white'
                : 'text-purple-200 hover:bg-white/10'
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setFilter('hot')}
            className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              filter === 'hot'
                ? 'bg-purple-500 text-white'
                : 'text-purple-200 hover:bg-white/10'
            }`}
          >
            🔥 Hot
          </button>
        </div>

        {/* Create Comment */}
        {user && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-purple-300/20">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about a chapter..."
                  className="w-full bg-white/5 border border-purple-300/30 rounded-lg p-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
                  rows={3}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments Feed */}
        <div className="space-y-6">
          {getFilteredComments().map((comment) => (
            <div
              key={comment.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-300/20 hover:border-purple-300/40 transition"
            >
              {/* Comment Header */}
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={comment.authorAvatar}
                  alt={comment.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/profile/${comment.author}`} className="font-bold text-white hover:text-purple-300 transition">
                      {comment.author}
                    </Link>
                    <span className={`${getRoleBadgeColor(comment.authorRole)} text-white text-xs px-2 py-1 rounded-full`}>
                      {comment.authorRole}
                    </span>
                    {comment.isHot && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        🔥 Hot
                      </span>
                    )}
                  </div>
                  <div className="text-purple-300 text-sm">{comment.timestamp}</div>
                </div>
              </div>

              {/* Chapter Reference */}
              <div className="mb-4 bg-white/5 rounded-lg p-3 flex gap-3 items-center hover:bg-white/10 transition cursor-pointer">
                <img
                  src={comment.chapterRef.mangaCover}
                  alt={comment.chapterRef.mangaTitle}
                  className="w-16 h-20 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-purple-300 text-sm">Commented on:</div>
                  <div className="text-white font-semibold truncate">{comment.chapterRef.mangaTitle}</div>
                  <div className="text-purple-400 text-sm">{comment.chapterRef.chapterNumber}</div>
                </div>
              </div>

              {/* Comment Content */}
              <div className="mb-4">
                <p className="text-white text-lg leading-relaxed">{comment.content}</p>
              </div>

              {/* Comment Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-purple-300/20">
                <button className="flex items-center gap-2 text-purple-300 hover:text-pink-400 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-semibold">{comment.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-purple-300 hover:text-blue-400 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-semibold">Reply</span>
                </button>
                <button className="flex items-center gap-2 text-purple-300 hover:text-green-400 transition ml-auto">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="font-semibold">Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition border border-purple-300/30">
            Load More Comments
          </button>
        </div>
      </div>
    </div>
  );
}
