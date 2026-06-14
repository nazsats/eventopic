import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Eventopic",
  description: "The terms that govern your use of Eventopic's UAE staffing platform.",
  alternates: { canonical: "https://eventopic.com/terms" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
