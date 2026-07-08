//app/privacy/page.tsx

"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "1. Who We Are",
    body: [
      "Eventopic is a staffing and consultancy company, operating as an authorized business within the UAE, that connects businesses with professionals for part-time and short-term work across the Emirates. Our registered office is at International City, CBD 05, Office No. 8, Dubai, UAE.",
      "This Privacy Policy explains how we collect, use, store and protect your personal information when you use our website and services.",
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      "When you register or apply for roles, we may collect: your name, email address, phone number, profile photographs, resume/CV, work experience, physical attributes relevant to staffing roles, identification details required for lawful employment, and your communication with us.",
      "For business clients, we collect contact details and information about your staffing requirements.",
    ],
  },
  {
    title: "3. Personal Data & Confidentiality",
    body: [
      "All personal information shared by staff members is treated as strictly confidential.",
      "Sensitive information is stored securely behind authenticated access — only you and authorized Eventopic personnel can access your profile data.",
      "Your personal data is never sold and is never disclosed to third parties without appropriate legal or operational necessity — for example, sharing the details a client reasonably needs to confirm your booking, or where disclosure is required by UAE law.",
      "Eventopic respects your privacy and follows responsible data handling practices at all times.",
    ],
  },
  {
    title: "4. How We Use Your Information",
    body: [
      "We use your information to: create and manage your account, match you with suitable part-time and short-term roles, process applications and bookings, communicate with you about opportunities and platform updates, and improve our services.",
    ],
  },
  {
    title: "5. Media Consent",
    body: [
      "When you apply for modelling roles, the photographs you upload may be shared with the relevant Eventopic client for recruitment and selection purposes only.",
      "By registering on the platform and accepting these terms, staff members also acknowledge and agree that photographs and videos captured during work assignments — or approved portfolio images — may be used by Eventopic for legitimate promotional, marketing, branding, portfolio, website and social media purposes.",
      "Such content will only be used for professional recruitment and promotional purposes. Your personal and sensitive information (contact details, identification documents, application history) always remains confidential, is never included in promotional material, and is never shared beyond these agreed purposes without your authorization.",
      "Consent for modelling applications is captured explicitly at the point of applying and stored with a timestamp. If you have concerns about specific content, contact us at info@eventopic.com and we will review it.",
    ],
  },
  {
    title: "6. Data Security",
    body: [
      "Accounts are protected by Firebase Authentication, and profile data is stored in access-controlled databases. We take reasonable technical and organizational measures to protect your data against unauthorized access, alteration or loss.",
    ],
  },
  {
    title: "7. Your Rights",
    body: [
      "You may access and update your profile information at any time from your account. You may request deletion of your account and associated personal data by contacting us at info@eventopic.com.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Material changes will be communicated through the website. Continued use of the platform after changes constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "9. Contact Us",
    body: [
      "For any privacy-related questions or requests, contact us at info@eventopic.com or visit us at International City, CBD 05, Office No. 8, Dubai, UAE.",
    ],
  },
];

export default function Privacy() {
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
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-10">Last updated: July 2026</p>

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
