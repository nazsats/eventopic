import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Eventopic — A Small Dubai Staffing Team",
  description:
    "Meet the three-person team behind Eventopic, a UAE platform for event, promotion and part-time staffing. Launched in 2025, working across all 7 emirates.",
  alternates: { canonical: "https://eventopic.com/about" },
  openGraph: {
    title: "About Eventopic — Built by a Small Dubai Team",
    description: "Three people connecting staff with event, promotion and part-time work across the UAE.",
    url: "https://eventopic.com/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
