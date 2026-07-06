"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CursorGlow from "../components/CursorGlow";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight, FaBriefcase,
  FaCheckCircle, FaRocket, FaShieldAlt, FaUserCircle,
  FaChartBar, FaRobot, FaBolt, FaCrown,
  FaUserPlus, FaIdBadge, FaSearch,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/AuthModal";

// Code-split the heavy, non-critical pieces so the first paint is light.
const UAEGlobe = dynamic(() => import("../components/UAEGlobe"), {
  ssr: false,
  loading: () => <div className="w-full max-w-[520px] aspect-square" aria-hidden />,
});
const ChatBot = dynamic(() => import("../components/ChatBot"), { ssr: false });

// ─── Brand values, woven in subtly ───
const BRAND_TAGS = ["Human-first", "Reliable", "Transparent", "Diverse talent"];

// ─── 5-step visual flow ───
const STEPS = [
  { icon: <FaUserPlus />, title: "Create Your Account" },
  { icon: <FaIdBadge />, title: "Build Your Profile" },
  { icon: <FaSearch />, title: "Browse Jobs" },
  { icon: <FaBolt />, title: "Apply Instantly" },
  { icon: <FaCheckCircle />, title: "Get Hired" },
];

// ─── Feature Card (icon + title + one line) ───
function FeatureCard({ icon, title, desc, delay }: {
  icon: React.ReactNode; title: string; desc: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.35 }}
      className="group glass-card p-4 md:p-5 rounded-sm"
    >
      <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center text-sm md:text-base text-white mb-3 group-hover:scale-110 transition-transform shadow-[var(--shadow-sm)]">
        {icon}
      </div>
      <h3 className="font-bold text-xs md:text-sm text-[var(--text-primary)] mb-1 leading-snug">{title}</h3>
      <p className="text-[11px] md:text-xs text-[var(--text-secondary)] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ─── Main ───
export default function Home() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [promiseTab, setPromiseTab] = useState(0);

  const openSignUp = () => { setAuthMode("signup"); setIsAuthModalOpen(true); };

  const DIFFERENCE = [
    { icon: <FaBriefcase />, title: "The Right Fit", desc: "Profiles matched to the style and purpose of each occasion.", delay: 0 },
    { icon: <FaUserCircle />, title: "People Who Present Themselves", desc: "Punctual, well-presented and easy to work with.", delay: 0.06 },
    { icon: <FaChartBar />, title: "Clear Coordination", desc: "Selection, briefing and support — organized end to end.", delay: 0.12 },
    { icon: <FaShieldAlt />, title: "A Better Guest Experience", desc: "The right energy changes how people remember you.", delay: 0.18 },
  ];

  const PROMISE = [
    {
      title: "For the Client",
      tagline: "Hire with confidence",
      points: ["Legal and compliant staffing", "Responsible team management", "Professional profiles — trained when needed", "A smooth post-event experience"],
    },
    {
      title: "For the Staff",
      tagline: "Work with respect",
      points: ["A transparent and equal rate", "Proper contract and permit", "Key details ahead of time", "Payment within 14 days"],
    },
  ];

  return (
    <div className="bg-[var(--background)] min-h-screen selection:bg-[var(--primary)]/20">
      <CursorGlow />
      <Navbar />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-12 md:pt-32 md:pb-16">
        {/* Soft luxe background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[var(--background)]" />
          <div className="hidden md:block absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/10 blur-[120px]" />
          <div className="hidden md:block absolute -bottom-48 -right-32 w-[700px] h-[700px] rounded-full bg-[var(--secondary)]/10 blur-[140px]" />
          <div className="absolute inset-0 opacity-[0.5] [background-image:var(--gradient-mesh)]" />
        </div>

        <div className="container mx-auto px-5 max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: short, strong copy */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] mb-6 text-xs font-bold text-[var(--primary)]"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                United Arab Emirates
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display font-extrabold tracking-tight mb-5 text-[var(--text-primary)] text-4xl sm:text-5xl md:text-6xl"
              >
                An Event <span className="gradient-text">Staffing Agency.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22 }}
                className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Professional, well-presented and reliable staff for events, exhibitions,
                brand activations and private gatherings.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.35 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 mb-7"
              >
                <Link href="/jobs" className="btn-primary px-8 py-3.5 text-base rounded-full">
                  Find Work <FaArrowRight />
                </Link>
                <Link href="/contact" className="btn-secondary px-7 py-3.5 text-base rounded-full">
                  <FaCrown className="text-[var(--primary)]" /> Hire Staff
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5"
              >
                {["All 7 emirates", "30+ role types", "Built in 2025"].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-full shadow-[var(--shadow-sm)]">
                    <FaCheckCircle className="text-[var(--primary)] text-[10px]" /> {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: animated UAE globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex flex-col items-center"
            >
              <UAEGlobe />
              <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Drag to explore · UAE highlighted</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ BRAND STATEMENT (flows from hero) ════════════════ */}
      <section className="bg-[var(--background)] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[260px] bg-[var(--primary)]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-5 max-w-2xl relative pb-14 md:pb-20 text-center">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-3"
          >
            Staffing, made human
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="text-2xl md:text-4xl font-display font-bold text-[var(--text-primary)]"
          >
            The right people, ready for <span className="gradient-text">every event.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.4 }}
            className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto mt-4 leading-relaxed"
          >
            We match, brief and prepare each person with care — so your event runs
            smoothly and your brand looks its best.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2.5 mt-7"
          >
            {BRAND_TAGS.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-muted)] border border-[var(--border)] px-3.5 py-1.5 rounded-full">
                <FaCheckCircle className="text-[10px]" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════ 5-STEP FLOW ════════════════ */}
      <section className="py-14 md:py-20 bg-[var(--surface-elevated)] border-b border-[var(--border)] relative overflow-hidden">
        <div className="container mx-auto px-5 max-w-5xl relative z-10">
          <div className="text-center mb-7 md:mb-9">
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">For Talent</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              From Sign-Up to <span className="gradient-text">Hired</span>
            </h2>
          </div>

          <div className="relative">
            {/* connector line (desktop) */}
            <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--border-hover)] to-transparent" />
            {/* phones: swipeable snap row · md+: 5-column grid */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 -mx-5 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center group snap-center shrink-0 w-[104px] md:w-auto"
                >
                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-white text-base md:text-lg shadow-[var(--shadow-md)] mb-2.5 group-hover:scale-110 transition-transform">
                    {s.icon}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[9px] font-black text-[var(--primary)]">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-[var(--text-primary)] leading-snug">{s.title}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {!user && (
            <div className="text-center mt-6 md:mt-8">
              <button onClick={openSignUp} className="btn-primary px-8 py-3 text-sm">
                Get Started Free <FaArrowRight />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════ JOBS CTA ════════════════ */}
      <section className="py-12 md:py-16 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card rounded-sm p-7 md:p-10 text-center"
          >
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">New roles, every week</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-2">
              Find Work You&apos;ll <span className="gradient-text">Enjoy</span>
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5 md:mb-6">Hostessing, promotions, modelling and more — apply in minutes.</p>
            <Link href="/jobs" className="btn-primary w-full sm:w-auto sm:px-12 py-3.5 text-base rounded-full">
              Join Free <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ WHERE THE DIFFERENCE SHOWS ════════════════ */}
      <section className="py-14 md:py-20 bg-[var(--surface-elevated)] border-y border-[var(--border)] relative overflow-hidden">
        <div className="container mx-auto px-5 max-w-5xl relative z-10">
          <div className="text-center mb-6 md:mb-8">
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">Why us</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-3">
              Where the <span className="gradient-text">Difference Shows</span>
            </h2>
            <p className="hidden md:block text-[var(--text-secondary)] text-sm max-w-md mx-auto">
              Good staffing is not only about appearance — it&apos;s attitude, accountability
              and representing your brand the right way.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {DIFFERENCE.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ════════════════ AI ASSISTANT ════════════════ */}
      <section className="py-14 md:py-20 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary-muted)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold mb-3 md:mb-4">
                <FaRobot /> Eventopic AI
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-2 md:mb-3 leading-snug">
                Meet Your <span className="gradient-text">Career Assistant</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4 md:mb-5">
                It finds the right roles for you and answers your questions — 24/7.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {["Job recommendations", "Career guidance", "Instant answers"].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-muted)] border border-[var(--border)] px-3 py-1.5 rounded-full">
                    <FaCheckCircle className="text-[10px]" /> {t}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="hidden md:block glass-card p-5 rounded-sm">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                <div className="w-9 h-9 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-white text-sm">
                  <FaRobot />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Eventopic AI</p>
                  <p className="text-[10px] text-[var(--primary)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { from: "user", text: "What jobs fit my profile?" },
                  { from: "ai", text: "Based on your profile, you'd be great for: Exhibition Hostess · DWTC and Brand Promoter · JBR. Want me to help you apply? 🚀" },
                ].map((m, i) => (
                  <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-3.5 py-2 rounded-sm text-xs leading-relaxed ${m.from === "user"
                      ? "bg-[image:var(--gradient-primary)] text-white font-medium rounded-br-sm"
                      : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] rounded-bl-sm"
                      }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] italic mt-4">💬 Try it — bottom-right corner.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ OUR PROMISE ════════════════ */}
      <section className="py-14 md:py-20 bg-[var(--surface-elevated)] border-y border-[var(--border)]">
        <div className="container mx-auto px-5 max-w-4xl">
          <div className="text-center mb-6 md:mb-8">
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">What you can expect</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              Our <span className="gradient-text">Promise</span>
            </h2>
          </div>

          {/* Mobile — tab switcher keeps the section short */}
          <div className="md:hidden">
            <div className="flex p-1 rounded-full bg-[var(--surface)] border border-[var(--border)] gap-1 mb-4 max-w-xs mx-auto">
              {PROMISE.map((m, i) => (
                <button
                  key={m.title}
                  onClick={() => setPromiseTab(i)}
                  className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${promiseTab === i
                    ? "bg-[image:var(--gradient-primary)] text-white shadow-md"
                    : "text-[var(--text-secondary)]"}`}
                >
                  {m.title}
                </button>
              ))}
            </div>
            <motion.div
              key={promiseTab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className="glass-card p-5 rounded-sm"
            >
              <p className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-widest mb-3 text-center">{PROMISE[promiseTab].tagline}</p>
              <ul className="space-y-2.5">
                {PROMISE[promiseTab].points.map(p => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] leading-snug">
                    <FaCheckCircle className="text-[var(--primary)] shrink-0 text-xs mt-0.5" /> {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Desktop — compact side-by-side cards */}
          <div className="hidden md:grid md:grid-cols-2 gap-4">
            {PROMISE.map((m, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="glass-card p-6 rounded-sm"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <p className="font-display font-bold text-base text-[var(--text-primary)]">{m.title}</p>
                  <p className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-widest">{m.tagline}</p>
                </div>
                <ul className="space-y-2.5">
                  {m.points.map(p => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] leading-snug">
                      <FaCheckCircle className="text-[var(--primary)] shrink-0 text-xs mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="py-12 md:py-16 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-sm overflow-hidden p-10 md:p-14 text-center"
          >
            <div className="absolute inset-0 gradient-animated" />
            {/* decorative floating orbs */}
            <motion.div animate={{ y: [0, -18, 0], x: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:block absolute -top-10 -left-6 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <motion.div animate={{ y: [0, 16, 0], x: [0, -12, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:block absolute -bottom-12 right-0 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute inset-0 bg-[#00302E]/30" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3 leading-snug">
                Ready to Work with the UAE&apos;s Trusted Brands?
              </h2>
              <p className="text-white/80 text-sm md:text-base mb-8 max-w-md mx-auto">
                Join the people getting booked through Eventopic. Free to join, always.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                {!user ? (
                  <>
                    <button onClick={openSignUp} className="px-8 py-3.5 rounded-full bg-white text-[var(--primary)] font-bold text-sm inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[var(--shadow-md)]">
                      Join Free Today <FaRocket />
                    </button>
                    <Link href="/jobs" className="px-8 py-3.5 rounded-full border-2 border-white/60 text-white font-bold text-sm hover:bg-white/10 transition-all text-center">
                      Browse Jobs First
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/jobs" className="px-8 py-3.5 rounded-full bg-white text-[var(--primary)] font-bold text-sm inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[var(--shadow-md)]">
                      Find My Next Job <FaArrowRight />
                    </Link>
                    <Link href="/dashboard" className="px-8 py-3.5 rounded-full border-2 border-white/60 text-white font-bold text-sm hover:bg-white/10 transition-all text-center">
                      My Dashboard
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <ChatBot />
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode={authMode} />
    </div>
  );
}
