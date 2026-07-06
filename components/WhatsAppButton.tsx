// components/WhatsAppButton.tsx
// Floating WhatsApp widget — deliberately framed for CLIENT & BUSINESS
// enquiries so job seekers are guided to the Jobs page instead.
// Sits bottom-left so it never collides with the ChatBot (bottom-right).
"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FaWhatsapp, FaTimes, FaArrowRight } from "react-icons/fa";

const PHONE = "971508293772";
const MESSAGE = "Hello Eventopic, I'd like to enquire about hiring staff for my business or upcoming event.";
const WA_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-4 md:bottom-6 md:left-6 z-50 flex flex-col items-start gap-3">
      {/* Expanded card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-[270px] rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-lg)]"
          >
            {/* Header */}
            <div className="relative bg-[#25D366] px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                <FaWhatsapp className="text-lg" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm leading-tight">Need Staff?</p>
                <p className="text-[11px] text-white/85 leading-tight">Business enquiries only</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors"
              >
                <FaTimes className="text-[11px]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Hiring temporary staff for your event or business? Talk to our team directly.
              </p>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-colors"
              >
                <FaWhatsapp className="text-base" /> Chat on WhatsApp
              </a>
              <p className="text-[11px] text-[var(--text-muted)] text-center mt-3 pt-3 border-t border-[var(--border)]">
                Looking for a job?{" "}
                <Link href="/jobs" onClick={() => setOpen(false)} className="text-[var(--primary)] font-semibold hover:underline">
                  Apply on the Jobs page <FaArrowRight className="inline text-[8px]" />
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger pill / FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Business & client enquiries on WhatsApp"
        aria-expanded={open}
        className="group flex items-center gap-2.5 rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_26px_rgba(37,211,102,0.6)] transition-all pl-3.5 pr-4 py-3 active:scale-95"
      >
        <FaWhatsapp className="text-2xl shrink-0" />
        <span className="hidden sm:block font-bold text-sm whitespace-nowrap pr-0.5">Need Staff?</span>
      </button>
    </div>
  );
}
