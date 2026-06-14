import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Eventopic",
  description: "How Eventopic collects, uses and protects your personal data across our UAE staffing platform.",
  alternates: { canonical: "https://eventopic.com/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
