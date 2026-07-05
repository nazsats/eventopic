"use client";

import Navbar from "../../components/Navbar";
import CursorGlow from "../../components/CursorGlow";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaLandmark, FaBuilding, FaShoppingBag, FaConciergeBell, FaBullhorn, FaBriefcase,
} from "react-icons/fa";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────
// Roles grouped for the compact mobile layout; flattened for the desktop cloud.
const ROLE_GROUPS = [
  { group: "Guest Services", roles: ["Hostess", "VIP Hostess", "Usher", "Greeter", "Receptionist", "Registration Staff"] },
  { group: "Promotion & Sales", roles: ["Promoter", "Sales Promoter", "Brand Ambassador", "Sampling Staff", "Lead Generator"] },
  { group: "Models & Creative", roles: ["Model", "Promotional Model", "Fashion Model", "Stand Speaker", "MC / Anchor"] },
  { group: "Events & Support", roles: ["Exhibition Staff", "Event Support Staff", "Hospitality Staff", "Customer Service Representative", "Temporary Corporate Staff", "Event Coordinator", "Team Leader", "Supervisor", "Security Staff"] },
];
const ROLES = ROLE_GROUPS.flatMap(g => g.roles);

const INDUSTRIES = [
  { icon: <FaLandmark />, title: "Events & Exhibitions", desc: "Expos, trade shows and conferences." },
  { icon: <FaBuilding />, title: "Real Estate", desc: "Kiosks, launches and open houses." },
  { icon: <FaShoppingBag />, title: "Retail & Malls", desc: "Activations, sampling and promotions." },
  { icon: <FaConciergeBell />, title: "Hospitality", desc: "Guest service and front-of-house." },
  { icon: <FaBullhorn />, title: "Marketing & Advertising", desc: "Campaigns and brand activations." },
  { icon: <FaBriefcase />, title: "Corporate", desc: "Temporary office and support staff." },
];

const OCCASIONS = [
  "Exhibitions", "Expos", "Trade Shows", "Real Estate Kiosks",
  "Brand Activations", "Corporate Promotions", "Mall Activations",
  "Product Launches", "Private Gatherings", "Marketing Campaigns",
];

const PROCESS = [
  { when: "Day 1", title: "Brief received", desc: "Event details, roles, dress code and standards." },
  { when: "Days 1–5", title: "Profiles screened", desc: "Interviewed and selected for skills and availability." },
  { when: "Days 5–7", title: "Client introduction", desc: "Profiles shared for your review and confirmation." },
  { when: "After contract", title: "Team prepared", desc: "Briefed on timing, location, attire and expectations." },
  { when: "Event day", title: "Event delivery", desc: "On-site support through the agreed hours." },
  { when: "After event", title: "Feedback", desc: "Follow-up that makes the next one better." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Services() {
  return (
    <div className="bg-[var(--background)] min-h-screen">
      <CursorGlow />
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
            Professional Staffing <span className="gradient-text">Solutions</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
            className="text-[var(--text-secondary)] text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-8">
            Professional, well-presented and reliable staff for events, exhibitions,
            brand activations and private gatherings.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link href="/jobs" className="btn-primary px-7 py-3 font-bold text-sm inline-flex items-center justify-center gap-2">
              Browse Live Jobs <FaArrowRight />
            </Link>
            <Link href="/contact" className="btn-secondary px-7 py-3 text-sm text-center">
              Hire Staff
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Roles we provide ── */}
      <section className="py-10 md:py-20 bg-[var(--background)] border-t border-[var(--border)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="text-center mb-10">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">
              Roles We Provide
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              Every Kind of <span className="gradient-text">Professional</span>
            </motion.h2>
          </div>

          {/* Mobile — grouped compact cards */}
          <div className="md:hidden space-y-3">
            {ROLE_GROUPS.map((g, gi) => (
              <motion.div
                key={g.group}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: gi * 0.05 }}
                className="glass-card p-4 rounded-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] mb-2.5">{g.group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.roles.map(role => (
                    <span key={role} className="px-2.5 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop — flat chip cloud */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="hidden md:flex flex-wrap justify-center gap-2.5"
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

      {/* ── Industries we serve ── */}
      <section className="py-10 md:py-20 bg-[var(--surface-elevated)] border-y border-[var(--border)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="text-center mb-10">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">
              Industries We Serve
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              Wherever You Need <span className="gradient-text">Great People</span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-3 gap-2.5 md:gap-4">
            {INDUSTRIES.map((ind, i) => (
              <motion.div
                key={ind.title}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="glass-card p-3 md:p-6 rounded-sm group hover:border-[var(--primary)]/25 border border-transparent transition-all hover:-translate-y-1 text-center md:text-left"
              >
                <div className="w-9 h-9 md:w-11 md:h-11 mx-auto md:mx-0 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center text-white text-sm md:text-base mb-2.5 md:mb-4 group-hover:scale-110 transition-transform shadow-[var(--shadow-sm)]">
                  {ind.icon}
                </div>
                <h3 className="font-bold text-[11px] md:text-sm text-[var(--text-primary)] mb-1 leading-tight">{ind.title}</h3>
                <p className="hidden md:block text-xs text-[var(--text-secondary)] leading-relaxed">{ind.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where we staff ── */}
      <section className="py-10 md:py-20 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="text-center mb-10">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">
              Where We Staff
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              Staffing for Every <span className="gradient-text">Occasion</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2.5"
          >
            {OCCASIONS.map((occ, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                whileHover={{ scale: 1.04, y: -2 }}
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[var(--primary-muted)] border border-[var(--border)] hover:border-[var(--primary)]/40 cursor-default transition-all"
              >
                <span className="text-[var(--primary)] text-xs md:text-sm font-semibold">{occ}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-10 md:py-20 bg-[var(--surface-elevated)] border-t border-[var(--border)] relative overflow-hidden">
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
              className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              From Brief to <span className="gradient-text">Feedback</span>
            </motion.h2>
          </div>

          {/* Mobile — compact 2-col step grid */}
          <div className="md:hidden grid grid-cols-2 gap-2.5">
            {PROCESS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="glass-card p-3.5 rounded-sm"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 shrink-0 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-white text-[9px] font-black">{i + 1}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)] leading-none">{item.when}</span>
                </div>
                <p className="font-bold text-xs text-[var(--text-primary)] mb-0.5">{item.title}</p>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Desktop — timeline rows */}
          <div className="hidden md:block max-w-3xl mx-auto space-y-2.5">
            {PROCESS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="glass-card px-5 py-4 rounded-sm flex items-center gap-5 hover:border-[var(--primary)]/25 border border-transparent transition-all"
              >
                <span className="shrink-0 w-28 text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">{item.when}</span>
                <span className="shrink-0 w-44 font-bold text-sm text-[var(--text-primary)]">{item.title}</span>
                <span className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
