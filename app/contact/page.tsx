"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ChatBot from "../../components/ChatBot";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBriefcase,
  FaPaperPlane, FaCalendarAlt, FaBuilding, FaFileAlt,
  FaWhatsapp, FaArrowRight,
} from "react-icons/fa";

// ─── Constants ────────────────────────────────────────────────────────────────
const INFO_CARDS = [
  { icon: <FaPhone />, title: "Call Us", detail: "+971 50 123 4567", sub: "Mon – Fri, 9 am – 6 pm" },
  { icon: <FaWhatsapp />, title: "WhatsApp", detail: "Join Community", sub: "Instant updates & support", link: "https://chat.whatsapp.com/CvC6QGyQlKFEz5s9vhJRXC" },
  { icon: <FaEnvelope />, title: "Email", detail: "info@eventopic.com", sub: "Reply within 24 hrs", link: "mailto:info@eventopic.com" },
  { icon: <FaMapMarkerAlt />, title: "Location", detail: "Business Bay, Dubai", sub: "United Arab Emirates" },
];

const INPUT = "w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm outline-none focus:border-[var(--primary)] transition-all";
const LABEL = "flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1.5";

export default function Contact() {
  const [activeTab, setActiveTab] = useState<"client" | "staff">("client");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clientForm, setClientForm] = useState({ name: "", email: "", phone: "", company: "", eventType: "", date: "", message: "" });
  const [staffForm, setStaffForm] = useState({ name: "", email: "", phone: "", role: "", experience: "", message: "" });

  useEffect(() => {
    if (window.location.hash === "#staff-form") {
      setActiveTab("staff");
      document.getElementById("contact-forms")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const validatePhone = (p: string) => /^05\d{8}$/.test(p);

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(clientForm.phone)) { toast.error("Enter a valid UAE phone (05xxxxxxxx)."); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-client", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clientForm) });
      if (res.ok) { toast.success("Inquiry sent! We'll be in touch soon."); setClientForm({ name: "", email: "", phone: "", company: "", eventType: "", date: "", message: "" }); }
      else throw new Error();
    } catch { toast.error("Something went wrong. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(staffForm.phone)) { toast.error("Enter a valid UAE phone (05xxxxxxxx)."); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(staffForm) });
      if (res.ok) { toast.success("Application submitted! Our team will review it shortly."); setStaffForm({ name: "", email: "", phone: "", role: "", experience: "", message: "" }); }
      else throw new Error();
    } catch { toast.error("Something went wrong. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--primary)]/8 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-5 max-w-3xl text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-3">
            Get in Touch
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4 leading-tight">
            Let's <span className="gradient-text">Connect</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-[var(--text-secondary)] text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Planning a world-class event or looking to join our elite team? We're here to make it happen.
          </motion.p>
        </div>
      </section>

      {/* ── Info cards ── */}
      <div className="container mx-auto px-5 max-w-5xl pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INFO_CARDS.map((card, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-card p-5 rounded-2xl text-center group hover:border-[var(--primary)]/30 border border-transparent transition-all hover:-translate-y-1"
            >
              {card.link ? (
                <a href={card.link} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="w-9 h-9 mx-auto rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] text-sm mb-3 group-hover:scale-110 transition-transform">{card.icon}</div>
                  <p className="font-bold text-xs text-[var(--text-primary)] mb-0.5">{card.title}</p>
                  <p className="text-[var(--primary)] text-xs font-semibold">{card.detail}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{card.sub}</p>
                </a>
              ) : (
                <>
                  <div className="w-9 h-9 mx-auto rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] text-sm mb-3 group-hover:scale-110 transition-transform">{card.icon}</div>
                  <p className="font-bold text-xs text-[var(--text-primary)] mb-0.5">{card.title}</p>
                  <p className="text-[var(--text-secondary)] text-xs font-medium">{card.detail}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{card.sub}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Forms ── */}
      <section id="contact-forms" className="py-8 md:py-12">
        <div className="container mx-auto px-5 max-w-2xl">

          {/* Tabs */}
          <div className="flex mb-7 p-1 rounded-2xl bg-[var(--surface)] border border-[var(--border)] gap-1">
            {(["client", "staff"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === tab
                    ? "bg-[var(--primary)] text-black shadow-md"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
              >
                {tab === "client" ? "📋 For Clients" : "🤝 Join the Team"}
              </button>
            ))}
          </div>

          {/* Form panels */}
          <AnimatePresence mode="wait">
            {activeTab === "client" ? (
              <motion.div key="client" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.3 }}>
                <div className="glass-card p-6 md:p-8 rounded-2xl border border-[var(--border)]">
                  <div className="mb-6">
                    <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-1">Start Your Project</h2>
                    <p className="text-xs text-[var(--text-secondary)]">Tell us about your event and let's bring it to life.</p>
                  </div>
                  <form onSubmit={handleClientSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}><FaUser className="text-[var(--primary)] text-[10px]" /> Name *</label>
                        <input type="text" name="name" required placeholder="Your full name" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} className={INPUT} />
                      </div>
                      <div>
                        <label className={LABEL}><FaBuilding className="text-[var(--primary)] text-[10px]" /> Company</label>
                        <input type="text" name="company" placeholder="Company name (optional)" value={clientForm.company} onChange={e => setClientForm({ ...clientForm, company: e.target.value })} className={INPUT} />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}><FaEnvelope className="text-[var(--primary)] text-[10px]" /> Email *</label>
                        <input type="email" required placeholder="john@example.com" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} className={INPUT} />
                      </div>
                      <div>
                        <label className={LABEL}><FaPhone className="text-[var(--primary)] text-[10px]" /> Phone *</label>
                        <input type="tel" required placeholder="05xxxxxxxx" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} className={INPUT} />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}><FaCalendarAlt className="text-[var(--primary)] text-[10px]" /> Event Date</label>
                        <input type="date" value={clientForm.date} onChange={e => setClientForm({ ...clientForm, date: e.target.value })} className={INPUT} />
                      </div>
                      <div>
                        <label className={LABEL}><FaBriefcase className="text-[var(--primary)] text-[10px]" /> Event Type</label>
                        <select value={clientForm.eventType} onChange={e => setClientForm({ ...clientForm, eventType: e.target.value })} className={INPUT}>
                          <option value="">Select Type</option>
                          <option value="corporate">Corporate Event</option>
                          <option value="promotion">Product Promotion</option>
                          <option value="exhibition">Exhibition / Trade Show</option>
                          <option value="private">Private Party</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}><FaFileAlt className="text-[var(--primary)] text-[10px]" /> Project Details *</label>
                      <textarea required rows={4} placeholder="Tell us about the event requirements, staff needed, etc." value={clientForm.message} onChange={e => setClientForm({ ...clientForm, message: e.target.value })} className={`${INPUT} resize-none`} />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                      {isSubmitting ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><FaPaperPlane className="text-xs" /> Send Inquiry</>}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div key="staff" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
                <div className="glass-card p-6 md:p-8 rounded-2xl border border-[var(--border)]">
                  <div className="mb-6">
                    <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-1">Join the A-Team</h2>
                    <p className="text-xs text-[var(--text-secondary)]">We're always looking for exceptional talent in UAE.</p>
                  </div>
                  <form onSubmit={handleStaffSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}><FaUser className="text-[var(--primary)] text-[10px]" /> Full Name *</label>
                        <input type="text" required placeholder="Your full name" value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} className={INPUT} />
                      </div>
                      <div>
                        <label className={LABEL}><FaPhone className="text-[var(--primary)] text-[10px]" /> Phone *</label>
                        <input type="tel" required placeholder="05xxxxxxxx" value={staffForm.phone} onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })} className={INPUT} />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}><FaEnvelope className="text-[var(--primary)] text-[10px]" /> Email *</label>
                      <input type="email" required placeholder="john@example.com" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className={INPUT} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}><FaBriefcase className="text-[var(--primary)] text-[10px]" /> Role *</label>
                        <select required value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} className={INPUT}>
                          <option value="">Select Role</option>
                          <option value="promoter">Event Promoter</option>
                          <option value="hostess">Host / Hostess</option>
                          <option value="model">Model</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="photographer">Photographer</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={LABEL}><FaCalendarAlt className="text-[var(--primary)] text-[10px]" /> Experience</label>
                        <select value={staffForm.experience} onChange={e => setStaffForm({ ...staffForm, experience: e.target.value })} className={INPUT}>
                          <option value="">Select Level</option>
                          <option value="entry">Entry Level (&lt; 1 yr)</option>
                          <option value="mid">Mid Level (1 – 3 yrs)</option>
                          <option value="senior">Senior / Pro (3+ yrs)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}><FaFileAlt className="text-[var(--primary)] text-[10px]" /> Why You? *</label>
                      <textarea required rows={4} placeholder="Tell us a bit about yourself and your past experience..." value={staffForm.message} onChange={e => setStaffForm({ ...staffForm, message: e.target.value })} className={`${INPUT} resize-none`} />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                      {isSubmitting ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><FaPaperPlane className="text-xs" /> Submit Application</>}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shortcut to jobs */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-5 glass-card p-4 rounded-2xl flex items-center justify-between gap-4 border border-[var(--border)] flex-wrap">
            <div>
              <p className="font-bold text-sm text-[var(--text-primary)]">Already have a profile?</p>
              <p className="text-xs text-[var(--text-secondary)]">Browse live event jobs and apply directly.</p>
            </div>
            <a href="/jobs" className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] hover:gap-3 transition-all shrink-0">
              Browse Jobs <FaArrowRight className="text-[10px]" />
            </a>
          </motion.div>
        </div>
      </section>

      <ChatBot />
      <Footer />
    </div>
  );
}
