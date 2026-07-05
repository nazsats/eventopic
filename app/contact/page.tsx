"use client";

import Navbar from "../../components/Navbar";
import CursorGlow from "../../components/CursorGlow";
import Footer from "../../components/Footer";
import ChatBot from "../../components/ChatBot";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Confetti from "react-confetti";
import {
  FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBriefcase,
  FaPaperPlane, FaCalendarAlt, FaClock, FaBuilding, FaFileAlt,
  FaInstagram, FaArrowRight, FaCheckCircle, FaRedo,
} from "react-icons/fa";

const INFO_CARDS = [
  { icon: <FaBriefcase />, title: "Job Applications", detail: "hiring@eventopic.com", sub: "For talent & job seekers", link: "mailto:hiring@eventopic.com" },
  { icon: <FaEnvelope />, title: "Business Enquiries", detail: "info@eventopic.com", sub: "For clients & partners", link: "mailto:info@eventopic.com" },
  { icon: <FaInstagram />, title: "Instagram", detail: "@eventopic_official", sub: "Follow & DM us", link: "https://instagram.com/eventopic_official" },
  { icon: <FaMapMarkerAlt />, title: "Our Office", detail: "International City, CBD 05, Office No. 8, Dubai, UAE", sub: "Serving all 7 emirates" },
];

const INPUT = "w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-muted)] transition-all";
const LABEL = "flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1.5";

export default function Contact() {
  const [activeTab, setActiveTab] = useState<"client" | "staff">("client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | "client" | "staff">(null);
  const [confetti, setConfetti] = useState(false);
  const [win, setWin] = useState({ w: 0, h: 0 });

  const [clientForm, setClientForm] = useState({ name: "", company: "", email: "", phone: "", date: "", time: "", message: "" });
  const [staffForm, setStaffForm] = useState({ name: "", email: "", phone: "", role: "", experience: "", message: "" });

  useEffect(() => {
    const set = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    set();
    window.addEventListener("resize", set);
    if (window.location.hash === "#staff-form") {
      setActiveTab("staff");
      document.getElementById("contact-forms")?.scrollIntoView({ behavior: "smooth" });
    }
    return () => window.removeEventListener("resize", set);
  }, []);

  // International numbers welcome — just needs to look like a phone number.
  const validatePhone = (p: string) => /^\+?[\d\s\-()]{7,16}$/.test(p.trim());

  const celebrate = (which: "client" | "staff") => {
    setSubmitted(which);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 6000);
    document.getElementById("contact-forms")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(clientForm.phone)) { toast.error("Please enter a valid phone number."); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-client", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clientForm) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setClientForm({ name: "", company: "", email: "", phone: "", date: "", time: "", message: "" }); celebrate("client"); }
      else throw new Error(data.error || "Failed");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(staffForm.phone)) { toast.error("Please enter a valid phone number."); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(staffForm) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setStaffForm({ name: "", email: "", phone: "", role: "", experience: "", message: "" }); celebrate("staff"); }
      else throw new Error(data.error || "Failed");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="bg-[var(--background)] min-h-screen">
      {confetti && <Confetti width={win.w} height={win.h} recycle={false} numberOfPieces={300} gravity={0.25} colors={["#004643", "#B08D4A", "#2E7D74", "#D3B878", "#ffffff"]} className="!fixed !z-[400]" />}
      <CursorGlow />
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--primary)]/8 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.5] [background-image:var(--gradient-mesh)]" />
        </div>
        <div className="container mx-auto px-5 max-w-3xl text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-3">Get in Touch</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4 leading-tight text-[var(--text-primary)]">
            Let&apos;s <span className="gradient-text">Talk</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-[var(--text-secondary)] text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Tell us what you have in mind — we&apos;ll build the team. We usually reply within a day.
          </motion.p>
        </div>
      </section>

      {/* ── Info cards ── */}
      <div className="container mx-auto px-5 max-w-5xl pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INFO_CARDS.map((card, i) => {
            const inner = (
              <>
                <div className="w-9 h-9 mx-auto rounded-xl bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] text-sm mb-3 group-hover:scale-110 transition-transform">{card.icon}</div>
                <p className="font-bold text-xs text-[var(--text-primary)] mb-0.5">{card.title}</p>
                <p className={`text-xs font-semibold break-words ${card.link ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}>{card.detail}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{card.sub}</p>
              </>
            );
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={`glass-card p-5 rounded-sm text-center group ${!card.link ? "col-span-2 md:col-span-1" : ""}`}>
                {card.link ? <a href={card.link} target="_blank" rel="noopener noreferrer" className="block">{inner}</a> : inner}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Forms / success ── */}
      <section id="contact-forms" className="py-8 md:py-12 scroll-mt-24">
        <div className="container mx-auto px-5 max-w-2xl">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass-card p-8 md:p-12 rounded-sm text-center"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
                  className="w-20 h-20 mx-auto rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-white text-4xl mb-5 shadow-[var(--shadow-glow)]">
                  <FaCheckCircle />
                </motion.div>
                <h2 className="font-display font-black text-2xl md:text-3xl text-[var(--text-primary)] mb-2">
                  {submitted === "client" ? "Thanks — message received! 🎉" : "You're in the pool! 🎉"}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto mb-7">
                  {submitted === "client"
                    ? "We've got your request and will get back to you within a day to plan your staffing."
                    : "Thanks for applying. We'll review your details and reach out when a matching gig comes up."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {submitted === "staff" && (
                    <Link href="/jobs" className="btn-primary px-7 py-3 text-sm">Browse live jobs <FaArrowRight /></Link>
                  )}
                  <button onClick={() => setSubmitted(null)} className="btn-secondary px-7 py-3 text-sm">
                    <FaRedo /> Send another
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="forms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Tabs */}
                <div className="flex mb-7 p-1 rounded-sm bg-[var(--surface)] border border-[var(--border)] gap-1">
                  {([["client", "📋 I need staff"], ["staff", "🙌 I want work"]] as const).map(([tab, label]) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === tab ? "bg-[image:var(--gradient-primary)] text-white shadow-md" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                      {label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "client" ? (
                    <motion.div key="client" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.25 }}>
                      <div className="glass-card p-6 md:p-8 rounded-sm">
                        <div className="mb-6">
                          <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-1">Staff it like it matters</h2>
                          <p className="text-xs text-[var(--text-secondary)]">Share the basics — we&apos;ll build the team.</p>
                        </div>
                        <form onSubmit={handleClientSubmit} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={LABEL}><FaUser className="text-[var(--primary)] text-[10px]" /> Full name *</label>
                              <input type="text" required placeholder="Your full name" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} className={INPUT} />
                            </div>
                            <div>
                              <label className={LABEL}><FaBuilding className="text-[var(--primary)] text-[10px]" /> Company name</label>
                              <input type="text" placeholder="Company (optional)" value={clientForm.company} onChange={e => setClientForm({ ...clientForm, company: e.target.value })} className={INPUT} />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={LABEL}><FaEnvelope className="text-[var(--primary)] text-[10px]" /> Email *</label>
                              <input type="email" required placeholder="you@email.com" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} className={INPUT} />
                            </div>
                            <div>
                              <label className={LABEL}><FaPhone className="text-[var(--primary)] text-[10px]" /> Phone *</label>
                              <input type="tel" required placeholder="+971 5x xxx xxxx" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} className={INPUT} />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={LABEL}><FaCalendarAlt className="text-[var(--primary)] text-[10px]" /> Preferred date</label>
                              <input type="date" value={clientForm.date} onChange={e => setClientForm({ ...clientForm, date: e.target.value })} className={INPUT} />
                            </div>
                            <div>
                              <label className={LABEL}><FaClock className="text-[var(--primary)] text-[10px]" /> Preferred time</label>
                              <input type="time" value={clientForm.time} onChange={e => setClientForm({ ...clientForm, time: e.target.value })} className={INPUT} />
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}><FaFileAlt className="text-[var(--primary)] text-[10px]" /> Message / details *</label>
                            <textarea required rows={4} placeholder="Roles needed, how many staff, location, dates…" value={clientForm.message} onChange={e => setClientForm({ ...clientForm, message: e.target.value })} className={`${INPUT} resize-none`} />
                          </div>
                          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                            {isSubmitting ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><FaPaperPlane className="text-xs" /> Send request</>}
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="staff" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                      <div className="glass-card p-6 md:p-8 rounded-sm">
                        <div className="mb-6">
                          <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-1">Join our talent pool</h2>
                          <p className="text-xs text-[var(--text-secondary)]">Tell us a little about you. We&apos;ll be in touch when a matching gig opens up.</p>
                        </div>
                        <form onSubmit={handleStaffSubmit} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={LABEL}><FaUser className="text-[var(--primary)] text-[10px]" /> Full name *</label>
                              <input type="text" required placeholder="Your full name" value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} className={INPUT} />
                            </div>
                            <div>
                              <label className={LABEL}><FaPhone className="text-[var(--primary)] text-[10px]" /> Phone *</label>
                              <input type="tel" required placeholder="+971 5x xxx xxxx" value={staffForm.phone} onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })} className={INPUT} />
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}><FaEnvelope className="text-[var(--primary)] text-[10px]" /> Email *</label>
                            <input type="email" required placeholder="you@email.com" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className={INPUT} />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={LABEL}><FaBriefcase className="text-[var(--primary)] text-[10px]" /> Role *</label>
                              <select required value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} className={INPUT}>
                                <option value="">Select role</option>
                                <option value="promoter">Promoter</option>
                                <option value="hostess">Host / Hostess</option>
                                <option value="model">Model</option>
                                <option value="hospitality">Hospitality Staff</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="photographer">Photographer</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className={LABEL}><FaCalendarAlt className="text-[var(--primary)] text-[10px]" /> Experience</label>
                              <select value={staffForm.experience} onChange={e => setStaffForm({ ...staffForm, experience: e.target.value })} className={INPUT}>
                                <option value="">Select level</option>
                                <option value="entry">New to it (&lt; 1 yr)</option>
                                <option value="mid">Some experience (1–3 yrs)</option>
                                <option value="senior">Experienced (3+ yrs)</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}><FaFileAlt className="text-[var(--primary)] text-[10px]" /> About you *</label>
                            <textarea required rows={4} placeholder="A line or two about your experience and availability…" value={staffForm.message} onChange={e => setStaffForm({ ...staffForm, message: e.target.value })} className={`${INPUT} resize-none`} />
                          </div>
                          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                            {isSubmitting ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><FaPaperPlane className="text-xs" /> Submit</>}
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shortcut to jobs */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                  className="mt-5 glass-card p-4 rounded-sm flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-sm text-[var(--text-primary)]">Prefer to browse first?</p>
                    <p className="text-xs text-[var(--text-secondary)]">See live jobs and apply directly.</p>
                  </div>
                  <Link href="/jobs" className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] hover:gap-3 transition-all shrink-0">
                    Browse jobs <FaArrowRight className="text-[10px]" />
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <ChatBot />
      <Footer />
    </div>
  );
}
