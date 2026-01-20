// components/Footer.tsx
"use client";

import Link from "next/link";
import { FaInstagram, FaFacebookF, FaLinkedin, FaArrowRight } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--background)] border-t border-[var(--border)] pt-24 pb-12 overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-12">
          {/* Giant Brand */}
          <div className="max-w-2xl text-[var(--text-secondary)] mb-12 mb-0">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--primary)]">Eventopic Staffing</p>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-8">
              We create <span className="text-[var(--text-muted)]">unforgettable</span> experiences through premium staffing & management.
            </h2>
            <div className="flex gap-4">
              <a href="mailto:info@eventopic.com" className="px-8 py-4 rounded-full border border-[var(--border)] text-white hover:bg-white hover:text-black transition-all font-medium">
                Get in Touch
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-16 md:gap-24">
            <div>
              <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-8">Menu</h3>
              <ul className="space-y-4">
                <li><Link href="/" className="text-[var(--text-secondary)] hover:text-white transition-colors text-lg">Home</Link></li>
                <li><Link href="/services" className="text-[var(--text-secondary)] hover:text-white transition-colors text-lg">Services</Link></li>
                <li><Link href="/portal" className="text-[var(--text-secondary)] hover:text-white transition-colors text-lg">Jobs Portal</Link></li>
                <li><Link href="/gallery" className="text-[var(--text-secondary)] hover:text-white transition-colors text-lg">Gallery</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-8">Socials</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors text-lg group">
                    LinkedIn <FaArrowRight className="text-xs -rotate-45 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors text-lg group">
                    Instagram <FaArrowRight className="text-xs -rotate-45 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors text-lg group">
                    Facebook <FaArrowRight className="text-xs -rotate-45 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-muted)]">
          <p>© {currentYear} Eventopic. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03]">
        <h1 className="text-[15vw] font-display font-bold leading-none text-center text-white whitespace-nowrap">
          EVENTOPIC
        </h1>
      </div>
    </footer>
  );
}