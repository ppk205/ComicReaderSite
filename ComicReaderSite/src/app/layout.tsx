'use client';

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface UserData {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  bio?: string;
  seriesCount?: number;
  followersCount?: number;
  viewerCount?: number;
  socialLinks?: Record<string, string>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<UserData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in by reading the user cookie
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const userCookie = cookies.find(c => c.trim().startsWith('user='));

      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          setUser(userData);
        } catch (e) {
          console.error('Error parsing user cookie:', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();

    // Re-check on route change
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Clear cookies
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      setUser(null);
      setShowDropdown(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <html lang="en">
      <head>
        <title>The Fourth Wall Library</title>
        <meta name="description" content="The Fourth Wall Library" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Header */}
        <header className="bg-purple-100 shadow-sm opacity-100">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            {/* Left: Logo */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <Link href="/">Manga Reader</Link>
              </h1>
              <p className="text-gray-600 mt-2">Discover and read your favorite manga</p>
            </div>

            {/* Right: Nav + Search */}
            <div className="flex items-center gap-8">
              <nav className="flex gap-6 items-center">
                <a href="/list" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
                  List
                </a>
                <a href="/community" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
                  Community
                </a>
                <a href="/ranking" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
                  Ranking - Season
                </a>
              </nav>
              <nav className="flex gap-6 items-center">
                <a href="/bookmarks" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
                  Bookmarks
                </a>
              </nav>
              {/* Search */}
              <div className="flex items-center">
                <SearchBar />
              </div>

              {/* User Account / Login */}
              <nav className="flex gap-6 items-center relative">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-2 text-gray-900 hover:text-purple-600 font-bold"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-xl">{user.displayName || user.username}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{user.displayName || user.username}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                        {user.role !== 'admin' && (
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                            onClick={() => setShowDropdown(false)}
                          >
                            👤 Profile
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <a href="/login" className="text-xl font-bold text-gray-900 hover:text-purple-600">
                    Login
                  </a>
                )}
              </nav>
            </div>
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer className="bg-purple-100 shadow-sm opacity-100">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">Manga Reader</h1>
            <p className="text-gray-600 mt-2 text-center">Discover and read your favorite manga</p>
          </div>
        </footer>

      </body>
    </html>
  );
}