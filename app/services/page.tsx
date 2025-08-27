"use client";

import Link from "next/link";
import { useState } from "react";

export default function Services() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--secondary)", color: "var(--dark)" }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: "var(--primary)", color: "var(--white)" }} className="p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Eventopic</h1>
            <p className="text-sm">The Future of Showcasing</p>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link href="/" className="hover:text-[var(--light)]">Home</Link>
            <Link href="/about" className="hover:text-[var(--light)]">About</Link>
            <Link href="/services" className="hover:text-[var(--light)]">Services</Link>
            <Link href="/contact" className="hover:text-[var(--light)]">Contact</Link>
          </div>
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: "var(--white)" }}
          >
            Menu
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-2 flex flex-col space-y-2">
            <Link href="/" className="hover:text-[var(--light)]">Home</Link>
            <Link href="/about" className="hover:text-[var(--light)]">About</Link>
            <Link href="/services" className="hover:text-[var(--light)]">Services</Link>
            <Link href="/contact" className="hover:text-[var(--light)]">Contact</Link>
          </div>
        )}
      </nav>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--primary)" }}>Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-[var(--white)] rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--accent)" }}>Promoters and Staff</h3>
              <p>We provide experienced promoters and staff for all types of events to ensure smooth operations.</p>
            </div>
            <div className="p-6 bg-[var(--white)] rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--accent)" }}>Event Planning Services</h3>
              <p>Full-service planning for marriages, parties, birthday celebrations, tech events, and more.</p>
            </div>
            <div className="p-6 bg-[var(--white)] rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--accent)" }}>Volunteers</h3>
              <p>Supplying dedicated volunteers for private and government events.</p>
            </div>
            <div className="p-6 bg-[var(--white)] rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--accent)" }}>Job Opportunities</h3>
              <p>Offering short-term works and part-time jobs in the event management sector.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: "var(--dark)", color: "var(--white)" }}>
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Eventopic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}