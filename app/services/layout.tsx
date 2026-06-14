import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staffing Services — Events, Promotions & Part-Time | Eventopic",
  description:
    "Hostesses, promoters, models, hospitality crew and more. See how Eventopic staffs events, promotions and part-time roles across the UAE — and how talent gets hired.",
  alternates: { canonical: "https://eventopic.com/services" },
  openGraph: {
    title: "Eventopic Staffing Services — Events, Promotions & Part-Time",
    description: "Reliable event, promotion and part-time staff across Dubai and the UAE.",
    url: "https://eventopic.com/services",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
