import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event, Promotion & Part-Time Jobs in the UAE | Eventopic",
  description:
    "Browse live event, promotion and part-time jobs across Dubai and the UAE — hostess, promoter, model, hospitality and more. Build a free profile and apply in minutes.",
  alternates: { canonical: "https://eventopic.com/jobs" },
  openGraph: {
    title: "Live Event, Promo & Part-Time Jobs in the UAE | Eventopic",
    description: "Find event, promotion and part-time work across all 7 emirates and apply in minutes.",
    url: "https://eventopic.com/jobs",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
