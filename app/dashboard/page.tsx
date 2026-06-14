"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import CursorGlow from "../../components/CursorGlow";
import Footer from "../../components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Confetti from "react-confetti";
import {
  FaUser, FaMapMarkerAlt, FaBriefcase, FaEdit, FaCheckCircle,
  FaHourglassHalf, FaTimesCircle, FaFire, FaStar, FaTrophy,
  FaBolt, FaArrowRight, FaFileAlt, FaPaperPlane, FaMoneyBillWave,
  FaRegClock, FaMedal, FaLock,
} from "react-icons/fa";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Profile {
  firstName?: string; lastName?: string; city?: string; country?: string;
  profileImageUrl?: string; resumeUrl?: string; linkedinUrl?: string; instagramUrl?: string;
  nationality?: string; professionCategory?: string; professionSubcategory?: string;
  phoneNumber?: string; isProfileComplete?: boolean;
}
interface Application {
  id: string; jobId: string; status: "pending" | "accepted" | "rejected";
  timestamp: string; jobTitle?: string;
}
interface RecJob {
  id: string; title?: string; location?: string; rate?: number; category?: string; summary?: string;
}
type FilterType = "all" | "pending" | "accepted" | "rejected";

// Animated count-up
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}{suffix}</>;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<RecJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [confetti, setConfetti] = useState(false);
  const [win, setWin] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const set = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    set(); window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);

  useEffect(() => {
    if (!loading && !user) { router.push("/"); return; }
    if (!user) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [userDoc, appsSnap, jobsSnap] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          getDocs(query(collection(db, "applications"), where("userEmail", "==", user.email!))),
          getDocs(collection(db, "jobs")),
        ]);
        if (userDoc.exists()) setProfile(userDoc.data() as Profile);
        setJobs(jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RecJob)));

        const appsList = await Promise.all(
          appsSnap.docs.map(async (appDoc) => {
            const a = appDoc.data() as Application;
            try {
              const jobDoc = await getDoc(doc(db, "jobs", a.jobId));
              return { ...a, id: appDoc.id, jobTitle: jobDoc.exists() ? jobDoc.data().title : "Position (closed)" };
            } catch { return { ...a, id: appDoc.id, jobTitle: "Position" }; }
          })
        );
        appsList.sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime());
        setApplications(appsList);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
        toast.error("Failed to load your dashboard. Please refresh.");
      } finally { setIsLoading(false); }
    };
    fetchData();
  }, [user, loading, router]);

  const total = applications.length;
  const pendingApps = applications.filter((a) => a.status === "pending").length;
  const acceptedApps = applications.filter((a) => a.status === "accepted").length;
  const rejectedApps = applications.filter((a) => a.status === "rejected").length;
  const acceptRate = total ? Math.round((acceptedApps / total) * 100) : 0;

  // Celebrate a NEW acceptance since last visit — the "check back" dopamine loop.
  useEffect(() => {
    if (isLoading) return;
    const key = "eventopic-seen-accepted";
    const prev = Number(localStorage.getItem(key) || 0);
    if (acceptedApps > prev) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 6000);
    }
    localStorage.setItem(key, String(acceptedApps));
  }, [isLoading, acceptedApps]);

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    const fields = [profile.firstName, profile.lastName, profile.profileImageUrl, profile.resumeUrl,
    profile.city, profile.phoneNumber, profile.nationality, profile.professionCategory,
    profile.linkedinUrl || profile.instagramUrl];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profile]);

  const xp = useMemo(() => {
    let v = profile ? 500 : 0;
    v += total * 150;
    if (profile?.resumeUrl) v += 200;
    if (profile?.profileImageUrl) v += 100;
    if (profile?.linkedinUrl) v += 50;
    v += acceptedApps * 300;
    return v;
  }, [profile, total, acceptedApps]);
  const level = Math.floor(xp / 1000) + 1;
  const xpProgress = (xp % 1000) / 10;
  const xpToNext = 1000 - (xp % 1000);

  const recommended = useMemo(() => {
    if (!jobs.length) return [];
    const applied = new Set(applications.map((a) => a.jobId));
    const words = Array.from(new Set(`${profile?.professionSubcategory || ""} ${profile?.professionCategory || ""}`
      .replace(/_/g, " ").toLowerCase().split(" ").filter((w) => w.length > 2)));
    const city = (profile?.city || "").toLowerCase();
    return jobs.filter((j) => !applied.has(j.id)).map((j) => {
      let score = 1;
      const hay = `${j.title || ""} ${j.category || ""} ${j.summary || ""}`.toLowerCase();
      if (words.some((w) => hay.includes(w))) score += 5;
      if (city && (j.location || "").toLowerCase().includes(city)) score += 3;
      return { job: j, match: Math.min(98, 62 + score * 6), score };
    }).sort((a, b) => b.score - a.score).slice(0, 4);
  }, [jobs, applications, profile]);

  const filteredApps = useMemo(() => filter === "all" ? applications : applications.filter((a) => a.status === filter), [applications, filter]);

  const achievements = [
    { icon: <FaUser />, label: "Joined Eventopic", earned: true },
    { icon: <FaCheckCircle />, label: "Profile complete", earned: profileCompletion === 100 },
    { icon: <FaPaperPlane />, label: "First application", earned: total >= 1 },
    { icon: <FaFire />, label: "5 applications", earned: total >= 5 },
    { icon: <FaFileAlt />, label: "Resume added", earned: !!profile?.resumeUrl },
    { icon: <FaTrophy />, label: "Got accepted", earned: acceptedApps >= 1 },
  ];

  const statusData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [{
      data: [pendingApps || 0.0001, acceptedApps || 0.0001, rejectedApps || 0.0001],
      backgroundColor: ["#F59E0B", "#22C55E", "#EF4444"],
      borderWidth: 0, hoverOffset: 8,
    }],
  };

  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; })();
  const firstName = profile?.firstName || user?.displayName?.split(" ")[0] || "there";
  const avatarChar = (profile?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase();

  const statusMeta: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
    pending: { icon: <FaHourglassHalf />, cls: "text-amber-500 bg-amber-500/10 border-amber-500/20", label: "Pending" },
    accepted: { icon: <FaCheckCircle />, cls: "text-green-500 bg-green-500/10 border-green-500/20", label: "Accepted" },
    rejected: { icon: <FaTimesCircle />, cls: "text-red-500 bg-red-500/10 border-red-500/20", label: "Not selected" },
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen">
      {confetti && <Confetti width={win.w} height={win.h} recycle={false} numberOfPieces={320} gravity={0.25} colors={["#7C3AED", "#A855F7", "#C084FC", "#22C55E", "#ffffff"]} className="!fixed !z-[400]" />}
      <CursorGlow />
      <Navbar />

      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 [background-image:var(--gradient-mesh)] opacity-60" />
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[var(--primary)]/8 blur-[120px] animate-drift" />
          <div className="absolute bottom-10 -right-28 w-[480px] h-[480px] rounded-full bg-[var(--secondary)]/8 blur-[130px] animate-drift" style={{ animationDelay: "5s" }} />
        </div>
        <div className="container mx-auto px-4 max-w-6xl">

          {/* ── Hero / level card ── */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden p-6 md:p-8 mb-6 text-white">
            <div className="absolute inset-0 gradient-animated" />
            <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute -top-10 -right-6 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shrink-0 border border-white/30">
                {profile?.profileImageUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={profile.profileImageUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl font-black">{avatarChar}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{greeting}</p>
                <h1 className="font-display font-black text-2xl md:text-3xl leading-tight">{firstName} 👋</h1>
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-white/80">
                  <span className="flex items-center gap-1"><FaBriefcase className="text-[11px]" /> {total} applications</span>
                  {profile?.city && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-[11px]" /> {profile.city}</span>}
                </div>
              </div>
              {/* Level + XP */}
              <div className="w-full md:w-64 shrink-0 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-sm font-black"><FaBolt className="text-yellow-300" /> Level {level}</span>
                  <span className="text-[11px] text-white/70">{xpToNext} XP to next</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full bg-white" />
                </div>
                <p className="text-[10px] text-white/70 mt-1.5">{xp.toLocaleString()} XP total · earn more by applying</p>
              </div>
            </div>
            <div className="relative z-10 flex flex-wrap gap-3 mt-5">
              <Link href="/jobs" className="px-5 py-2.5 rounded-full bg-white text-[var(--primary)] text-sm font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-[var(--shadow-sm)]">
                Find new gigs <FaArrowRight className="text-xs" />
              </Link>
              <Link href="/profile?edit=true" className="px-5 py-2.5 rounded-full border-2 border-white/50 text-white text-sm font-bold inline-flex items-center gap-2 hover:bg-white/10 transition-all">
                <FaEdit className="text-xs" /> Edit profile
              </Link>
            </div>
          </motion.div>

          {/* ── Stat tiles ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Applications", value: total, icon: <FaPaperPlane />, color: "var(--primary)" },
              { label: "Pending", value: pendingApps, icon: <FaHourglassHalf />, color: "#F59E0B" },
              { label: "Accepted", value: acceptedApps, icon: <FaCheckCircle />, color: "#22C55E" },
              { label: "Accept rate", value: acceptRate, suffix: "%", icon: <FaStar />, color: "#A855F7" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -5 }}
                className="group relative glass-card p-5 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
                <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `${s.color}33` }} />
                <div className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-white shadow-[var(--shadow-sm)] group-hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}bb)` }}>{s.icon}</div>
                <div className="relative text-3xl md:text-4xl font-display font-black text-[var(--text-primary)] leading-none">
                  <CountUp value={s.value} suffix={s.suffix || ""} />
                </div>
                <div className="relative text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold mt-1.5">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* ── Charts row: status + profile strength ── */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Status doughnut */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><FaBriefcase className="text-[var(--primary)] text-sm" /> Application status</h2>
              {total === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">No applications yet — your first one starts the journey.</p>
                  <Link href="/jobs" className="btn-primary px-6 py-2.5 text-sm">Browse jobs <FaArrowRight /></Link>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="relative w-36 h-36 shrink-0">
                    <Doughnut data={statusData} options={{ cutout: "70%", plugins: { legend: { display: false } } }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-[var(--text-primary)]">{total}</span>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">total</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    {[["Pending", pendingApps, "#F59E0B"], ["Accepted", acceptedApps, "#22C55E"], ["Not selected", rejectedApps, "#EF4444"]].map(([l, v, c]) => (
                      <div key={l as string} className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full" style={{ background: c as string }} />
                        <span className="text-sm text-[var(--text-secondary)] flex-1">{l}</span>
                        <span className="text-sm font-bold text-[var(--text-primary)]">{v as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Profile strength */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><FaStar className="text-[var(--primary)] text-sm" /> Profile strength</h2>
              <div className="flex items-center gap-6">
                <div className="relative w-36 h-36 shrink-0">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface-elevated)" strokeWidth="12" />
                    <motion.circle cx="60" cy="60" r="50" fill="none" stroke="url(#pg)" strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 50}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - profileCompletion / 100) }}
                      transition={{ duration: 1.1, ease: "easeOut" }} />
                    <defs>
                      <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#C084FC" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-0">
                    <span className="text-2xl font-black gradient-text"><CountUp value={profileCompletion} suffix="%" /></span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">complete</span>
                  </div>
                </div>
                <div className="flex-1">
                  {profileCompletion === 100 ? (
                    <p className="text-sm text-[var(--text-secondary)]">Your profile is complete — clients see a strong, hireable profile. Nice! 🎉</p>
                  ) : (
                    <>
                      <p className="text-sm text-[var(--text-secondary)] mb-3">Complete your profile to get noticed — and boost your match scores.</p>
                      <ul className="space-y-1.5 text-xs">
                        {[["Profile photo", !!profile?.profileImageUrl], ["Resume / CV", !!profile?.resumeUrl], ["Phone number", !!profile?.phoneNumber], ["Social link", !!(profile?.linkedinUrl || profile?.instagramUrl)]]
                          .filter(([, done]) => !done).slice(0, 3).map(([l]) => (
                            <li key={l as string} className="flex items-center gap-2 text-[var(--text-muted)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" /> Add your {(l as string).toLowerCase()}
                            </li>
                          ))}
                      </ul>
                      <Link href="/profile?edit=true" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] mt-3 hover:gap-2.5 transition-all">
                        Complete profile <FaArrowRight className="text-[10px]" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Smart Match ── */}
          {recommended.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl mb-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center text-white shadow-[var(--shadow-glow)]"><FaBolt /></div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">Smart Match <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">For you</span></h2>
                    <p className="text-xs text-[var(--text-muted)]">Live jobs picked by your roles &amp; location</p>
                  </div>
                </div>
                <Link href="/jobs" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[var(--primary)] hover:gap-2.5 transition-all">See all <FaArrowRight className="text-xs" /></Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {recommended.map(({ job, match }, i) => (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                    <Link href={`/jobs/${job.id}`} className="group flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-md)] transition-all">
                      <div className="w-11 h-11 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] shrink-0 group-hover:scale-110 transition-transform"><FaBriefcase /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">{job.title || "Event role"}</p>
                        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-[var(--accent)] text-[9px]" />{job.location || "UAE"}</span>
                          <span className="flex items-center gap-1 font-bold text-[var(--primary)]"><FaMoneyBillWave className="text-[9px]" />AED {job.rate ?? "—"}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-black gradient-text leading-none">{match}%</div>
                        <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">match</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Achievements ── */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl mb-6">
            <h2 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><FaMedal className="text-[var(--primary)] text-sm" /> Achievements</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {achievements.map((a) => (
                <div key={a.label} className={`flex flex-col items-center text-center gap-2 p-3 rounded-2xl border transition-all ${a.earned ? "bg-[var(--primary-muted)] border-[var(--border-hover)]" : "bg-[var(--surface-elevated)] border-[var(--border)] opacity-60"}`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg ${a.earned ? "bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-glow)]" : "bg-[var(--surface)] text-[var(--text-muted)]"}`}>
                    {a.earned ? a.icon : <FaLock className="text-xs" />}
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${a.earned ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{a.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Applications ── */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 border-b border-[var(--border)]">
              <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2"><FaBriefcase className="text-[var(--primary)] text-sm" /> My applications</h2>
              <div className="flex gap-1.5 flex-wrap">
                {(["all", "pending", "accepted", "rejected"] as FilterType[]).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? "bg-[image:var(--gradient-primary)] text-white" : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--primary)]"}`}>
                    {f === "rejected" ? "Not selected" : f}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {filteredApps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">{total === 0 ? "🚀" : "🔍"}</div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">{total === 0 ? "You haven't applied to anything yet." : "No applications in this filter."}</p>
                  <Link href="/jobs" className="btn-primary px-6 py-2.5 text-sm">Browse live jobs <FaArrowRight /></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApps.map((a, i) => {
                    const m = statusMeta[a.status] || statusMeta.pending;
                    return (
                      <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] shrink-0"><FaBriefcase /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[var(--text-primary)] truncate">{a.jobTitle}</p>
                          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5"><FaRegClock className="text-[9px]" /> Applied {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : "recently"}</p>
                        </div>
                        <span className={`shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-full border ${m.cls}`}>{m.icon} {m.label}</span>
                        <Link href={`/jobs/${a.jobId}`} className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface)] transition-all"><FaArrowRight className="text-xs" /></Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
