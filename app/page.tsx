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
  FaChartBar, FaRobot, FaBolt, FaCrown,
  FaUserPlus, FaIdBadge, FaSearch,
} from "react-icons/fa";
import { collection, getDocs, query, limit } from "firebase/firestore";
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

// ─── Staffing categories (from the company profile, animated, image-free) ───
const CATEGORIES = [
  { label: "Premium Guest Services & Hostesses", emoji: "💁", blurb: "The first faces your guests meet.", roles: ["Hostess", "VIP Hostess", "Usher", "Greeter"] },
  { label: "Promoters for Brand Activation", emoji: "📢", blurb: "Teams that get your brand talked about.", roles: ["Promoter", "Sales Promoter", "Brand Ambassador", "Sampling"] },
  { label: "Hospitality & F&B Staff", emoji: "🤝", blurb: "Service-ready staff for every venue.", roles: ["Hospitality Staff", "F&B Staff", "Guest Service", "Catering Support"] },
  { label: "Models, Influencers & Content Creators", emoji: "🌟", blurb: "Faces and creators for your campaign.", roles: ["Model", "Promotional Model", "Influencer", "Content Creator"] },
  { label: "Event Support On Site", emoji: "🎪", blurb: "Hands-on support that keeps events moving.", roles: ["Registration", "Exhibition Staff", "Team Leader", "Coordinator"] },
  { label: "Creative & Event Talents", emoji: "🎤", blurb: "MCs, speakers and creative professionals.", roles: ["MC / Anchor", "Stand Speaker", "Photographer", "Videographer"] },
];

const ROLE_MARQUEE = [
  "Hostess", "Promoter", "Model", "Brand Ambassador", "Sales Promoter", "Usher",
  "Registration Staff", "Exhibition Staff", "Hospitality Staff", "F&B Staff",
  "Greeter", "Sampling Staff", "Lead Generator", "VIP Hostess", "Event Support Staff",
  "Content Creator", "Receptionist", "Team Leader", "Event Coordinator", "Promotional Model",
];

// ─── Clients we've worked with ───
const CLIENTS = ["Newlink", "Go & Grab", "Nazsats"];

// ─── 5-step visual flow ───
const STEPS = [
  { icon: <FaUserPlus />, title: "Create Your Account" },
  { icon: <FaIdBadge />, title: "Build Your Profile" },
  { icon: <FaSearch />, title: "Browse Jobs" },
  { icon: <FaBolt />, title: "Apply Instantly" },
  { icon: <FaCheckCircle />, title: "Get Hired" },
];

// ─── Job Card (minimal) ───
function JobCard({ job, index, onApply }: { job: Job; index: number; onApply: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      whileHover={{ y: -6 }}
      onClick={() => onApply(job.id)}
      className="group cursor-pointer glass-card p-6 rounded-sm"
    >
      <div className="w-11 h-11 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-[var(--shadow-sm)]">
        <FaBriefcase />
      </div>
      <h3 className="font-bold text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
        {job.title}
      </h3>
      <p className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-4">
        <FaMapMarkerAlt className="text-[var(--accent)] text-[10px]" />{job.location}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
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
      className="group glass-card p-6 rounded-sm"
    >
      <div className="w-12 h-12 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center text-lg text-white mb-4 group-hover:scale-110 transition-transform shadow-[var(--shadow-sm)]">
        {icon}
      </div>
      <h3 className="font-bold text-base text-[var(--text-primary)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ─── Main ───
export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jSnap = await getDocs(query(collection(db, "jobs"), limit(6)));
        setJobs(jSnap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
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

  // Guests see a small curated set; signed-in users see the full grid.
  const featuredJobs = user ? jobs : jobs.slice(0, 3);

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
          <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/10 blur-[120px]" />
          <div className="absolute -bottom-48 -right-32 w-[700px] h-[700px] rounded-full bg-[var(--secondary)]/10 blur-[140px]" />
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
                className="font-display font-extrabold leading-[1.03] tracking-tight mb-5 text-[var(--text-primary)] text-4xl sm:text-5xl md:text-6xl"
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

      {/* ════════════════ TRUSTED BY ════════════════ */}
      <div className="border-y border-[var(--border)] bg-[var(--surface)] relative z-30 overflow-hidden">
        {/* faint brand glow behind the strip */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-[var(--primary)]/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="relative py-12">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold mb-8"
          >
            Trusted by brands across the UAE
          </motion.p>

          {/* auto-scrolling logo marquee — pauses on hover */}
          <div className="marquee-mask overflow-hidden group">
            <div className="flex gap-5 w-max animate-marquee group-hover:[animation-play-state:paused]">
              {[...CLIENTS, ...CLIENTS, ...CLIENTS, ...CLIENTS].map((name, i) => (
                <div
                  key={i}
                  className="relative shrink-0 rounded-sm p-[1px] bg-gradient-to-br from-[var(--border)] via-transparent to-[var(--border)] hover:from-[var(--accent)]/60 hover:to-[var(--primary)]/40 transition-all duration-500"
                >
                  <div className="flex items-center gap-3 px-10 py-5 rounded-sm bg-[var(--surface)] hover:bg-[var(--surface-elevated)]/70 transition-colors duration-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    <span className="font-display font-bold text-xl text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors tracking-tight whitespace-nowrap">
                      {name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
              From guest services to on-site support — the right people for every occasion.
            </p>
          </div>

          {/* Category cards with rotating gradient borders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
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
                <Link href="/services" className="relative block rounded-sm p-[1.5px] overflow-hidden shadow-[var(--shadow-sm)] group-hover:shadow-[var(--shadow-lg)] transition-shadow">
                  {/* rotating conic ring (revealed on hover) */}
                  <div className="absolute inset-[-150%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(from_0deg,var(--accent),var(--secondary),var(--accent))] animate-spin-slow" />
                  <div className="relative rounded-sm p-5 min-h-[240px] flex flex-col bg-[image:var(--gradient-royal)] overflow-hidden">
                    {/* sheen + grain */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.4),transparent_55%)] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -bottom-8 -right-6 text-[7rem] leading-none opacity-15 group-hover:opacity-25 group-hover:scale-110 transition-all duration-500 select-none">{c.emoji}</div>

                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                      className="relative w-12 h-12 rounded-sm bg-white/25 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg mb-4 shrink-0"
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

      {/* ════════════════ 5-STEP FLOW ════════════════ */}
      <section className="py-16 md:py-24 bg-[var(--surface-elevated)] border-y border-[var(--border)] relative overflow-hidden">
        <div className="container mx-auto px-5 max-w-5xl relative z-10">
          <div className="text-center mb-12">
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">For Talent</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              From Sign-Up to <span className="gradient-text">Hired</span>
            </h2>
          </div>

          <div className="relative">
            {/* connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--border-hover)] to-transparent" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-4">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="relative w-16 h-16 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-white text-xl shadow-[var(--shadow-md)] mb-3 group-hover:scale-110 transition-transform">
                    {s.icon}
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[10px] font-black text-[var(--primary)]">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">{s.title}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {!user && (
            <div className="text-center mt-12">
              <button onClick={openSignUp} className="btn-primary px-8 py-3 text-sm">
                Get Started Free <FaArrowRight />
              </button>
            </div>
          )}
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
              {[1, 2, 3].map(i => <div key={i} className="h-44 rounded-sm skeleton" />)}
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-sm">
              <p className="text-[var(--text-secondary)] text-sm">No jobs posted yet — check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {featuredJobs.map((job, i) => <JobCard key={job.id} job={job} index={i} onApply={handleJobClick} />)}
            </div>
          )}

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mt-7 glass-card rounded-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-[var(--text-primary)] mb-0.5 text-sm">There&apos;s more where these came from</p>
                <p className="text-xs text-[var(--text-secondary)]">Join free to see every live role and apply in one tap.</p>
              </div>
              <button onClick={openSignUp} className="btn-primary px-6 py-2.5 text-sm shrink-0 whitespace-nowrap">
                Join Free <FaArrowRight />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ════════════════ WHERE THE DIFFERENCE SHOWS ════════════════ */}
      <section className="py-16 md:py-24 bg-[var(--surface-elevated)] border-y border-[var(--border)] relative overflow-hidden">
        <div className="container mx-auto px-5 max-w-5xl relative z-10">
          <div className="text-center mb-10">
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">Why us</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-3">
              Where the <span className="gradient-text">Difference Shows</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto">
              Good staffing is not only about appearance — it&apos;s attitude, accountability
              and representing your brand the right way.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIFFERENCE.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ════════════════ AI ASSISTANT ════════════════ */}
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary-muted)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold mb-4">
                <FaRobot /> Eventopic AI
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-3 leading-snug">
                Your Personal <span className="gradient-text">Career Assistant</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                It recommends the right jobs, helps you discover better opportunities, and answers your questions — any time.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Job recommendations", "Career guidance", "Instant answers"].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-muted)] border border-[var(--border)] px-3 py-1.5 rounded-full">
                    <FaCheckCircle className="text-[10px]" /> {t}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass-card p-5 rounded-sm">
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
      <section className="py-16 md:py-24 bg-[var(--surface-elevated)] border-y border-[var(--border)]">
        <div className="container mx-auto px-5 max-w-4xl">
          <div className="text-center mb-10">
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">What you can expect</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              Our <span className="gradient-text">Promise</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {PROMISE.map((m, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="glass-card p-7 rounded-sm"
              >
                <p className="font-display font-bold text-lg text-[var(--text-primary)] mb-0.5">{m.title}</p>
                <p className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-widest mb-5">{m.tagline}</p>
                <ul className="space-y-3">
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
      <section className="py-16 md:py-24 bg-[var(--background)]">
        <div className="container mx-auto px-5 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-sm overflow-hidden p-10 md:p-16 text-center"
          >
            <div className="absolute inset-0 gradient-animated" />
            {/* decorative floating orbs */}
            <motion.div animate={{ y: [0, -18, 0], x: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -left-6 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <motion.div animate={{ y: [0, 16, 0], x: [0, -12, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-12 right-0 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute inset-0 bg-[#00302E]/30" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3 leading-snug">
                Ready to Work with the UAE&apos;s Trusted Brands?
              </h2>
              <p className="text-white/80 text-sm md:text-base mb-8 max-w-md mx-auto">
                Join the professionals finding part-time and short-term work through Eventopic. Free forever.
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
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">Find part-time work today</p>
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
