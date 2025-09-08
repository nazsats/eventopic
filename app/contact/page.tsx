// Updated app/contact/page.tsx
// Changes: Updated color theme integration. Added ChatBot import and component at the bottom-right for automated enquiries.

"use client";

import Navbar from "../../components/Navbar";
import ChatBot from "../../components/ChatBot"; // New import for chatbot
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function Contact() {
  const [clientForm, setClientForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [staffForm, setStaffForm] = useState({ name: "", email: "", mobile: "", role: "", experience: "" });

  useEffect(() => {
    if (window.location.hash === "#staff-form") {
      document.getElementById("staff-form")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  const handleStaffChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
  };

  const validatePhone = (phone: string) => /^05\d{8}$/.test(phone);

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(clientForm.mobile)) {
      toast.error("Please enter a valid Dubai mobile number (e.g., 05xxxxxxxx).");
      return;
    }
    try {
      const response = await fetch("/api/submit-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });
      if (response.ok) {
        toast.success("Client inquiry submitted successfully!");
        setClientForm({ name: "", email: "", mobile: "", message: "" });
      } else {
        toast.error("Failed to submit inquiry. Please try again.");
      }
    } catch {
      // Remove 'error' param
      toast.error("Error submitting inquiry. Check your connection.");
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(staffForm.mobile)) {
      toast.error("Please enter a valid Dubai mobile number (e.g., 05xxxxxxxx).");
      return;
    }
    try {
      const response = await fetch("/api/submit-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffForm),
      });
      if (response.ok) {
        toast.success("Application submitted! We'll contact you soon.");
        setStaffForm({ name: "", email: "", mobile: "", role: "", experience: "" });
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    } catch {
      // Remove 'error' param
      toast.error("Error submitting application. Check your connection.");
    }
  };

  const roles = ["Promoter", "Waitress", "Usher", "Volunteer", "Model"];

  return (
    <>
      <Navbar />
      {/* Contact Section: B&W Cards -> Updated to new theme */}
      <section className="py-20 bg-[var(--secondary)]">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading" 
            style={{ color: "var(--white)" }}
          >
            Get in Touch &ndash; Let&apos;s Plan Your Next Event in Dubai
          </motion.h1>
          
          {/* Client Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg mx-auto card p-8 md:p-10 rounded-xl shadow-xl mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center font-heading" style={{ color: "var(--accent)" }}>Client Enquiry</h2>
            <form onSubmit={handleClientSubmit} className="space-y-6">
              <div>
                <label htmlFor="client-name" className="block text-sm font-medium mb-2" style={{ color: "var(--accent)" }}>Full Name</label>
                <input
                  type="text"
                  id="client-name"
                  name="name"
                  value={clientForm.name}
                  onChange={handleClientChange}
                  className="w-full p-3 border border-[var(--light)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--soft)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-mobile" className="block text-sm font-medium mb-2" style={{ color: "var(--accent)" }}>Mobile No. (Dubai)</label>
                <input
                  type="tel"
                  id="client-mobile"
                  name="mobile"
                  value={clientForm.mobile}
                  onChange={handleClientChange}
                  pattern="05\d{8}"
                  title="Dubai mobile: 05 followed by 8 digits"
                  className="w-full p-3 border border-[var(--light)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--soft)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-email" className="block text-sm font-medium mb-2" style={{ color: "var(--accent)" }}>Email</label>
                <input
                  type="email"
                  id="client-email"
                  name="email"
                  value={clientForm.email}
                  onChange={handleClientChange}
                  className="w-full p-3 border border-[var(--light)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--soft)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-message" className="block text-sm font-medium mb-2" style={{ color: "var(--accent)" }}>Message</label>
                <textarea
                  id="client-message"
                  name="message"
                  value={clientForm.message}
                  onChange={handleClientChange}
                  className="w-full p-3 border border-[var(--light)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--soft)] text-[var(--primary)]"
                  rows={4}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full p-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "1px solid var(--white)" }}
              >
                Send Enquiry
              </button>
            </form>
          </motion.div>

          {/* Staff Form: Fixed Bugs */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-lg mx-auto card p-8 md:p-10 rounded-xl shadow-xl"
            id="staff-form"
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center font-heading" style={{ color: "var(--accent)" }}>Join Our Team &ndash; Opportunities in Dubai&apos;s Events</h2>
            <form onSubmit={handleStaffSubmit} className="space-y-6">
              <div>
                <label htmlFor="staff-name" className="block text-sm font-medium mb-2" style={{ color: "var(--accent)" }}>Full Name</label>
                <input
                  type="text"
                  id="staff-name"
                  name="name"
                  value={staffForm.name}
                  onChange={handleStaffChange}
                  className="w-full p-3 border border-[var(--light)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--soft)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="staff-mobile" className="block text-sm font-medium mb-2" style={{ color: "var(--accent)" }}>Mobile No. (Dubai)</label>
                <input
                  type="tel"
                  id="staff-mobile"
                  name="mobile"
                  value={staffForm.mobile}
                  onChange={handleStaffChange}
                  pattern="05\d{8}"
                  title="Dubai mobile: 05 followed by 8 digits"
                  className="w-full p-3 border border-[var(--light)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--soft)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="staff-email" className="block text-sm font-medium mb-2" style={{ color: "var(--accent)" }}>Email</label>
                <input
                  type="email"
                  id="staff-email"
                  name="email"
                  value={staffForm.email}
                  onChange={handleStaffChange}
                  className="w-full p-3 border border-[var(--light)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--soft)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-2" style={{ color: "var(--accent)" }}>Role Interested In</label>
                <select
                  id="role"
                  name="role"
                  value={staffForm.role}
                  onChange={handleStaffChange}
                  className="w-full p-3 border border-[var(--light)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--soft)] text-[var(--primary)]"
                  required
                >
                  <option value="">Select a Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role.toLowerCase()}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium mb-2" style={{ color: "var(--accent)" }}>Experience (Optional)</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={staffForm.experience}
                  onChange={handleStaffChange}
                  className="w-full p-3 border border-[var(--light)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--soft)] text-[var(--primary)]"
                  rows={4}
                  placeholder="Describe your relevant experience..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full p-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "1px solid var(--white)" }}
              >
                Apply Now
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ChatBot Component - Positioned fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBot />
      </div>

      {/* Footer */}
      <footer className="py-10" style={{ backgroundColor: "var(--primary)", color: "var(--white)" }}>
        <div className="container mx-auto text-center px-4">
          <p>&copy; 2025 Eventopic. All rights reserved. | Contact Us for Event Excellence in Dubai.</p>
        </div>
      </footer>
    </>
  );
}