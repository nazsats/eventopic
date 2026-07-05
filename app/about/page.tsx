"use client";

import Navbar from "../../components/Navbar";
import CursorGlow from "../../components/CursorGlow";
import Footer from "../../components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaRocket, FaUsers, FaHandshake, FaShieldAlt,
  FaLightbulb, FaHeart, FaArrowRight, FaMapMarkerAlt,
} from "react-icons/fa";

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "07", label: "Emirates covered" },
  { value: "30+", label: "Role types" },
  { value: "2025", label: "Built in" },
  { value: "15+ yrs", label: "Newlink Group backing" },
];

const VALUES = [
  { icon: <FaRocket />, title: "Speed & Efficiency", desc: "Hiring that takes minutes, not days." },
  { icon: <FaShieldAlt />, title: "Security First", desc: "Your data stays private, always." },
  { icon: <FaUsers />, title: "Quality Talent", desc: "Every profile is verified before booking." },
  { icon: <FaLightbulb />, title: "AI-Powered", desc: "Smart matching and 24/7 assistance." },
  { icon: <FaHandshake />, title: "Trust & Transparency", desc: "Clear rates, honest terms, no hidden fees." },
  { icon: <FaHeart />, title: "Client-Focused", desc: "Your deadline is our deadline." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function About() {
  return (
    <div className="bg-[var(--background)] min-h-screen">
      <CursorGlow />
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--primary)]/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--secondary)]/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(var(--primary)_1px,transparent_1px),linear-gradient(90deg,var(--primary)_1px,transparent_1px)] [background-size:60px_60px]" />
        </div>
        <div className="container mx-auto px-5 max-w-3xl text-center relative z-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-3">
            Who We Are
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4 leading-tight">
            A Young UAE Network That Has <span className="gradient-text">Worked the Floor.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-[var(--text-secondary)] text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-8">
            An event staffing agency supplying professional, well-presented and reliable
            staff for events, exhibitions, brand activations and private gatherings.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link href="/jobs" className="btn-primary px-7 py-3 font-bold text-sm inline-flex items-center justify-center gap-2">
              Explore Jobs <FaArrowRight />
            </Link>
            <Link href="/contact" className="btn-secondary px-7 py-3 text-sm text-center">
              Hire Staff
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="border-y border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border)]">
            {STATS.map((s, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, type: "spring" }}
                className="flex flex-col items-center py-6 px-4 text-center"
              >
                <div className="text-2xl md:text-3xl font-display font-black text-[var(--text-primary)] mb-1">{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── About Eventopic ── */}
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">The honest part first</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-4 leading-snug">
              Good Staffing Is Not Only <span className="gradient-text">About Appearance</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-6">
              Every event has its own atmosphere, audience and expectations. We focus on
              attitude, accountability and knowing how to stand for a brand the right way.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <FaMapMarkerAlt className="text-[var(--accent)] shrink-0" />
              International City, CBD 05, Office No. 8, Dubai, UAE
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Newlink Business Group ── */}
      <section className="py-16 md:py-20 bg-[var(--surface-elevated)] border-y border-[var(--border)]">
        <div className="container mx-auto px-5 max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">Built with Newlink Business Group</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-4 leading-snug">
              A Structured, Reliable Foundation <span className="gradient-text">Behind the Scenes</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-8">
              Eventopic is building its journey with Newlink Business Group — our sister company
              and trusted UAE partner — with the right paperwork, legal guidance and a responsible
              approach to the market.
            </p>
            <div className="inline-flex rounded-sm overflow-hidden shadow-[var(--shadow-md)]">
              {[["2010", "Established"], ["15+", "Years in the UAE"]].map(([v, l], i) => (
                <div key={l} className={`px-10 py-5 bg-[image:var(--gradient-primary)] text-center ${i === 1 ? "border-l border-white/20" : ""}`}>
                  <p className="font-display font-black text-2xl md:text-3xl text-white leading-none mb-1">{v}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold">{l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 md:py-24 bg-[var(--surface)]/20 border-y border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] bg-[var(--secondary)]/4 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-5 max-w-5xl relative z-10">
          <div className="text-center mb-9">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">
              Our Values
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              What We Stand For
            </motion.h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map((v, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="glass-card p-6 rounded-sm group hover:border-[var(--primary)]/25 border border-transparent transition-all hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/10 flex items-center justify-center text-[var(--primary)] text-sm mb-4 group-hover:scale-110 transition-transform">
                  {v.icon}
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-2">{v.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we do ── */}
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="text-center mb-9">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">
              What We Do
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              Staffing & Consultancy, <span className="gradient-text">End to End</span>
            </motion.h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { title: "Professional Staffing", desc: "Verified hostesses, promoters, models and hospitality staff — briefed before day one." },
              { title: "Workforce Solutions", desc: "Flexible teams for exhibitions, activations, kiosks and private gatherings." },
              { title: "Staffing Consultancy", desc: "We advise on roles, headcount and budget — then deliver the team." },
            ].map((item, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass-card p-6 rounded-sm group hover:border-[var(--primary)]/25 border border-transparent transition-all hover:-translate-y-1"
              >
                <h3 className="font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-24 relative overflow-hidden border-t border-[var(--border)]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--primary)]/8 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-5 max-w-2xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] mb-3 leading-snug">
              Join a Growing UAE <span className="gradient-text">Talent Community</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-8 max-w-sm mx-auto">
              Free to join. No hidden fees. Part-time and short-term work with trusted brands — real pay, on time.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link href="/jobs" className="btn-primary px-8 py-3.5 text-sm font-bold inline-flex items-center justify-center gap-2">
                Browse Jobs <FaArrowRight />
              </Link>
              <Link href="/contact" className="btn-secondary px-8 py-3.5 text-sm text-center">
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
