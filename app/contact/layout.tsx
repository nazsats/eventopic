import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Eventopic — Hire Staff or Find Work in the UAE",
  description:
    "Need staff for an event, promotion or activation, or looking for part-time event work in the UAE? Get in touch — we usually reply within a day.",
  alternates: { canonical: "https://eventopic.com/contact" },
  openGraph: {
    title: "Contact Eventopic",
    description: "Hire reliable event & promo staff, or join our UAE talent pool.",
    url: "https://eventopic.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
