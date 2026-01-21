"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ChatBot from "../../components/ChatBot";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaPaperPlane,
  FaCalendarAlt,
  FaBuilding,
  FaFileAlt
} from "react-icons/fa";

export default function Contact() {
  const [activeTab, setActiveTab] = useState<'client' | 'staff'>('client');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    eventType: "",
    date: "",
    message: ""
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    experience: "",
    message: ""
  });

  useEffect(() => {
    // Check hash for direct linking to staff form
    if (window.location.hash === "#staff-form") {
      setActiveTab('staff');
      document.getElementById("contact-forms")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  const handleStaffChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
  };

  const validatePhone = (phone: string) => /^05\d{8}$/.test(phone);

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(clientForm.phone)) {
      toast.error("Please enter a valid UAE phone number (05xxxxxxxx).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm),
      });

      if (res.ok) {
        toast.success("Inquiry sent successfully! We'll be in touch.");
        setClientForm({ name: "", email: "", phone: "", company: "", eventType: "", date: "", message: "" });
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(staffForm.phone)) {
      toast.error("Please enter a valid UAE phone number (05xxxxxxxx).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm),
      });

      if (res.ok) {
        toast.success("Application submitted! Our team will review your profile.");
        setStaffForm({ name: "", email: "", phone: "", role: "", experience: "", message: "" });
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="bottom-right" theme="dark" toastClassName="glass-card border border-[var(--primary)]/30" />

      {/* Simplified Hero Section */}
      <section className="pt-32 pb-12 relative overflow-hidden bg-[var(--background)]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--primary)]/20 blur-[100px]" />
        </div>

        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>

            <p className="text-xl max-w-2xl mx-auto text-[var(--text-secondary)]">
              Whether you're planning a world-class event or looking to join our elite team, we're here to make it happen.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16 mb-20">
            {[
              { icon: <FaPhone />, title: "Call Us", details: "+971 50 123 4567", sub: "Mon-Fri, 9am-6pm" },
              { icon: <FaEnvelope />, title: "Email Us", details: "info@eventopic.ae", sub: "We reply within 24hrs" },
              { icon: <FaMapMarkerAlt />, title: "Visit Us", details: "Business Bay, Dubai", sub: "UAE" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--primary)] text-xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-[var(--text-primary)] font-semibold">{item.details}</p>
                <p className="text-sm text-[var(--text-secondary)]">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section id="contact-forms" className="section-standard pt-0">
        <div className="container max-w-4xl">
          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="glass-card p-2 rounded-full inline-flex">
              <button
                onClick={() => setActiveTab('client')}
                className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'client'
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                For Clients
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'staff'
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                Join Team
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'client' ? (
              <motion.div
                key="client"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="glass-card p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <FaBriefcase className="text-9xl transform rotate-12" />
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="font-display text-3xl font-bold mb-2">Start Your Project</h2>
                    <p className="text-[var(--text-secondary)]">Tell us about your event and let's bring it to life.</p>
                  </div>

                  <form onSubmit={handleClientSubmit} className="space-y-6 relative z-10">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <FaUser className="text-[var(--primary)]" /> Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={clientForm.name}
                          onChange={handleClientChange}
                          className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <FaBuilding className="text-[var(--primary)]" /> Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={clientForm.company}
                          onChange={handleClientChange}
                          className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all"
                          placeholder="Company name (optional)"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <FaEnvelope className="text-[var(--primary)]" /> Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={clientForm.email}
                          onChange={handleClientChange}
                          className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <FaPhone className="text-[var(--primary)]" /> Phone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={clientForm.phone}
                          onChange={handleClientChange}
                          className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all"
                          placeholder="05xxxxxxxx"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <FaCalendarAlt className="text-[var(--primary)]" /> Event Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={clientForm.date}
                          onChange={handleClientChange}
                          className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all text-[var(--text-secondary)]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <FaBriefcase className="text-[var(--primary)]" /> Event Type
                        </label>
                        <select
                          name="eventType"
                          value={clientForm.eventType}
                          onChange={handleClientChange}
                          className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all text-[var(--text-secondary)]"
                        >
                          <option value="">Select Type</option>
                          <option value="corporate">Corporate Event</option>
                          <option value="promotion">Product Promotion</option>
                          <option value="exhibition">Exhibition/Trade Show</option>
                          <option value="private">Private Party</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <FaFileAlt className="text-[var(--primary)]" /> Project Details *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={clientForm.message}
                        onChange={handleClientChange}
                        className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all resize-none"
                        placeholder="Tell us about the event requirements, staff needed, etc."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full py-4 text-lg font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full"></span>
                      ) : (
                        <>Send Inquiry <FaPaperPlane className="text-sm" /></>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="staff"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="glass-card p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <FaUser className="text-9xl transform -rotate-12" />
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="font-display text-3xl font-bold mb-2">Join the A-Team</h2>
                    <p className="text-[var(--text-secondary)]">We are always looking for exceptional talent in UAE.</p>
                  </div>

                  <form onSubmit={handleStaffSubmit} className="space-y-6 relative z-10">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <FaUser className="text-[var(--primary)]" /> Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={staffForm.name}
                          onChange={handleStaffChange}
                          className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <FaPhone className="text-[var(--primary)]" /> Phone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={staffForm.phone}
                          onChange={handleStaffChange}
                          className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all"
                          placeholder="05xxxxxxxx"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <FaEnvelope className="text-[var(--primary)]" /> Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={staffForm.email}
                        onChange={handleStaffChange}
                        className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <FaBriefcase className="text-[var(--primary)]" /> Role Interested In *
                        </label>
                        <select
                          name="role"
                          required
                          value={staffForm.role}
                          onChange={handleStaffChange}
                          className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all text-[var(--text-secondary)]"
                        >
                          <option value="">Select Role</option>
                          <option value="promoter">Event Promoter</option>
                          <option value="hostess">Host/Hostess</option>
                          <option value="model">Model</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="photographer">Photographer</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <FaCalendarAlt className="text-[var(--primary)]" /> Experience Level
                        </label>
                        <select
                          name="experience"
                          value={staffForm.experience}
                          onChange={handleStaffChange}
                          className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all text-[var(--text-secondary)]"
                        >
                          <option value="">Select Experience</option>
                          <option value="entry">Entry Level (1 yr)</option>
                          <option value="mid">Mid Level (1-3 yrs)</option>
                          <option value="senior">Senior/Pro (3+ yrs)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <FaFileAlt className="text-[var(--primary)]" /> Why You? *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={staffForm.message}
                        onChange={handleStaffChange}
                        className="modern-input w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all resize-none"
                        placeholder="Tell us a bit about yourself and your past experience..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-secondary w-full py-4 text-lg font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full"></span>
                      ) : (
                        <>Submit Application <FaPaperPlane className="text-sm" /></>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      <Footer />
      <ChatBot />
    </>
  );
}
