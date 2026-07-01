"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import Footer from "../components/Footer";
import UAEGlobe from "../components/UAEGlobe";
import CursorGlow from "../components/CursorGlow";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight, FaBriefcase, FaMapMarkerAlt,
  FaCheckCircle, FaRocket, FaShieldAlt, FaUserCircle,
  FaChartBar, FaRobot, FaStar, FaBolt,
  FaGlobe, FaClock, FaQuoteLeft, FaFire, FaCrown,
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

// ─── Service categories (animated, image-free) ───
const CATEGORIES = [
  { label: "Hostesses & Ushers", emoji: "💁", blurb: "The faces of your event — warm, polished, on-brand.", grad: "from-[#1D4ED8] to-[#3B82F6]", roles: ["Hostess", "Usher", "VIP Host", "Registration", "Greeter"] },
  { label: "Models & Entertainment", emoji: "🎭", blurb: "Runway, promo models, dancers, MCs & performers.", grad: "from-[#2563EB] to-[#93C5FD]", roles: ["Model", "Dancer", "MC", "DJ", "Performer"] },
  { label: "Promoters & Brand", emoji: "📢", blurb: "Activation crews that get people talking.", grad: "from-[#2563EB] to-[#60A5FA]", roles: ["Promoter", "Brand Ambassador", "Sampling", "Sales", "Lead Gen"] },
  { label: "Hospitality", emoji: "🍸", blurb: "Waitstaff, bartenders & catering, service-ready.", grad: "from-[#1E3A8A] to-[#60A5FA]", roles: ["Waiter", "Bartender", "Barista", "Catering", "Steward"] },
];

const ROLE_MARQUEE = [
  "Hostess", "Promoter", "Model", "DJ", "Bartender", "Usher", "Brand Ambassador", "Dancer",
  "Photographer", "MC", "Waiter", "Sampling Staff", "Registration", "Greeter", "Barista",
  "VIP Host", "Lead Generator", "Performer", "Videographer", "Event Coordinator",
];

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
      whileHover={{ y: -6 }}
      onClick={() => onApply(job.id)}
      className="group cursor-pointer glass-card p-5 rounded-2xl"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
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
        <span className="font-black text-[var(--primary)] text-sm">
          AED {job.rate}
          <span className="font-normal text-[var(--text-muted)] text-[10px] ml-0.5">/{job.paymentFrequency ?? "Day"}</span>
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
      className="group relative glass-card p-6 rounded-2xl"
    >
      <div className="absolute top-0 right-0 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-bl-xl rounded-tr-2xl bg-[var(--primary-muted)] text-[var(--primary)] border-l border-b border-[var(--border)]">
        {tag}
      </div>
      <div className="w-12 h-12 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center text-lg text-white mb-4 group-hover:scale-110 transition-transform shadow-[var(--shadow-sm)]">
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
      <div className="shrink-0 w-10 h-10 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-white text-sm font-black shadow-[var(--shadow-glow)]">
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
    { label: "Role Types", value: "30+", icon: <FaStar /> },
    { label: "Launched", value: "2025", icon: <FaGlobe /> },
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
    { quote: "Clear AED rates up front and payment on time — no chasing, no surprises.", name: "Fair, on-time pay", role: "For staff" },
    { quote: "Track every application's status in your dashboard, in real time.", name: "Always in the loop", role: "For staff" },
    { quote: "Real people review every booking — you deal with us, not a faceless agency.", name: "A team that answers", role: "For staff & clients" },
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
          <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/10 blur-[120px]" />
          <div className="absolute -bottom-48 -right-32 w-[700px] h-[700px] rounded-full bg-[var(--secondary)]/10 blur-[140px]" />
          <div className="absolute inset-0 opacity-[0.5] [background-image:var(--gradient-mesh)]" />
        </div>

        <div className="container mx-auto px-5 max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: staffing-focused copy */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] mb-6 text-xs font-bold text-[var(--primary)]"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                The UAE&apos;s Event Staffing Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display font-extrabold leading-[1.03] tracking-tight mb-5 text-[var(--text-primary)] text-4xl sm:text-5xl md:text-6xl"
              >
                Staffing for Events, <span className="gradient-text">Promos &amp; Part-Time Work.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22 }}
                className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Eventopic connects hostesses, promoters, models and hospitality staff with events,
                promotions and part-time work across the UAE. <span className="text-[var(--text-primary)] font-semibold">Looking for work? Get booked.
                Need staff? We&apos;ll help you hire reliable people.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.35 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 mb-7"
              >
                <Link href="/jobs" className="btn-primary px-8 py-3.5 text-base rounded-full">
                  Find Event Work <FaArrowRight />
                </Link>
                <Link href="/contact" className="btn-secondary px-7 py-3.5 text-base rounded-full">
                  <FaCrown className="text-[var(--primary)]" /> Hire Staff
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5"
              >
                {["Events, promos & part-time", "All 7 emirates", "Paid in AED", "Free to join"].map(t => (
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

      {/* ════════════════ LIVE STATS ════════════════ */}
      <div className="border-y border-[var(--border)] bg-[var(--surface)] relative z-30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border)]">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, type: "spring" }}
                className="flex flex-col items-center gap-1 py-6 px-4 text-center group"
              >
                <div className={`text-[var(--primary)] text-sm ${s.live ? "animate-pulse" : ""}`}>{s.icon}</div>
                <div className="text-2xl md:text-3xl font-display font-black text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1">
                  {s.live && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />}
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ ROLES WE STAFF ════════════════ */}
      <section className="py-16 md:py-24 bg-[var(--background)] relative overflow-hidden">
        {/* aurora blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-10 -left-20 w-[420px] h-[420px] rounded-full bg-[var(--primary)]/8 blur-[120px] animate-drift" />
          <div className="absolute bottom-0 -right-24 w-[460px] h-[460px] rounded-full bg-[var(--secondary)]/8 blur-[130px] animate-drift" style={{ animationDelay: "4s" }} />
        </div>

        <div className="container mx-auto px-5 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">What we cover</p>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-[var(--text-primary)] leading-[1.05]">
                Every Role Your<br /><span className="gradient-text">Event Needs.</span>
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs md:text-right leading-relaxed">
              From front-of-house to the after-party — vetted UAE talent for events, promotions and part-time work.
            </p>
          </div>

          {/* Category cards with rotating gradient borders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {CATEGORIES.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link href="/services" className="relative block rounded-[26px] p-[1.5px] overflow-hidden shadow-[var(--shadow-sm)] group-hover:shadow-[var(--shadow-lg)] transition-shadow">
                  {/* rotating conic ring (revealed on hover) */}
                  <div className="absolute inset-[-150%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(from_0deg,var(--accent),var(--secondary),var(--accent))] animate-spin-slow" />
                  <div className="relative rounded-[24px] p-5 min-h-[270px] flex flex-col bg-[image:var(--gradient-royal)] overflow-hidden">
                    {/* sheen + grain */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.4),transparent_55%)] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -bottom-8 -right-6 text-[7rem] leading-none opacity-15 group-hover:opacity-25 group-hover:scale-110 transition-all duration-500 select-none">{c.emoji}</div>

                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                      className="relative w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg mb-4 shrink-0"
                    >
                      {c.emoji}
                    </motion.div>

                    <div className="relative flex-1">
                      <h3 className="font-display font-bold text-white text-lg leading-tight">{c.label}</h3>
                      <p className="text-[12px] text-white/80 mt-1.5 leading-relaxed">{c.blurb}</p>
                    </div>

                    {/* role chips */}
                    <div className="relative flex flex-wrap gap-1.5 mt-4">
                      {c.roles.slice(0, 4).map((r) => (
                        <span key={r} className="text-[10px] font-semibold text-white bg-white/15 border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">{r}</span>
                      ))}
                      <span className="text-[10px] font-semibold text-white/70 px-1 py-0.5">+more</span>
                    </div>

                    <span className="relative inline-flex items-center gap-1 text-xs font-bold text-white mt-4 group-hover:gap-2.5 transition-all">
                      View roles <FaArrowRight className="text-[10px]" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* infinite role marquee */}
          <div className="mt-10 marquee-mask overflow-hidden">
            <div className="flex gap-3 w-max animate-marquee">
              {[...ROLE_MARQUEE, ...ROLE_MARQUEE].map((r, i) => (
                <span key={i} className="shrink-0 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-full shadow-[var(--shadow-sm)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" /> {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="py-16 md:py-24 bg-[var(--surface-elevated)] border-y border-[var(--border)] relative overflow-hidden">
        <div className="container mx-auto px-5 max-w-5xl relative z-10">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">For Talent</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-3 leading-snug">
                Hired at Dubai&apos;s Top Events <span className="gradient-text">in 3 Steps</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mb-7 leading-relaxed">
                No lengthy forms, no gatekeeping. Sign up, set up your profile once, and apply to exclusive event jobs — all from your phone.
              </p>
              {!user && (
                <button onClick={openSignUp} className="btn-primary px-7 py-3 text-sm">
                  Get Started Free <FaArrowRight />
                </button>
              )}
            </div>
            <div className="space-y-6">
              {[
                { num: "1", title: "Create your free account", desc: "Sign up in seconds. Your data stays private and secure behind Firebase Authentication." },
                { num: "2", title: "Build your profile", desc: "Add photos, skills, and a resume — auto-saved to your account. Only you can see and edit it." },
                { num: "3", title: "Browse & apply instantly", desc: "Live event jobs, apply with one tap (form auto-fills from your profile), and track status on your dashboard." },
              ].map((s, i) => <Step key={i} {...s} delay={i * 0.1} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURED JOBS ════════════════ */}
      <section className="py-16 md:py-20 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-3">
            <div>
              <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-1.5">Live Now</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
                Featured <span className="gradient-text">Opportunities</span>
              </h2>
            </div>
            <Link href="/jobs" className="flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:gap-3 transition-all shrink-0">
              All Jobs <FaArrowRight />
            </Link>
          </div>

          {isLoadingJobs ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 rounded-2xl skeleton" />)}
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
              className="mt-7 glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-[var(--text-primary)] mb-0.5 text-sm">Sign in to apply for any job</p>
                <p className="text-xs text-[var(--text-secondary)]">Your profile auto-fills the form. Under 2 minutes.</p>
              </div>
              <button onClick={openSignUp} className="btn-primary px-6 py-2.5 text-sm shrink-0 whitespace-nowrap">
                Join Free <FaArrowRight />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="py-16 md:py-24 bg-[var(--surface-elevated)] border-y border-[var(--border)] relative overflow-hidden">
        <div className="container mx-auto px-5 max-w-5xl relative z-10">
          <div className="text-center mb-10">
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">Platform Features</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-3">
              Everything You Need, <span className="gradient-text">All in One Place</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-sm max-w-lg mx-auto">
              Eventopic is more than a job board — it&apos;s a full career platform built for Dubai&apos;s event industry.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ════════════════ AI HIGHLIGHT ════════════════ */}
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary-muted)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold mb-4">
                <FaRobot /> AI-Powered
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-3 leading-snug">
                Your 24/7 AI Career Assistant
              </h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-5">
                Ask our AI anything — &quot;What jobs are available for models?&quot;, &quot;How do I complete my profile?&quot;, &quot;What&apos;s the pay for staffing?&quot; — instant answers powered by live data.
              </p>
              <ul className="space-y-2.5 mb-5">
                {["Live job browsing via chat", "Application status queries", "Profile completion guidance", "Event industry tips"].map(t => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <FaCheckCircle className="text-[var(--primary)] shrink-0 text-xs" /> {t}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[var(--text-muted)] italic">💬 Chat button is in the bottom-right corner — try it!</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass-card p-5 rounded-2xl">
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
                  { from: "user", text: "What event jobs are available right now?" },
                  { from: "ai", text: `There are ${liveJobCount || "several"} live jobs right now! Top picks: Event Host · Dubai Marina, Brand Promoter · JBR, Hostess · DIFC. Want help applying? 🚀` },
                  { from: "user", text: "How do I make my profile stand out?" },
                  { from: "ai", text: "Add a professional photo, fill all attributes, and upload your resume. Complete profiles get 3× more callbacks!" },
                ].map((m, i) => (
                  <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${m.from === "user"
                      ? "bg-[image:var(--gradient-primary)] text-white font-medium rounded-br-sm"
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
      <section className="py-16 md:py-24 bg-[var(--surface-elevated)] border-y border-[var(--border)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">Our promise</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              What You Can <span className="gradient-text">Expect</span>
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
                  <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed mb-5">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-white text-sm font-bold shrink-0">
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
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-[28px] overflow-hidden p-10 md:p-16 text-center"
          >
            <div className="absolute inset-0 gradient-animated" />
            {/* decorative floating orbs */}
            <motion.div animate={{ y: [0, -18, 0], x: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -left-6 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <motion.div animate={{ y: [0, 16, 0], x: [0, -12, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-12 right-0 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute inset-0 bg-[#0F1B2D]/30" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3 leading-snug">
                Ready to Work at Dubai&apos;s Best Events?
              </h2>
              <p className="text-white/80 text-sm md:text-base mb-8 max-w-md mx-auto">
                Join the professionals who found their next event role through Eventopic. Free forever.
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

      {/* Mobile sticky CTA — only for guests */}
      {!user && (
        <motion.div
          initial={{ y: 80 }} animate={{ y: 0 }} transition={{ delay: 1.2, type: "spring" }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--border)] px-4 py-3 flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">Start your event career today</p>
            <p className="text-[10px] text-[var(--text-muted)]">Free · Takes 2 minutes</p>
          </div>
          <button onClick={openSignUp} className="btn-primary px-5 py-2.5 text-sm shrink-0">
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
