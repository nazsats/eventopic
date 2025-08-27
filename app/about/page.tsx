"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export default function About() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--secondary)", color: "var(--dark)" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 p-4 shadow-lg" style={{ background: "linear-gradient(to right, var(--primary), var(--accent))", color: "var(--white)" }}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Eventopic Logo" width={40} height={40} className="rounded-full" />
            <div>
              <h1 className="text-2xl font-bold">Eventopic</h1>
              <p className="text-sm">The Future of Showcasing</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-lg hover:text-[var(--light)] transition-colors">Home</Link>
            <Link href="/about" className="text-lg hover:text-[var(--light)] transition-colors">About</Link>
            <Link href="/services" className="text-lg hover:text-[var(--light)] transition-colors">Services</Link>
            <Link href="/contact" className="text-lg hover:text-[var(--light)] transition-colors">Contact</Link>
          </div>
          <button 
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: "var(--white)" }}
          >
            ☰
          </button>
        </div>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 flex flex-col space-y-4 bg-[var(--primary)] p-4 rounded-lg shadow-md"
          >
            <Link href="/" className="hover:text-[var(--light)] text-lg">Home</Link>
            <Link href="/about" className="hover:text-[var(--light)] text-lg">About</Link>
            <Link href="/services" className="hover:text-[var(--light)] text-lg">Services</Link>
            <Link href="/contact" className="hover:text-[var(--light)] text-lg">Contact</Link>
          </motion.div>
        )}
      </nav>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-12" 
            style={{ color: "var(--primary)" }}
          >
            About Eventopic
          </motion.h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-[var(--white)] p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold mb-4" style={{ color: "var(--accent)" }}>Our Experience</h3>
              <p className="text-lg">
                Eventopic is a leading event management company based in Dubai with over 3 years of hands-on experience. Our dedicated team has successfully handled a wide variety of events, from intimate gatherings to large-scale productions.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-[var(--white)] p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold mb-4" style={{ color: "var(--accent)" }}>Our Commitment</h3>
              <p className="text-lg">
                We specialize in providing promoters, staff, and volunteers for both private and government events. We also offer short-term and part-time job opportunities, helping individuals gain valuable experience in the event industry. At Eventopic, we are committed to delivering exceptional service and creating unforgettable experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10" style={{ backgroundColor: "var(--dark)", color: "var(--white)" }}>
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Eventopic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}