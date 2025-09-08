// Updated components/Navbar.tsx
// Changes: Updated color theme (e.g., hover to gold, mobile menu background).

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 p-4 shadow-lg" style={{ background: "linear-gradient(to right, var(--primary), var(--accent))", color: "var(--white)" }}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          {/* Responsive logo: Smaller on mobile */}
          <Image 
            src="/logoWhite.png" 
            alt="Eventopic Logo - Professional Event Management in Dubai" 
            width={80} 
            height={80} 
            className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full" 
            priority 
          />
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`text-lg font-semibold hover:scale-105 transition-transform duration-200 ${pathname === item.href ? 'underline underline-offset-4' : 'hover:text-[var(--color-accent)]'}`}
            >
              {item.label}
            </Link>
          ))}
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
              className="absolute top-2 left-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              ✕
            </motion.span>
          )}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden mt-4 space-y-4 bg-[var(--secondary)] p-4 rounded-lg"
        >
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`block text-lg font-semibold hover:text-[var(--color-accent)] ${pathname === item.href ? 'font-bold' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
}