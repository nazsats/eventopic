"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Services() {
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

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-16" 
            style={{ color: "var(--primary)" }}
          >
            Our Services
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { title: "Promoters and Staff", desc: "We provide experienced promoters and staff for all types of events to ensure smooth operations." },
              { title: "Event Planning Services", desc: "Full-service planning for marriages, parties, birthday celebrations, tech events, and more." },
              { title: "Volunteers", desc: "Supplying dedicated volunteers for private and government events." },
              { title: "Job Opportunities", desc: "Offering short-term works and part-time jobs in the event management sector." },
            ].map((service, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-[var(--white)] rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
              >
                <h3 className="text-2xl font-semibold mb-4" style={{ color: "var(--accent)" }}>{service.title}</h3>
                <p className="text-lg">{service.desc}</p>
              </motion.div>
            ))}
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