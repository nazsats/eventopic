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
import {
  FaMapMarkerAlt, FaBriefcase, FaEdit, FaCheckCircle,
  FaHourglassHalf, FaTimesCircle, FaStar, FaTrophy,
  FaBolt, FaArrowRight, FaFileAlt, FaPaperPlane, FaMoneyBillWave,
  FaRegClock, FaUser,
} from "react-icons/fa";

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

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<RecJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

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
  const acceptRate = total ? Math.round((acceptedApps / total) * 100) : 0;

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    const fields = [profile.firstName, profile.lastName, profile.profileImageUrl, profile.resumeUrl,
    profile.city, profile.phoneNumber, profile.nationality, profile.professionCategory,
    profile.linkedinUrl || profile.instagramUrl];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profile]);

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

  // Only milestones actually reached — no locked placeholders.
  const milestones = [
    { icon: <FaUser />, label: "Joined Eventopic", earned: true },
    { icon: <FaCheckCircle />, label: "Profile complete", earned: profileCompletion === 100 },
    { icon: <FaPaperPlane />, label: "First application", earned: total >= 1 },
    { icon: <FaFileAlt />, label: "Resume added", earned: !!profile?.resumeUrl },
    { icon: <FaTrophy />, label: "Got accepted", earned: acceptedApps >= 1 },
  ].filter((m) => m.earned);

  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; })();
  const firstName = profile?.firstName || user?.displayName?.split(" ")[0] || "there";
  const avatarChar = (profile?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase();

  const missingProfileItems = [
    ["profile photo", !!profile?.profileImageUrl],
    ["resume / CV", !!profile?.resumeUrl],
    ["phone number", !!profile?.phoneNumber],
    ["social link", !!(profile?.linkedinUrl || profile?.instagramUrl)],
  ].filter(([, done]) => !done).slice(0, 3) as [string, boolean][];

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
      <CursorGlow />
      <Navbar />

      <section className="pt-24 pb-16">
        <div className="container mx-auto px-5 max-w-6xl">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center overflow-hidden shrink-0 shadow-[var(--shadow-sm)]">
                {profile?.profileImageUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={profile.profileImageUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xl font-black text-white">{avatarChar}</span>}
              </div>
              <div className="min-w-0">
                <p className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-widest">{greeting}</p>
                <h1 className="font-display font-black text-xl md:text-2xl text-[var(--text-primary)] leading-tight truncate">{firstName}</h1>
                {profile?.city && (
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                    <FaMapMarkerAlt className="text-[var(--accent)] text-[10px]" /> {profile.city}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2.5 shrink-0">
              <Link href="/jobs" className="btn-primary px-5 py-2.5 text-sm rounded-full">
                Find Jobs <FaArrowRight className="text-xs" />
              </Link>
              <Link href="/profile?edit=true" className="btn-secondary px-5 py-2.5 text-sm rounded-full">
                <FaEdit className="text-xs" /> Edit Profile
              </Link>
            </div>
          </motion.div>

          {/* ── Stat tiles ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Applications", value: total, icon: <FaPaperPlane /> },
              { label: "Pending", value: pendingApps, icon: <FaHourglassHalf /> },
              { label: "Accepted", value: acceptedApps, icon: <FaCheckCircle /> },
              { label: "Accept rate", value: `${acceptRate}%`, icon: <FaStar /> },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-4 md:p-5 rounded-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] text-sm shrink-0">{s.icon}</div>
                <div className="min-w-0">
                  <div className="text-xl md:text-2xl font-display font-black text-[var(--text-primary)] leading-none">{s.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mt-1">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Main grid: applications + side column ── */}
          <div className="grid lg:grid-cols-3 gap-4 mb-5">

            {/* Applications */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="lg:col-span-2 glass-card rounded-sm overflow-hidden self-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-[var(--border)]">
                <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-sm">
                  <FaBriefcase className="text-[var(--primary)] text-xs" /> My Applications
                </h2>
                <div className="flex gap-1.5 flex-wrap">
                  {(["all", "pending", "accepted", "rejected"] as FilterType[]).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? "bg-[image:var(--gradient-primary)] text-white" : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--primary)]"}`}>
                      {f === "rejected" ? "Not selected" : f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {filteredApps.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] text-lg mb-3">
                      <FaBriefcase />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      {total === 0 ? "You haven't applied to anything yet." : "No applications in this filter."}
                    </p>
                    <Link href="/jobs" className="btn-primary px-6 py-2.5 text-sm">Browse live jobs <FaArrowRight /></Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredApps.map((a, i) => {
                      const m = statusMeta[a.status] || statusMeta.pending;
                      return (
                        <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-3 p-3.5 rounded-sm bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all">
                          <div className="w-9 h-9 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] text-sm shrink-0"><FaBriefcase /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-[var(--text-primary)] truncate">{a.jobTitle}</p>
                            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                              <FaRegClock className="text-[9px]" /> {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : "recently"}
                            </p>
                          </div>
                          <span className={`shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-full border ${m.cls}`}>{m.icon} {m.label}</span>
                          <Link href={`/jobs/${a.jobId}`} aria-label="View job" className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface)] transition-all"><FaArrowRight className="text-xs" /></Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Side column: profile completion + milestones */}
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                className="glass-card p-5 rounded-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                    <FaStar className="text-[var(--primary)] text-xs" /> Profile Strength
                  </h2>
                  <span className="font-display font-black text-lg gradient-text">{profileCompletion}%</span>
                </div>
                <div className="h-2 bg-[var(--surface-elevated)] rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="h-full bg-[image:var(--gradient-primary)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompletion}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
                {profileCompletion === 100 ? (
                  <p className="text-xs text-[var(--text-secondary)]">Your profile is complete — clients see a strong, hireable profile.</p>
                ) : (
                  <>
                    <ul className="space-y-1.5 text-xs mb-3">
                      {missingProfileItems.map(([l]) => (
                        <li key={l} className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" /> Add your {l}
                        </li>
                      ))}
                    </ul>
                    <Link href="/profile?edit=true" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:gap-2.5 transition-all">
                      Complete profile <FaArrowRight className="text-[10px]" />
                    </Link>
                  </>
                )}
              </motion.div>

              {milestones.length > 1 && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                  className="glass-card p-5 rounded-sm">
                  <h2 className="font-bold text-[var(--text-primary)] text-sm mb-3">Milestones</h2>
                  <div className="flex flex-wrap gap-2">
                    {milestones.map((m) => (
                      <span key={m.label} className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--primary)] bg-[var(--primary-muted)] border border-[var(--border)] px-2.5 py-1.5 rounded-full">
                        <span className="text-[10px]">{m.icon}</span> {m.label}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ── Recommended jobs ── */}
          {recommended.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="glass-card p-5 rounded-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                  <FaBolt className="text-[var(--primary)] text-xs" /> Recommended For You
                </h2>
                <Link href="/jobs" className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:gap-2.5 transition-all">
                  See all <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {recommended.map(({ job, match }, i) => (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
                    <Link href={`/jobs/${job.id}`} className="group flex items-center gap-3 p-3.5 rounded-sm bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-md)] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] text-sm shrink-0 group-hover:scale-110 transition-transform"><FaBriefcase /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">{job.title || "Event role"}</p>
                        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-[var(--accent)] text-[9px]" />{job.location || "UAE"}</span>
                          <span className="flex items-center gap-1 font-bold text-[var(--primary)]"><FaMoneyBillWave className="text-[9px]" />AED {job.rate ?? "—"}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-black gradient-text leading-none">{match}%</div>
                        <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">match</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}
