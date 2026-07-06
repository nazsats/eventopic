// components/WhatsAppButton.tsx
// Minimal one-tap WhatsApp CTA for CLIENT & BUSINESS enquiries.
// Bottom-left so it never collides with the ChatBot (bottom-right).
"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

const PHONE = "971508293772";
const MESSAGE = "Hello Eventopic, I'd like to enquire about hiring staff for my business or upcoming event.";
const WA_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-5 left-4 md:bottom-6 md:left-6 z-50 flex flex-col items-center gap-2">
      {/* Floating label — always visible, one tap opens WhatsApp */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Need staff? Chat with us on WhatsApp for business enquiries"
        className="px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap hover:border-[#25D366] transition-colors"
      >
        Need Staff?
      </a>

      {/* WhatsApp icon — subtle pulse, single click */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_26px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all"
      >
        {/* subtle pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping [animation-duration:2.5s]" />
        <FaWhatsapp className="relative text-2xl md:text-[28px]" />
      </a>

      {/* Secondary, unobtrusive job-seeker redirect */}
      <Link
        href="/jobs"
        className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors underline underline-offset-2 decoration-[var(--border)] hover:decoration-[var(--primary)]"
      >
        Looking for a job?
      </Link>
    </div>
  );
}
