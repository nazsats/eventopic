"use client";

import Link from "next/link";
import { useState } from "react";

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

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add submission logic (e.g., API call)
    alert("Client inquiry submitted!");
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add submission logic (e.g., API call)
    alert("Application submitted!");
  };

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

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--primary)" }}>Get in Touch</h2>
          
          {/* Client Contact Form */}
          <div className="max-w-lg mx-auto bg-[var(--white)] p-8 rounded-lg shadow-md mb-16">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: "var(--accent)" }}>Client Inquiry</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="client-name" className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  id="client-name"
                  name="name"
                  value={clientForm.name}
                  onChange={handleClientChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-email" className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  id="client-email"
                  name="email"
                  value={clientForm.email}
                  onChange={handleClientChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-message" className="block text-sm font-medium">Message</label>
                <textarea
                  id="client-message"
                  name="message"
                  value={clientForm.message}
                  onChange={handleClientChange}
                  className="w-full p-2 border rounded"
                  rows={4}
                  required
                ></textarea>
              </div>
              <button
                onClick={handleClientSubmit}
                style={{ backgroundColor: "var(--accent)", color: "var(--white)" }}
                className="w-full p-2 rounded hover:bg-[var(--primary)]"
              >
                Send Inquiry
              </button>
            </div>
          </div>

          {/* Staff/Volunteer Application Form */}
          <div className="max-w-lg mx-auto bg-[var(--white)] p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: "var(--accent)" }}>Join Our Team</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="staff-name" className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  id="staff-name"
                  name="name"
                  value={staffForm.name}
                  onChange={handleStaffChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="staff-email" className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  id="staff-email"
                  name="email"
                  value={staffForm.email}
                  onChange={handleStaffChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium">Role Interested In</label>
                <select
                  id="role"
                  name="role"
                  value={staffForm.role}
                  onChange={handleStaffChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="promoter">Promoter</option>
                  <option value="staff">Staff</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium">Experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={staffForm.experience}
                  onChange={handleStaffChange}
                  className="w-full p-2 border rounded"
                  rows={4}
                ></textarea>
              </div>
              <button
                onClick={handleStaffSubmit}
                style={{ backgroundColor: "var(--accent)", color: "var(--white)" }}
                className="w-full p-2 rounded hover:bg-[var(--primary)]"
              >
                Apply Now
              </button>
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