//app/terms/page.tsx

"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "1. About Eventopic",
    body: [
      "Eventopic is a staffing and consultancy company, operating as an authorized business within the UAE, connecting businesses with professionals for part-time and short-term work. Our office is at International City, CBD 05, Office No. 8, Dubai, UAE.",
      "By creating an account or using this website, you agree to these Terms & Conditions and to our Privacy Policy.",
    ],
  },
  {
    title: "2. Accounts & Registration",
    body: [
      "You must provide accurate, current information when registering and keep your profile up to date. You are responsible for maintaining the confidentiality of your account credentials.",
      "During registration you are required to accept the Privacy Policy and these Terms & Conditions. Acceptance includes the media consent described below.",
    ],
  },
  {
    title: "3. Media Consent",
    body: [
      "By registering and accepting these terms, staff members acknowledge that photographs and videos captured during work assignments may be used by Eventopic for legitimate promotional, marketing, branding, portfolio, website and social media purposes. Personal and sensitive information always remains confidential. See our Privacy Policy for full details.",
    ],
  },
  {
    title: "4. Work Assignments",
    body: [
      "Job listings describe part-time and short-term staffing assignments offered through Eventopic or its clients. Applying does not guarantee a booking. Rates, dates and role details are stated on each listing; confirmed bookings will be communicated to you directly.",
      "Staff are expected to attend confirmed assignments punctually and professionally. Repeated no-shows may result in account suspension.",
    ],
  },
  {
    title: "5. For Business Clients",
    body: [
      "Staffing requests are scoped and confirmed in writing. Eventopic handles sourcing, vetting and coordination of staff. Specific commercial terms (rates, cancellation windows, replacements) are agreed per engagement.",
    ],
  },
  {
    title: "6. Acceptable Use",
    body: [
      "You agree not to misuse the platform — including posting false information, contacting staff or clients to circumvent the platform, or attempting to access data that is not yours.",
    ],
  },
  {
    title: "7. Liability",
    body: [
      "Eventopic provides the platform and staffing services with reasonable skill and care. To the maximum extent permitted by UAE law, Eventopic is not liable for indirect or consequential losses arising from use of the platform.",
    ],
  },
  {
    title: "8. Changes",
    body: [
      "We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance. For questions, contact info@eventopic.com.",
    ],
  },
];

export default function Terms() {
  return (
    <div className="bg-[var(--background)] min-h-screen">
      <Navbar />
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-5 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl md:text-5xl font-display font-black mb-3 text-[var(--text-primary)]">
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-10">
              Last updated: July 2026 · See also our{" "}
              <Link href="/privacy" className="text-[var(--primary)] underline hover:text-[var(--primary-hover)]">Privacy Policy</Link>
            </p>

            <div className="space-y-8">
              {SECTIONS.map((s) => (
                <div key={s.title} className="glass-card p-6 md:p-7 rounded-sm">
                  <h2 className="font-display font-bold text-lg text-[var(--text-primary)] mb-3">{s.title}</h2>
                  <div className="space-y-3">
                    {s.body.map((p, i) => (
                      <p key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed">{p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
