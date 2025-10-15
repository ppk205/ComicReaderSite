"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/contexts/AuthContext";

export function AppHeader() {
  const {
    state: { user, isAuthenticated, isLoading },
    logout,
  } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/");
  };

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="bg-purple-100 shadow-sm opacity-100">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            <Link href="/">Manga Reader</Link>
          </h1>
          <p className="text-gray-600 mt-2">Discover and read your favorite manga</p>
        </div>

        <div className="flex items-center gap-8">
          <nav className="flex gap-6 items-center">
            <Link href="/list" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
              List
            </Link>
            <Link href="/community" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
              Community
            </Link>
            <Link href="/ranking" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
              Ranking - Season
            </Link>
          </nav>
          <nav className="flex gap-6 items-center">
            <Link href="/bookmarks" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
              Bookmarks
            </Link>
          </nav>
          <div className="flex items-center">
            <SearchBar />
          </div>
          <nav className="flex gap-6 items-center">
            {!isAuthenticated && !isLoading && (
              <Link href="/login" className="text-1xl font-bold text-gray-900 hover:text-purple-600">
                Login
              </Link>
            )}
            {isAuthenticated && user && (
              <div className="relative" ref={menuRef}>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-purple-400 bg-white px-4 py-2 text-sm font-semibold text-purple-600 shadow-sm transition hover:border-purple-500 hover:text-purple-700"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  type="button"
                >
                  <span className="hidden sm:inline">Welcome,</span>
                  <span>{user.username}</span>
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 min-w-[11rem] rounded-lg border border-purple-200 bg-white py-1 shadow-lg"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/epub"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      EPUB Library
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-purple-50"
                      role="menuitem"
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
