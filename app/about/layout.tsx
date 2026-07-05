import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Eventopic — A UAE Event Staffing Agency",
  description:
    "A young UAE network that has worked the floor — supplying professional, reliable staff for events, exhibitions and activations. Built with Newlink Business Group.",
  alternates: { canonical: "https://eventopic.com/about" },
  openGraph: {
    title: "About Eventopic — A UAE Event Staffing Agency",
    description: "Good staffing is not only about appearance. Attitude, accountability and representing brands the right way.",
    url: "https://eventopic.com/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
