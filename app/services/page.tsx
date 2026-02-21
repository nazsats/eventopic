"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import {
  FaLaptopCode, FaBolt, FaCheck, FaUsers, FaArrowRight,
  FaBriefcase, FaStar, FaHeadset, FaMoneyBillWave,
} from "react-icons/fa";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ROLES = [
  "Stand Speaker", "MC / Anchor", "Hostess", "VIP Hostess", "Promoter",
  "Sales Promoter", "Brand Ambassador", "Model", "Promotional Model",
  "Fashion Model", "Influencer", "Content Creator", "Photographer",
  "Videographer", "Reels Creator", "Dancer", "Singer", "DJ", "Musician",
  "Flash Mob Artist", "Live Artist", "Greeter", "Usher", "Receptionist",
  "Registration Staff", "Sampling Staff", "Lead Generator",
  "Event Coordinator", "Team Leader", "Event Manager", "Security Staff", "Bouncer",
];

const PROCESS = [
  { step: "01", icon: <FaLaptopCode />, title: "Create Profile", desc: "Join for free and showcase your skills to top Dubai brands in minutes." },
  { step: "02", icon: <FaBolt />, title: "Browse & Apply", desc: "Browse live roles and apply with one tap — your profile auto-fills everything." },
  { step: "03", icon: <FaCheck />, title: "Get Hired", desc: "Receive offers, confirm details, and show up to your event ready to perform." },
  { step: "04", icon: <FaMoneyBillWave />, title: "Get Paid", desc: "Secure, timely payments processed through the platform. No chasing needed." },
];

const WHY = [
  { icon: <FaBriefcase />, title: "32+ Role Types", desc: "From models to MCs — every event role you can imagine." },
  { icon: <FaStar />, title: "Top-Tier Events", desc: "Work at flagship Dubai venues, exhibitions, and luxury galas." },
  { icon: <FaHeadset />, title: "24 / 7 AI Support", desc: "Our AI assistant guides you around the clock." },
  { icon: <FaUsers />, title: "Verified Community", desc: "All professionals are ID-verified through Firebase Auth." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Services() {
  return (
    <div className="bg-[var(--background)] min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--primary)]/8 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(var(--primary)_1px,transparent_1px),linear-gradient(90deg,var(--primary)_1px,transparent_1px)] [background-size:60px_60px]" />
        </div>
        <div className="container mx-auto px-5 max-w-3xl text-center relative z-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-3">
            What We Offer
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4 leading-tight">
            Staffing <span className="gradient-text">Solutions</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
            className="text-[var(--text-secondary)] text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-8">
            Dubai's most comprehensive event staffing platform — connecting brands with skilled professionals 24/7 through smart technology.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link href="/jobs" className="btn-primary px-7 py-3 font-bold text-sm inline-flex items-center justify-center gap-2">
              Browse Live Jobs <FaArrowRight />
            </Link>
            <Link href="/contact" className="px-7 py-3 rounded-full border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-secondary)] hover:text-white text-sm font-bold transition-all text-center">
              Hire Staff
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Why choose us ── */}
      <section className="py-12 border-y border-[var(--border)] bg-[var(--surface)]/30">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WHY.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="glass-card p-5 rounded-2xl text-center group hover:border-[var(--primary)]/30 border border-transparent transition-all"
              >
                <div className="w-9 h-9 mx-auto rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] text-sm mb-3 group-hover:scale-110 transition-transform">
                  {w.icon}
                </div>
                <p className="font-bold text-sm text-[var(--text-primary)] mb-1">{w.title}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles grid ── */}
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="text-center mb-10">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">
              All Role Types
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              We Cover Every <span className="gradient-text">Event Role</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--text-secondary)] text-sm max-w-md mx-auto">
              From front-of-house talent to technical support — our network has every profession covered.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2.5"
          >
            {ROLES.map((role, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: i * 0.015 }}
                whileHover={{ scale: 1.04, y: -2 }}
                className="px-4 py-2 rounded-full glass-card border border-transparent hover:border-[var(--primary)]/30 cursor-default transition-all"
              >
                <span className="text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors">{role}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 md:py-24 bg-[var(--surface)]/20 border-y border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--secondary)]/5 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-5 max-w-5xl relative z-10">
          <div className="text-center mb-10">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">
              How It Works
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              From Sign-Up to <span className="text-[var(--accent)]">Pay Day</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--text-secondary)] text-sm max-w-md mx-auto">
              A cutting-edge platform that removes the bottlenecks of traditional staffing agencies.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {PROCESS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl text-center group hover:border-[var(--primary)]/30 border border-transparent transition-all hover:-translate-y-1"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-xl text-[var(--primary)] group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center font-black text-black text-[10px] shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary)]/5 to-[var(--primary)]/10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-5 max-w-2xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3 leading-snug">
              Need Staff for Your <span className="gradient-text">Event?</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-8 max-w-md mx-auto">
              We provide 24/7 support for event clients and professionals alike. Get in touch today.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link href="/contact" className="btn-primary px-8 py-3.5 text-sm font-bold inline-flex items-center justify-center gap-2">
                Contact Us <FaArrowRight />
              </Link>
              <Link href="/jobs" className="px-8 py-3.5 rounded-full border border-white/20 hover:border-[var(--primary)] text-white font-bold text-sm transition-all text-center">
                <FaUsers className="inline mr-2 text-xs" />Browse Jobs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
