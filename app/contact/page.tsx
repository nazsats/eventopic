"use client";

import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function Contact() {
  const [clientForm, setClientForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [staffForm, setStaffForm] = useState({ name: "", email: "", mobile: "", role: "", experience: "" }); // Fixed: Added mobile

  useEffect(() => {
    if (window.location.hash === "#staff-form") {
      document.getElementById("staff-form")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  const handleStaffChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value }); // Fixed: Use staffForm
  };

  // Phone validation: Basic for Dubai (e.g., 05xxxxxxxx)
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
    } catch (error) {
      toast.error("Error submitting inquiry. Check your connection.");
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(staffForm.mobile)) { // Fixed: staffForm
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
    } catch (error) {
      toast.error("Error submitting application. Check your connection.");
    }
  };

  const roles = ["Promoter", "Waitress", "Usher", "Volunteer", "Model"]; // Fixed: Unique, corrected spelling

  return (
    <>
      <Navbar />
      {/* Contact Section: B&W Cards */}
      <section className="py-20 bg-[var(--secondary)]">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading" 
            style={{ color: "var(--white)" }}
          >
            Get in Touch – Let's Plan Your Next Event in Dubai
          </motion.h1>
          
          {/* Client Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg mx-auto card p-8 md:p-10 rounded-xl shadow-xl mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center font-heading" style={{ color: "var(--primary)" }}>Client Enquiry</h2>
            <form onSubmit={handleClientSubmit} className="space-y-6">
              <div>
                <label htmlFor="client-name" className="block text-sm font-medium mb-2" style={{ color: "var(--primary)" }}>Full Name</label>
                <input
                  type="text"
                  id="client-name"
                  name="name"
                  value={clientForm.name}
                  onChange={handleClientChange}
                  className="w-full p-3 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--white)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-mobile" className="block text-sm font-medium mb-2" style={{ color: "var(--primary)" }}>Mobile No. (Dubai)</label>
                <input
                  type="tel"
                  id="client-mobile"
                  name="mobile"
                  value={clientForm.mobile}
                  onChange={handleClientChange}
                  pattern="05\d{8}"
                  title="Dubai mobile: 05 followed by 8 digits"
                  className="w-full p-3 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--white)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-email" className="block text-sm font-medium mb-2" style={{ color: "var(--primary)" }}>Email</label>
                <input
                  type="email"
                  id="client-email"
                  name="email"
                  value={clientForm.email}
                  onChange={handleClientChange}
                  className="w-full p-3 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--white)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-message" className="block text-sm font-medium mb-2" style={{ color: "var(--primary)" }}>Message</label>
                <textarea
                  id="client-message"
                  name="message"
                  value={clientForm.message}
                  onChange={handleClientChange}
                  className="w-full p-3 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--white)] text-[var(--primary)]"
                  rows={4}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full p-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "var(--primary)", color: "var(--white)", border: "1px solid var(--white)" }}
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
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center font-heading" style={{ color: "var(--primary)" }}>Join Our Team – Opportunities in Dubai Events</h2>
            <form onSubmit={handleStaffSubmit} className="space-y-6">
              <div>
                <label htmlFor="staff-name" className="block text-sm font-medium mb-2" style={{ color: "var(--primary)" }}>Full Name</label>
                <input
                  type="text"
                  id="staff-name"
                  name="name"
                  value={staffForm.name}
                  onChange={handleStaffChange}
                  className="w-full p-3 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--white)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="staff-mobile" className="block text-sm font-medium mb-2" style={{ color: "var(--primary)" }}>Mobile No. (Dubai)</label>
                <input
                  type="tel"
                  id="staff-mobile"
                  name="mobile"
                  value={staffForm.mobile} // Fixed
                  onChange={handleStaffChange} // Fixed
                  pattern="05\d{8}"
                  title="Dubai mobile: 05 followed by 8 digits"
                  className="w-full p-3 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--white)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="staff-email" className="block text-sm font-medium mb-2" style={{ color: "var(--primary)" }}>Email</label>
                <input
                  type="email"
                  id="staff-email"
                  name="email"
                  value={staffForm.email}
                  onChange={handleStaffChange}
                  className="w-full p-3 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--white)] text-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-2" style={{ color: "var(--primary)" }}>Role Interested In</label>
                <select
                  id="role"
                  name="role"
                  value={staffForm.role}
                  onChange={handleStaffChange}
                  className="w-full p-3 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--white)] text-[var(--primary)]"
                  required
                >
                  <option value="">Select a Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role.toLowerCase()}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium mb-2" style={{ color: "var(--primary)" }}>Experience (Optional)</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={staffForm.experience}
                  onChange={handleStaffChange}
                  className="w-full p-3 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--white)] bg-[var(--white)] text-[var(--primary)]"
                  rows={4}
                  placeholder="Describe your relevant experience..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full p-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "var(--primary)", color: "var(--white)", border: "1px solid var(--white)" }}
              >
                Apply Now
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10" style={{ backgroundColor: "var(--primary)", color: "var(--white)" }}>
        <div className="container mx-auto text-center px-4">
          <p>&copy; 2025 Eventopic. All rights reserved. | Contact Us for Event Excellence in Dubai.</p>
        </div>
      </footer>
    </>
  );
}