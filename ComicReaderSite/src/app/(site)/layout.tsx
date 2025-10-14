import type { ReactNode } from "react";
import "./globals.css";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}