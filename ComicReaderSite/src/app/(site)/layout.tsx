import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { AuthProvider } from "../../contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Fourth Wall Library",
  description: "The Fourth Wall Library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
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
                  <a href="/series" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
                    All Series
                  </a>
                  <a href="/community" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
                    Community
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
                <nav className="flex gap-6 items-center">
                  <Link href="/login" className="text-1xl font-bold text-gray-900 hover:text-purple-600">
                    Login
                  </Link>
                  <Link href="/dashboard" className="text-1xl font-bold text-purple-600 hover:text-purple-800">
                    Dashboard
                  </Link>
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
        </AuthProvider>
      </body>
    </html>
  );
}