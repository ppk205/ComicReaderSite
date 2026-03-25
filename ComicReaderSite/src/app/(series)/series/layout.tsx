import type { ReactNode } from "react";
import "./globals.css";

export default function SeriesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}