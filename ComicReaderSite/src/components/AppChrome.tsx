"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/dashboard");

  return (
    <>
      {!hideChrome && <AppHeader />}
      {children}
      {!hideChrome && <SiteFooter />}
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-purple-100 shadow-sm opacity-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Manga Reader</h1>
        <p className="text-gray-600 mt-2 text-center">Discover and read your favorite manga</p>
      </div>
    </footer>
  );
}
