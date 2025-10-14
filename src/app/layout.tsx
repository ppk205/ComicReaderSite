import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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
        {/* Header */}
        <header className="bg-purple-100 shadow-sm opacity-100">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manga Reader</h1>
                <p className="text-gray-600 mt-2">Discover and read your favorite manga</p>
              </div>
              <nav className="flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium">
                  Home
                </Link>
                <Link href="/comics" className="text-gray-700 hover:text-purple-600 font-medium">
                  Comics
                </Link>
                <Link href="/bookmarks" className="text-gray-700 hover:text-purple-600 font-medium">
                  Bookmarks
                </Link>
                <Link href="/community" className="text-gray-700 hover:text-purple-600 font-medium">
                  Community
                </Link>
                <Link href="/admin" className="text-purple-600 hover:text-purple-800 font-medium border border-purple-600 px-3 py-1 rounded">
                  Admin
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {children}

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
