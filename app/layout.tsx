import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventopic - The Future of Showcasing",
  description: "Event management services in Dubai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}