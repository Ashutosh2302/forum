import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community Forum",
  description: "Course discussion forum with saved posts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
