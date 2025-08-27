
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 p-4 shadow-lg" style={{ background: "linear-gradient(to right, var(--primary), var(--accent))", color: "var(--white)" }}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Eventopic Logo" width={100} height={100} className="rounded-full" />
        </Link>
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

    </nav>
  );
}