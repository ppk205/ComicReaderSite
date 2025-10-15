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
    if (!menuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  // 1 chỗ đặt class tái dùng để size đồng nhất:
  const linkClass =
    "text-sm md:text-base lg:text-lg font-semibold text-slate-800 hover:text-purple-700 transition-colors";

  return (
    <header className="bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 lg:py-5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
            <Link href="/" className="hover:text-purple-700">Manga Reader</Link>
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 truncate">
            Discover and read your favorite manga
          </p>
        </div>

        {/* Right zone */}
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
          {/* Main nav */}
          <nav className="hidden md:flex gap-4 md:gap-6 items-center">
            <Link href="/list" className={linkClass}>List</Link>
            <Link href="/community" className={linkClass}>Community</Link>
            <Link href="/ranking" className={linkClass}>Ranking · Season</Link>
          </nav>

          {/* Secondary nav */}
          <nav className="hidden md:flex gap-4 md:gap-6 items-center">
            <Link href="/bookmarks" className={linkClass}>Bookmarks</Link>
            <Link href="/epub" className={linkClass}>EPUB Reader</Link>
          </nav>

          {/* Search */}
          <div className="hidden lg:block min-w-[220px]">
            <SearchBar />
          </div>

          {/* Auth */}
          <nav className="flex items-center">
            {!isAuthenticated && !isLoading && (
              <Link
                href="/login"
                className="text-sm md:text-base font-semibold text-purple-700 hover:text-purple-800"
              >
                Login
              </Link>
            )}

            {isAuthenticated && user && (
              <div className="relative" ref={menuRef}>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-white px-3 md:px-4 py-1.5 md:py-2 text-sm font-semibold text-purple-700 shadow-sm transition hover:border-purple-400 hover:text-purple-800"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  type="button"
                >
                  <span className="hidden sm:inline">Welcome,</span>
                  <span className="truncate max-w-[120px]">{user.username}</span>
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 min-w-[11rem] rounded-lg border border-purple-200 bg-white py-1 shadow-lg"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-purple-50"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/epub"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-purple-50"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      EPUB Library
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-purple-50"
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

      {/* Mobile row (ẩn bớt để gọn) */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center gap-3">
          <SearchBar />
          <Link href="/epub" className="ml-auto text-sm font-semibold text-purple-700 hover:text-purple-800">
            EPUB
          </Link>
        </div>
      </div>
    </header>
  );
}
