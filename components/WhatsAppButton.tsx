// components/WhatsAppButton.tsx
// Floating WhatsApp contact — primarily for client & business enquiries.
// Sits bottom-left so it never collides with the ChatBot (bottom-right).
"use client";

import { FaWhatsapp } from "react-icons/fa";

const PHONE = "971508293772";
const MESSAGE = "Hi Eventopic! I'm interested in your staffing services and would like to know more.";
const WA_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

export default function WhatsAppButton() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 left-4 md:bottom-6 md:left-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:scale-105 active:scale-95 transition-transform"
    >
      <FaWhatsapp className="text-2xl md:text-[28px]" />
    </a>
  );
}
