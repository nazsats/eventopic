import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Eventopic — Hire Staff or Find Work in the UAE",
  description:
    "Need professional staff for an exhibition, activation or short-term assignment — or looking for part-time work in the UAE? Get in touch — we usually reply within a day.",
  alternates: { canonical: "https://eventopic.com/contact" },
  openGraph: {
    title: "Contact Eventopic",
    description: "Hire verified, reliable staff — or join our UAE talent pool. Office: International City, CBD 05, Office No. 8, Dubai, UAE.",
    url: "https://eventopic.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
