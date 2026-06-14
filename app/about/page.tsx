"use client";

import Navbar from "../../components/Navbar";
import CursorGlow from "../../components/CursorGlow";
import DottedAvatar from "../../components/DottedAvatar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaRocket, FaUsers, FaHandshake, FaShieldAlt,
  FaLightbulb, FaHeart, FaArrowRight, FaMapMarkerAlt,
  FaLinkedin, FaInstagram,
} from "react-icons/fa";

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "3", label: "People on the team" },
  { value: "4 yrs", label: "In Dubai's event scene" },
  { value: "7", label: "Emirates covered" },
  { value: "2025", label: "Year we launched" },
];

const VALUES = [
  { icon: <FaRocket />, title: "Speed & Efficiency", desc: "We build technology that removes hiring friction — what used to take days now takes minutes." },
  { icon: <FaShieldAlt />, title: "Security First", desc: "All user data is protected behind Firebase Authentication. Your privacy is never an afterthought." },
  { icon: <FaUsers />, title: "Community-Driven", desc: "We grow together. Staff feedback shapes our platform, and every voice counts." },
  { icon: <FaLightbulb />, title: "AI-Powered", desc: "Our 24/7 AI assistant guides professionals to the right roles and answers questions instantly." },
  { icon: <FaHandshake />, title: "Trust & Transparency", desc: "No hidden fees, no shadowy agencies. Clear pay rates, verified listings, honest terms." },
  { icon: <FaHeart />, title: "People First", desc: "Behind every job posting is a person building their career. We take that seriously." },
];

const TEAM = [
  { name: "Naz", role: "Co-founder · Tech & Product", initial: "N", emoji: "💻", bio: "The engineer behind Eventopic. He's been taking things apart and building them back better since he was a kid, and he keeps the platform fast, reliable and genuinely useful." },
  { name: "San", role: "Co-founder · Growth & Partnerships", initial: "S", emoji: "🤝", bio: "Our connector. Confident and persistent, San is great with people and has a knack for finding a way through just about any problem." },
  { name: "Dor", role: "Operations Lead", initial: "D", emoji: "🗂️", bio: "Keeps everything moving. From bookings to on-the-day logistics, Dor makes the whole process feel effortless for staff and clients alike." },
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
A Small Team, <span className="gradient-text">Big on Reliability.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-[var(--text-secondary)] text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-8">
            Eventopic started because hiring (and finding) good staff in Dubai was harder than it needed to be. We&apos;re three people connecting staff with event, promotion and part-time work across the UAE — and we keep it simple and honest.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link href="/jobs" className="btn-primary px-7 py-3 font-bold text-sm inline-flex items-center justify-center gap-2">
              Explore Jobs <FaArrowRight />
            </Link>
            <Link href="/contact" className="btn-secondary px-7 py-3 text-sm text-center">
              Work With Us
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

      {/* ── Story ── */}
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">Our Story</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-4 leading-snug">
                Built by Event People, <br className="hidden md:block" /><span className="gradient-text">for Event People</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                After four years working in Dubai&apos;s event scene, the three of us kept hitting the same wall: hiring and finding reliable staff meant endless WhatsApp groups, middlemen, and last-minute scrambles. We knew it could be simpler.
              </p>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                So in 2025 we built Eventopic — a straightforward platform that connects staff with events, promotions and part-time work directly, tracks applications in real time, and skips the middleman.
              </p>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <FaMapMarkerAlt className="text-[var(--accent)] shrink-0" />
                Business Bay, Dubai, UAE
              </div>
            </motion.div>

            {/* Card visual */}
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-3">
              {[
                { title: "4 yrs", desc: "Between us, working Dubai's events, promotions and part-time staffing." },
                { title: "2025", desc: "Launched Eventopic — a live job board and talent platform for the UAE." },
                { title: "Now", desc: "Growing the talent pool and adding jobs across all 7 emirates." },
                { title: "Next", desc: "Smarter matching, faster bookings, and more roles beyond events." },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex gap-4 glass-card p-4 rounded-xl border border-transparent hover:border-[var(--primary)]/20 transition-all">
                  <div className="shrink-0 font-display font-black text-sm text-[var(--primary)] w-10">{item.title}</div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
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
                className="glass-card p-6 rounded-2xl group hover:border-[var(--primary)]/25 border border-transparent transition-all hover:-translate-y-1"
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

      {/* ── Team ── */}
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="text-center mb-9">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">
              The Team
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              People Behind <span className="gradient-text">Eventopic</span>
            </motion.h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {TEAM.map((member, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass-card p-6 rounded-2xl text-center group hover:border-[var(--primary)]/25 border border-transparent transition-all hover:-translate-y-1"
              >
                <div className="mb-5">
                  <DottedAvatar initial={member.initial} emoji={member.emoji} />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] mb-0.5">{member.name}</h3>
                <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mb-3">{member.role}</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{member.bio}</p>
                <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-[var(--border)]">
                  <button className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-muted)] transition-all text-xs">
                    <FaLinkedin />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-muted)] transition-all text-xs">
                    <FaInstagram />
                  </button>
                </div>
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
              Free to join. No hidden fees. Event, promotion and part-time work — real pay, on time.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link href="/jobs" className="btn-primary px-8 py-3.5 text-sm font-bold inline-flex items-center justify-center gap-2">
                Browse Jobs <FaArrowRight />
              </Link>
              <Link href="/contact" className="btn-secondary px-8 py-3.5 text-sm text-center">
                Contact the Team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}