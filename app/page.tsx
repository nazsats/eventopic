"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
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

      {/* Hero Section */}
      <section className="py-32 relative overflow-hidden" style={{ background: "linear-gradient(to bottom, var(--accent), var(--primary))", color: "var(--white)" }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/hero-bg-pattern.png')" }}></div>
        <div className="container mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold mb-6 drop-shadow-lg"
          >
            Welcome to Eventopic
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl mb-10 drop-shadow-md"
          >
            The Future of Showcasing Your Events
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center space-x-4"
          >
            <Link href="/contact" className="px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all" style={{ backgroundColor: "var(--light)", color: "var(--dark)" }}>
              Enquiry
            </Link>
            <Link href="/contact#staff-form" className="px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all" style={{ backgroundColor: "var(--white)", color: "var(--accent)" }}>
              Join Our Team
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20" style={{ backgroundColor: "var(--secondary)" }}>
        <div className="container mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16" 
            style={{ color: "var(--primary)" }}
          >
            Our Services
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "Event Staffing", desc: "We provide promoters, staff, and volunteers for private and government events." },
              { title: "Event Planning", desc: "Comprehensive services for marriages, parties, birthdays, tech events, and more." },
              { title: "Job Opportunities", desc: "Short-term, part-time jobs as promoters, staff, or volunteers." },
            ].map((service, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="p-8 bg-[var(--white)] rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
              >
                <h3 className="text-2xl font-semibold mb-4" style={{ color: "var(--accent)" }}>{service.title}</h3>
                <p>{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20" style={{ background: "linear-gradient(to right, var(--light), var(--secondary))" }}>
        <div className="container mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-12" 
            style={{ color: "var(--primary)" }}
          >
            About Us
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl max-w-3xl mx-auto mb-10"
          >
            Eventopic is an experienced team with over 3 years of hands-on experience in Dubai. We have handled numerous events, providing top-notch services to make every occasion memorable.
          </motion.p>
          <Link href="/about" className="px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all" style={{ backgroundColor: "var(--primary)", color: "var(--white)" }}>
            Learn More
          </Link>
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