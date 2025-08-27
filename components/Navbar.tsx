"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 p-4 shadow-lg" style={{ background: "linear-gradient(to right, var(--primary), var(--accent))", color: "var(--white)" }}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Eventopic Logo" width={48} height={48} className="rounded-full" />
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-lg font-semibold hover:scale-105 transition-transform duration-200 hover:text-[var(--light)]">Home</Link>
          <Link href="/about" className="text-lg font-semibold hover:scale-105 transition-transform duration-200 hover:text-[var(--light)]">About</Link>
          <Link href="/services" className="text-lg font-semibold hover:scale-105 transition-transform duration-200 hover:text-[var(--light)]">Services</Link>
          <Link href="/contact" className="text-lg font-semibold hover:scale-105 transition-transform duration-200 hover:text-[var(--light)]">Contact</Link>
        </div>
        <button 
          className="md:hidden text-3xl relative"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ color: "var(--white)" }}
        >
          <motion.span
            animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 8 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ☰
          </motion.span>
          {isMenuOpen && (
            <motion.span
              className="absolute top-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              ✕
            </motion.span>
          )}
        </button>
      </div>
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden mt-4 bg-[var(--primary)] p-6 rounded-xl shadow-2xl"
          style={{ background: "linear-gradient(to bottom, var(--primary), var(--accent))" }}
        >
          <Link href="/" className="block py-2 text-lg font-semibold hover:text-[var(--light)] hover:scale-105 transition-transform">Home</Link>
          <Link href="/about" className="block py-2 text-lg font-semibold hover:text-[var(--light)] hover:scale-105 transition-transform">About</Link>
          <Link href="/services" className="block py-2 text-lg font-semibold hover:text-[var(--light)] hover:scale-105 transition-transform">Services</Link>
          <Link href="/contact" className="block py-2 text-lg font-semibold hover:text-[var(--light)] hover:scale-105 transition-transform">Contact</Link>
        </motion.div>
      )}
    </nav>
  );
}