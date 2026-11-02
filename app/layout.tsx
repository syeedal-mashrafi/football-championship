import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Championship",
  description: "Free football. Every nation. Your championship.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
