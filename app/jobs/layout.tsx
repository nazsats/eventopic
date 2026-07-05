import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event & Part-Time Jobs in the UAE | Eventopic",
  description:
    "Browse live event and part-time jobs across the UAE — hostess, promoter, model, brand ambassador, hospitality and more. Build a free profile and apply in minutes.",
  alternates: { canonical: "https://eventopic.com/jobs" },
  openGraph: {
    title: "Live Event & Part-Time Jobs in the UAE | Eventopic",
    description: "Find event and part-time work with trusted brands across all 7 emirates. Transparent rates, payment within 14 days.",
    url: "https://eventopic.com/jobs",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
