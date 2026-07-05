// components/Footer.tsx
"use client";

import Link from "next/link";
import {
  FaInstagram, FaLinkedin,
  FaBriefcase, FaEnvelope, FaMapMarkerAlt,
} from "react-icons/fa";

const SOCIALS = [
  { icon: <FaInstagram />, label: "Instagram", href: "https://instagram.com/eventopic_official" },
  { icon: <FaLinkedin />, label: "LinkedIn", href: "https://www.linkedin.com/company/eventopic" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--background)] border-t border-[var(--border)] relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />

      {/* Subtle bg glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--primary)]/4 rounded-full blur-[100px] pointer-events-none" />

      {/* CTA Banner */}
      <div className="relative z-10 border-b border-[var(--border)] py-10 md:py-14">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">Ready to get started?</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] leading-snug">
                Find your next opportunity — <br className="hidden md:block" />
                <span className="gradient-text">or your next team — today.</span>
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/jobs" className="btn-primary px-7 py-3 text-sm font-bold inline-flex items-center gap-2">
                <FaBriefcase /> Browse Jobs
              </Link>
              <a href="mailto:info@eventopic.com" className="px-7 py-3 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] text-sm font-bold transition-all flex items-center gap-2">
                <FaEnvelope /> Get in Touch
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Compact info row */}
      <div className="relative z-10 py-10">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            {/* Brand + address */}
            <div className="max-w-sm">
              <p className="text-[var(--primary)] text-sm font-display font-black uppercase tracking-widest mb-3">Eventopic</p>
              <p className="flex items-start gap-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                <FaMapMarkerAlt className="text-[var(--accent)] text-xs mt-1 shrink-0" />
                International City, CBD 05, Office No. 8, Dubai, UAE
              </p>
            </div>

            {/* Contact emails */}
            <div className="text-sm space-y-2">
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Contact</p>
              <p className="text-[var(--text-secondary)]">
                Job applications ·{" "}
                <a href="mailto:hiring@eventopic.com" className="text-[var(--primary)] hover:underline font-medium">hiring@eventopic.com</a>
              </p>
              <p className="text-[var(--text-secondary)]">
                Business enquiries ·{" "}
                <a href="mailto:info@eventopic.com" className="text-[var(--primary)] hover:underline font-medium">info@eventopic.com</a>
              </p>
            </div>

            {/* Socials */}
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Follow Us</p>
              <div className="flex items-center gap-2.5">
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-muted)] hover:border-[var(--border-hover)] transition-all">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-[var(--border)] py-5">
        <div className="container mx-auto px-5 max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[var(--text-muted)]">
          <p>© {year} Eventopic. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--primary)] transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>

      {/* Giant watermark */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.025] select-none">
        <p className="text-[18vw] font-display font-black leading-none text-center text-[var(--primary)] whitespace-nowrap">
          EVENTOPIC
        </p>
      </div>
    </footer>
  );
}
