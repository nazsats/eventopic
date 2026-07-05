import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Staffing Services in the UAE | Eventopic",
  description:
    "Hostesses, promoters, models, hospitality and event support staff for exhibitions, brand activations, private gatherings and more — across all 7 emirates.",
  alternates: { canonical: "https://eventopic.com/services" },
  openGraph: {
    title: "Eventopic — Event Staffing Services in the UAE",
    description: "Professional, well-presented and reliable staff for events, exhibitions and activations.",
    url: "https://eventopic.com/services",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
