"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import Footer from "../components/Footer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight, FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave,
  FaCheckCircle, FaRocket, FaShieldAlt, FaUserCircle,
  FaChartBar, FaRobot, FaStar, FaBolt,
  FaGlobe, FaClock, FaQuoteLeft, FaFire,
} from "react-icons/fa";
import { collection, getDocs, query, limit, getCountFromServer } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/AuthModal";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  rate: number;
  paymentFrequency?: string;
  category: string;
}

// ─── Job Card ───
function JobCard({ job, index, onApply }: { job: Job; index: number; onApply: (id: string) => void }) {
  const catEmoji: Record<string, string> = {
    staffing: "👥", models_entertainment: "🎭", promotions: "📢", other: "✨",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      whileHover={{ y: -5 }}
      onClick={() => onApply(job.id)}
      className="group cursor-pointer glass-card p-5 rounded-2xl border border-transparent hover:border-[var(--primary)]/40 transition-all hover:shadow-lg hover:shadow-[var(--primary)]/5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
          <FaBriefcase />
        </div>
        <span className="text-xl">{catEmoji[job.category] ?? "✨"}</span>
      </div>
      <h3 className="font-bold text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
        {job.title}
      </h3>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)] mb-3">
        <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-[var(--accent)] text-[10px]" />{job.location}</span>
        <span className="flex items-center gap-1"><FaClock className="text-[10px]" />{job.type}</span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        <span className="font-black text-[var(--accent)] text-sm">
          AED {job.rate}
          <span className="font-normal text-[var(--text-secondary)] text-[10px] ml-0.5">/{job.paymentFrequency ?? "Day"}</span>
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] group-hover:gap-2 transition-all">
          Apply <FaArrowRight className="text-[10px]" />
        </span>
      </div>
    </motion.div>
  );
}

// ─── Feature Card ───
function FeatureCard({ icon, title, desc, tag, href, delay }: {
  icon: React.ReactNode; title: string; desc: string;
  tag: string; href: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.35 }}
      className="group relative glass-card p-6 rounded-2xl border border-transparent hover:border-[var(--primary)]/30 transition-all hover:-translate-y-1"
    >
      <div className="absolute top-0 right-0 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-bl-xl rounded-tr-2xl bg-[var(--primary)]/10 text-[var(--primary)] border-l border-b border-[var(--primary)]/20">
        {tag}
      </div>
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/10 flex items-center justify-center text-lg text-[var(--primary)] mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-base text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{desc}</p>
      <Link href={href} className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:gap-2.5 transition-all">
        Explore <FaArrowRight className="text-[10px]" />
      </Link>
    </motion.div>
  );
}

// ─── Step ───
function Step({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex gap-4"
    >
      <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-sm font-black shadow-lg shadow-[var(--primary)]/25">
        {num}
      </div>
      <div>
        <h4 className="font-bold text-[var(--text-primary)] mb-1 text-sm md:text-base">{title}</h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Main ───
export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [liveJobCount, setLiveJobCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jSnap, jobCount, appCount] = await Promise.all([
          getDocs(query(collection(db, "jobs"), limit(6))),
          getCountFromServer(collection(db, "jobs")),
          getCountFromServer(collection(db, "applications")),
        ]);
        setJobs(jSnap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
        setLiveJobCount(jobCount.data().count);
        setApplicationCount(appCount.data().count);
      } catch { /* silent */ }
      finally { setIsLoadingJobs(false); }
    };
    fetchData();
  }, []);

  const handleJobClick = (jobId: string) => {
    if (user) router.push(`/jobs/${jobId}`);
    else { setAuthMode("signin"); setIsAuthModalOpen(true); }
  };
  const openSignUp = () => { setAuthMode("signup"); setIsAuthModalOpen(true); };

  const STATS = [
    { label: "Live Jobs", value: liveJobCount > 0 ? `${liveJobCount}+` : "–", icon: <FaBriefcase />, live: true },
    { label: "Applications Filed", value: applicationCount > 0 ? `${applicationCount.toLocaleString()}+` : "–", icon: <FaFire />, live: true },
    { label: "Events Served", value: "50+", icon: <FaStar /> },
    { label: "Years in Dubai", value: "3+", icon: <FaGlobe /> },
  ];

  const FEATURES = [
    { icon: <FaBriefcase />, title: "Browse Live Jobs", desc: "Real event roles posted daily — staffing, modelling, promotions and more at Dubai's top venues.", tag: "Jobs", href: "/jobs", delay: 0 },
    { icon: <FaUserCircle />, title: "Build Your Profile", desc: "Create a standout profile with photos, skills and resume — secured behind your account.", tag: "Profile", href: "/profile", delay: 0.06 },
    { icon: <FaChartBar />, title: "Track Applications", desc: "Your personal dashboard shows every application's real-time status — pending, accepted, or rejected.", tag: "Dashboard", href: "/dashboard", delay: 0.12 },
    { icon: <FaRobot />, title: "AI Career Assistant", desc: "Our 24/7 AI chatbot answers questions, shows live jobs, and guides you to the right role.", tag: "AI", href: "#", delay: 0.18 },
    { icon: <FaShieldAlt />, title: "Secure & Private", desc: "All sensitive data is protected behind Firebase Auth — only you can access your profile.", tag: "Security", href: "/profile", delay: 0.24 },
    { icon: <FaBolt />, title: "Apply in Minutes", desc: "Your profile auto-fills the form. Get in front of hiring managers fast, right from your phone.", tag: "Fast", href: "/jobs", delay: 0.30 },
  ];

  const TESTIMONIALS = [
    { quote: "Got hired for a FIFA event within 2 days of joining. Incredible platform.", name: "Sara M.", role: "Event Host, Dubai" },
    { quote: "The dashboard makes it so easy to track my applications.", name: "Khalid R.", role: "Brand Ambassador" },
    { quote: "Applied at midnight on my phone, got a call the next morning.", name: "Priya S.", role: "Model & Promoter" },
  ];

  return (
    <div className="bg-[var(--background)] min-h-screen selection:bg-[var(--primary)]/30">
      <Navbar />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Gradient mesh background — pure CSS, no external script */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[var(--background)]" />
          {/* Large glowing orbs */}
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/10 blur-[120px] animate-pulse-slow" />
          <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-[var(--secondary)]/8 blur-[140px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--accent)]/5 blur-[100px]" />
          {/* Grid lines overlay */}
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(var(--primary)_1px,transparent_1px),linear-gradient(90deg,var(--primary)_1px,transparent_1px)] [background-size:60px_60px]" />
        </div>

        <div className="container mx-auto px-5 max-w-4xl text-center relative z-10">

          {/* Live pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 text-xs font-bold text-[var(--primary)]"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {liveJobCount > 0 ? `${liveJobCount} Live Event Jobs in Dubai` : "Dubai's #1 Event Staffing Platform"}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-black leading-[0.92] tracking-tight mb-5"
          >
            <span className="block text-5xl sm:text-6xl md:text-8xl gradient-text mb-2">EVENTOPIC</span>
            <span className="block text-xl sm:text-2xl md:text-3xl text-[var(--text-secondary)] font-normal tracking-normal mt-3">
              Find. Apply. Get Hired at Dubai's Best Events.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22 }}
            className="text-sm md:text-base text-[var(--text-secondary)] max-w-lg mx-auto mb-8 leading-relaxed"
          >
            Browse live event staffing roles, build a verified profile, apply in minutes, and track everything on your personal dashboard.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-10"
          >
            <Link href="/jobs" className="group relative px-8 py-3.5 bg-[var(--primary)] text-[var(--background)] font-bold text-base rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_35px_rgba(0,212,255,0.35)] text-center">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Browse Jobs <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>

            {!user ? (
              <button onClick={openSignUp} className="px-8 py-3.5 rounded-full border border-white/20 hover:border-[var(--primary)] hover:bg-white/5 text-white font-bold text-base transition-all">
                Create Free Account
              </button>
            ) : (
              <Link href="/dashboard" className="px-8 py-3.5 rounded-full border border-white/20 hover:border-[var(--primary)] hover:bg-white/5 text-white font-bold text-base transition-all text-center">
                My Dashboard
              </Link>
            )}
          </motion.div>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {["Free to join", "No hidden fees", "Real Dubai events", "24 / 7 AI support"].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-white/4 border border-white/8 px-3 py-1 rounded-full">
                <FaCheckCircle className="text-green-400 text-[10px]" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════ LIVE STATS ════════════════ */}
      <div className="border-y border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-sm relative z-30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border)]">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, type: "spring" }}
                className="flex flex-col items-center gap-1 py-5 px-4 text-center group"
              >
                <div className={`text-[var(--primary)] text-sm ${s.live ? "animate-pulse" : ""}`}>{s.icon}</div>
                <div className="text-2xl md:text-3xl font-display font-black text-white group-hover:text-[var(--primary)] transition-colors">{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1">
                  {s.live && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="py-16 md:py-24 bg-[var(--background)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-5 max-w-5xl relative z-10">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">
                How It Works
              </motion.p>
              <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-2xl md:text-3xl font-display font-bold text-white mb-3 leading-snug">
                Hired at Dubai's Top Events <span className="gradient-text">in 3 Steps</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="text-[var(--text-secondary)] text-sm mb-7 leading-relaxed">
                No lengthy forms, no gatekeeping. Sign up, set up your profile once, and apply to exclusive event jobs — all from your phone.
              </motion.p>
              {!user && (
                <button onClick={openSignUp} className="btn-primary px-7 py-3 inline-flex items-center gap-2 text-sm font-bold">
                  Get Started Free <FaArrowRight />
                </button>
              )}
            </div>
            <div className="space-y-6">
              {[
                { num: "1", title: "Create your free account", desc: "Sign up in seconds with email. Your data stays private and secure behind Firebase Authentication." },
                { num: "2", title: "Build your profile", desc: "Add a photo, skills, and a resume — auto-saved to your account. Only you can see and edit it." },
                { num: "3", title: "Browse & apply instantly", desc: "Live event jobs, apply with one tap (form auto-fills from your profile), and track status on your dashboard." },
              ].map((s, i) => <Step key={i} {...s} delay={i * 0.1} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURED JOBS ════════════════ */}
      <section className="py-16 md:py-20 bg-[var(--surface)]/20 border-y border-[var(--border)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-7 gap-3">
            <div>
              <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-1.5">Live Now</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
                Featured <span className="gradient-text">Opportunities</span>
              </h2>
            </div>
            <Link href="/jobs" className="flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:gap-3 transition-all shrink-0">
              All Jobs <FaArrowRight />
            </Link>
          </div>

          {isLoadingJobs ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <p className="text-[var(--text-secondary)] text-sm">No jobs posted yet — check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {jobs.map((job, i) => <JobCard key={job.id} job={job} index={i} onApply={handleJobClick} />)}
            </div>
          )}

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mt-7 glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--primary)]/20"
            >
              <div>
                <p className="font-bold text-[var(--text-primary)] mb-0.5 text-sm">Sign in to apply for any job</p>
                <p className="text-xs text-[var(--text-secondary)]">Your profile auto-fills the form. Under 2 minutes.</p>
              </div>
              <button onClick={openSignUp} className="btn-primary px-6 py-2.5 text-sm font-bold shrink-0 whitespace-nowrap">
                Join Free <FaArrowRight className="inline ml-1" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="py-16 md:py-24 bg-[var(--background)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[var(--secondary)]/5 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-5 max-w-5xl relative z-10">
          <div className="text-center mb-9">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">
              Platform Features
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              Everything You Need, <span className="text-[var(--accent)]">All in One Place</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-[var(--text-secondary)] text-sm max-w-lg mx-auto">
              Eventopic is more than a job board — it's a full career platform built for Dubai's event industry.
            </motion.p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ════════════════ AI HIGHLIGHT ════════════════ */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-[var(--primary)]/6 via-[var(--background)] to-[var(--secondary)]/6 border-y border-[var(--border)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 text-[var(--secondary)] text-xs font-bold mb-4">
                <FaRobot /> AI-Powered
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3 leading-snug">
                Your 24 / 7 AI Career Assistant
              </h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-5">
                Ask our AI anything — "What jobs are available for models?", "How do I complete my profile?", "What's the pay for staffing?" — instant answers powered by live data.
              </p>
              <ul className="space-y-2.5 mb-5">
                {["Live job browsing via chat", "Application status queries", "Profile completion guidance", "Event industry tips"].map(t => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <FaCheckCircle className="text-green-400 shrink-0 text-xs" /> {t}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[var(--text-muted)] italic">💬 Chat button is in the bottom-right corner — try it!</p>
            </motion.div>

            {/* Mock chat */}
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass-card p-5 rounded-2xl border border-[var(--secondary)]/20">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-sm">
                  <FaRobot />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Eventopic AI</p>
                  <p className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { from: "user", text: "What event jobs are available right now?" },
                  { from: "ai", text: `There are ${liveJobCount || "several"} live jobs right now! Top picks: Event Host · Dubai Marina, Brand Promoter · JBR, Hostess · DIFC. Want help applying? 🚀` },
                  { from: "user", text: "How do I make my profile stand out?" },
                  { from: "ai", text: "Add a professional photo, fill all physical attributes, and upload your resume. Complete profiles get 3× more callbacks!" },
                ].map((m, i) => (
                  <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${m.from === "user"
                        ? "bg-[var(--primary)] text-black font-medium rounded-br-sm"
                        : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] rounded-bl-sm"
                      }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="text-center mb-9">
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              Loved by Event <span className="text-[var(--primary)]">Professionals</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="glass-card p-6 rounded-2xl relative"
              >
                <FaQuoteLeft className="absolute top-5 left-5 text-2xl text-[var(--primary)]/15" />
                <div className="pt-5">
                  <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed mb-5">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--text-primary)]">{t.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary)]/5 to-[var(--primary)]/10 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/6 blur-[120px]" />
        </div>
        <div className="container mx-auto px-5 max-w-2xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3 leading-snug">
              Ready to Work at Dubai's <span className="gradient-text">Best Events?</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-8 max-w-sm mx-auto">
              Join professionals who found their next event role through Eventopic. Free forever.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              {!user ? (
                <>
                  <button onClick={openSignUp} className="btn-primary px-8 py-3.5 text-sm font-bold inline-flex items-center justify-center gap-2">
                    Join Free Today <FaRocket />
                  </button>
                  <Link href="/jobs" className="px-8 py-3.5 rounded-full border border-white/20 hover:border-[var(--primary)] text-white font-bold text-sm transition-all text-center">
                    Browse Jobs First
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/jobs" className="btn-primary px-8 py-3.5 text-sm font-bold inline-flex items-center justify-center gap-2">
                    Find My Next Job <FaArrowRight />
                  </Link>
                  <Link href="/dashboard" className="px-8 py-3.5 rounded-full border border-white/20 hover:border-[var(--primary)] text-white font-bold text-sm transition-all text-center">
                    My Dashboard
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile sticky CTA — only for guests */}
      {!user && (
        <motion.div
          initial={{ y: 80 }} animate={{ y: 0 }} transition={{ delay: 1.2, type: "spring" }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--border)] px-4 py-3 flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">Start your event career today</p>
            <p className="text-[10px] text-[var(--text-muted)]">Free · Takes 2 minutes</p>
          </div>
          <button onClick={openSignUp} className="btn-primary px-5 py-2.5 text-sm font-bold shrink-0">
            Join Free
          </button>
        </motion.div>
      )}

      <ChatBot />
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode={authMode} />
    </div>
  );
}
