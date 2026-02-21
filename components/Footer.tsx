// components/Footer.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaInstagram, FaLinkedin, FaWhatsapp,
  FaArrowRight, FaBriefcase, FaEnvelope, FaMapMarkerAlt,
} from "react-icons/fa";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SOCIALS = [
  { icon: <FaInstagram />, label: "Instagram", href: "https://instagram.com/eventopic_official" },
  { icon: <FaWhatsapp />, label: "WhatsApp Community", href: "https://chat.whatsapp.com/CvC6QGyQlKFEz5s9vhJRXC" },
  { icon: <FaLinkedin />, label: "LinkedIn", href: "#" },
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
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-snug">
                Find your next event opportunity <br className="hidden md:block" />
                <span className="text-[var(--text-muted)]">in Dubai today.</span>
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/jobs" className="btn-primary px-7 py-3 text-sm font-bold inline-flex items-center gap-2">
                <FaBriefcase /> Browse Jobs
              </Link>
              <a href="mailto:info@eventopic.com" className="px-7 py-3 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--primary)] text-sm font-bold transition-all flex items-center gap-2">
                <FaEnvelope /> Get in Touch
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="relative z-10 py-12 md:py-16">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-3">Eventopic</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Dubai's #1 event staffing platform. Connecting talented professionals with exclusive event opportunities since 2021.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <FaMapMarkerAlt className="text-[var(--accent)] text-[10px]" />
                Dubai, United Arab Emirates
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Navigate</h3>
              <ul className="space-y-3">
                {NAV_LINKS.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-1.5 group">
                      <FaArrowRight className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Platform</h3>
              <ul className="space-y-3">
                {[
                  { label: "Browse Jobs", href: "/jobs" },
                  { label: "My Profile", href: "/profile" },
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "AI Assistant", href: "/#chatbot" },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-1.5 group">
                      <FaArrowRight className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Follow Us</h3>
              <ul className="space-y-3">
                {SOCIALS.map(s => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors group">
                      <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[var(--primary)]/10 transition-colors text-xs">
                        {s.icon}
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-5 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-2">Email us directly</p>
                <a href="mailto:info@eventopic.com" className="text-sm text-[var(--primary)] hover:underline font-medium">
                  info@eventopic.com
                </a>
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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Giant watermark */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.025] select-none">
        <p className="text-[18vw] font-display font-black leading-none text-center text-white whitespace-nowrap">
          EVENTOPIC
        </p>
      </div>
    </footer>
  );
}
