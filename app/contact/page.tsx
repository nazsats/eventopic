"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function Contact() {
  const [clientForm, setClientForm] = useState({ name: "", email: "", message: "" });
  const [staffForm, setStaffForm] = useState({ name: "", email: "", role: "", experience: "" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  const handleStaffChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/submit-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });
      if (response.ok) {
        toast.success("Client inquiry submitted!");
        setClientForm({ name: "", email: "", message: "" });
      } else {
        toast.error("Failed to submit inquiry.");
      }
    } catch (error) {
      toast.error("Error submitting inquiry.");
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/submit-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffForm),
      });
      if (response.ok) {
        toast.success("Application submitted!");
        setStaffForm({ name: "", email: "", role: "", experience: "" });
      } else {
        toast.error("Failed to submit application.");
      }
    } catch (error) {
      toast.error("Error submitting application.");
    }
  };

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

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-16" 
            style={{ color: "var(--primary)" }}
          >
            Get in Touch
          </motion.h2>
          
          {/* Client Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg mx-auto bg-[var(--white)] p-10 rounded-xl shadow-xl mb-16"
          >
            <h3 className="text-3xl font-semibold mb-8 text-center" style={{ color: "var(--accent)" }}>Client Inquiry</h3>
            <form onSubmit={handleClientSubmit} className="space-y-6">
              <div>
                <label htmlFor="client-name" className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  id="client-name"
                  name="name"
                  value={clientForm.name}
                  onChange={handleClientChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="client-email"
                  name="email"
                  value={clientForm.email}
                  onChange={handleClientChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-message" className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  id="client-message"
                  name="message"
                  value={clientForm.message}
                  onChange={handleClientChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                  rows={4}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full p-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "var(--accent)", color: "var(--white)" }}
              >
                Send Inquiry
              </button>
            </form>
          </motion.div>

          {/* Staff/Volunteer Application Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg mx-auto bg-[var(--white)] p-10 rounded-xl shadow-xl"
          >
            <h3 className="text-3xl font-semibold mb-8 text-center" style={{ color: "var(--accent)" }}>Join Our Team</h3>
            <form onSubmit={handleStaffSubmit} className="space-y-6">
              <div>
                <label htmlFor="staff-name" className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  id="staff-name"
                  name="name"
                  value={staffForm.name}
                  onChange={handleStaffChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="staff-email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="staff-email"
                  name="email"
                  value={staffForm.email}
                  onChange={handleStaffChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-2">Role Interested In</label>
                <select
                  id="role"
                  name="role"
                  value={staffForm.role}
                  onChange={handleStaffChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="promoter">Promoter</option>
                  <option value="staff">Staff</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium mb-2">Experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={staffForm.experience}
                  onChange={handleStaffChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                  rows={4}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full p-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "var(--accent)", color: "var(--white)" }}
              >
                Apply Now
              </button>
            </form>
          </motion.div>
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