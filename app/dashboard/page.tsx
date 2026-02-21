"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { toast } from "sonner";
import {
  FaUser,
  FaMapMarkerAlt,
  FaBriefcase,
  FaDownload,
  FaEdit,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaChartLine,
  FaFire,
  FaStar,
  FaTrophy,
  FaRocket,
  FaGem,
  FaBolt,
  FaCrown,
  FaArrowRight,
  FaSearch,
  FaImages,
  FaConciergeBell,
  FaBell,
  FaCalendarAlt,
  FaFilter,
  FaEye,
  FaExternalLinkAlt,
  FaLinkedin,
  FaInstagram,
  FaFileAlt,
  FaShieldAlt,
  FaLock,
  FaClock,
  FaMedal,
  FaGlobe,
  FaChevronRight,
} from "react-icons/fa";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

interface Profile {
  firstName: string;
  lastName: string;
  city: string;
  country?: string;
  yearsOfExperience?: string;
  profileImageUrl?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  nationality?: string;
  professionCategory?: string;
  professionSubcategory?: string;
  email?: string;
  phoneNumber?: string;
  isProfileComplete?: boolean;
}

interface Application {
  id: string;
  jobId: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
  jobTitle?: string;
}

type FilterType = "all" | "pending" | "accepted" | "rejected";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  }),
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  }),
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [xp, setXp] = useState(0);
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<"activity" | "applications">("applications");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [userDoc, appsSnapshot] = await Promise.all([
            getDoc(doc(db, "users", user.uid)),
            getDocs(
              query(
                collection(db, "applications"),
                where("userEmail", "==", user.email!)
              )
            ),
          ]);

          if (userDoc.exists()) {
            setProfile(userDoc.data() as Profile);
          }

          const appsList = await Promise.all(
            appsSnapshot.docs.map(async (appDoc) => {
              const appData = appDoc.data() as Application;
              try {
                const jobDoc = await getDoc(doc(db, "jobs", appData.jobId));
                const jobTitle = jobDoc.exists()
                  ? jobDoc.data().title
                  : "Position (Closed)";
                return { ...appData, id: appDoc.id, jobTitle };
              } catch {
                return { ...appData, id: appDoc.id, jobTitle: "Unknown Position" };
              }
            })
          );

          // Sort by newest first
          appsList.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setApplications(appsList);

          // XP calculation
          let calculatedXp = 0;
          if (userDoc.exists()) calculatedXp += 500;
          calculatedXp += appsList.length * 150;
          const p = userDoc.data() as Profile;
          if (p?.resumeUrl) calculatedXp += 200;
          if (p?.profileImageUrl) calculatedXp += 100;
          if (p?.linkedinUrl) calculatedXp += 50;
          setXp(calculatedXp);
        } catch (error) {
          console.error("Dashboard fetch error:", error);
          toast.error("Failed to load dashboard data. Please refresh.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, loading, router]);

  const totalApplications = applications.length;
  const pendingApps = applications.filter((a) => a.status === "pending").length;
  const acceptedApps = applications.filter((a) => a.status === "accepted").length;
  const rejectedApps = applications.filter((a) => a.status === "rejected").length;

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.profileImageUrl,
      profile.resumeUrl,
      profile.city,
      profile.phoneNumber,
      profile.nationality,
      profile.professionCategory,
      profile.linkedinUrl || profile.instagramUrl,
    ];
    const done = fields.filter(Boolean).length;
    return Math.round((done / fields.length) * 100);
  }, [profile]);

  const level = Math.floor(xp / 1000) + 1;
  const xpToNextLevel = 1000 - (xp % 1000);
  const progressPercent = (xp % 1000) / 10;

  const filteredApps = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  const statusChartData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [
      {
        data: [pendingApps || 0.001, acceptedApps || 0.001, rejectedApps || 0.001],
        backgroundColor: ["#FFB800", "#10B981", "#EF4444"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const activityLineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Activity",
        data: [3, 7, 2, 9, 4, 6, 10],
        borderColor: "var(--primary)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(0, 212, 255, 0.35)");
          gradient.addColorStop(1, "rgba(0, 212, 255, 0)");
          return gradient;
        },
        fill: true,
        tension: 0.45,
        pointBackgroundColor: "var(--primary)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true },
    },
    elements: { point: { radius: 4 } },
  };

  const quickActions = [
    {
      icon: <FaSearch className="text-2xl" />,
      label: "Browse Jobs",
      desc: "Find new opportunities",
      href: "/jobs",
      color: "from-cyan-500 to-blue-500",
      glow: "rgba(0, 212, 255, 0.35)",
    },
    {
      icon: <FaUser className="text-2xl" />,
      label: "My Profile",
      desc: "View & manage your profile",
      href: "/profile",
      color: "from-violet-500 to-purple-600",
      glow: "rgba(139, 92, 246, 0.35)",
    },
    {
      icon: <FaImages className="text-2xl" />,
      label: "Gallery",
      desc: "Explore event photos",
      href: "/gallery",
      color: "from-pink-500 to-rose-500",
      glow: "rgba(244, 63, 94, 0.35)",
    },
    {
      icon: <FaConciergeBell className="text-2xl" />,
      label: "Services",
      desc: "Browse our services",
      href: "/services",
      color: "from-amber-500 to-orange-500",
      glow: "rgba(245, 158, 11, 0.35)",
    },
    {
      icon: <FaGlobe className="text-2xl" />,
      label: "About Us",
      desc: "Learn about Eventopic",
      href: "/about",
      color: "from-teal-500 to-emerald-500",
      glow: "rgba(16, 185, 129, 0.35)",
    },
    {
      icon: <FaEdit className="text-2xl" />,
      label: "Edit Profile",
      desc: "Update your information",
      href: "/profile?edit=true",
      color: "from-indigo-500 to-blue-600",
      glow: "rgba(99, 102, 241, 0.35)",
    },
  ];

  const quests = [
    {
      title: "Apply to 3 Jobs",
      icon: <FaRocket />,
      progress: Math.min(totalApplications, 3),
      total: 3,
      done: totalApplications >= 3,
      xpReward: 450,
    },
    {
      title: "Complete Profile",
      icon: <FaUser />,
      progress: profileCompletion >= 100 ? 1 : 0,
      total: 1,
      done: profileCompletion >= 100,
      xpReward: 500,
    },
    {
      title: "Upload Resume",
      icon: <FaFileAlt />,
      progress: profile?.resumeUrl ? 1 : 0,
      total: 1,
      done: !!profile?.resumeUrl,
      xpReward: 200,
    },
    {
      title: "Add Profile Photo",
      icon: <FaImages />,
      progress: profile?.profileImageUrl ? 1 : 0,
      total: 1,
      done: !!profile?.profileImageUrl,
      xpReward: 100,
    },
    {
      title: "Get First Interview",
      icon: <FaTrophy />,
      progress: acceptedApps > 0 ? 1 : 0,
      total: 1,
      done: acceptedApps > 0,
      xpReward: 300,
    },
  ];

  const completionSteps = [
    { label: "Profile photo", done: !!profile?.profileImageUrl },
    { label: "Resume uploaded", done: !!profile?.resumeUrl },
    { label: "Phone number", done: !!profile?.phoneNumber },
    { label: "Nationality set", done: !!profile?.nationality },
    { label: "Profession set", done: !!profile?.professionCategory },
    { label: "Social link added", done: !!(profile?.linkedinUrl || profile?.instagramUrl) },
  ];

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--primary)]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[var(--primary)] animate-spin" />
          </div>
          <p className="text-[var(--text-secondary)] font-semibold animate-pulse text-lg">
            Syncing your career hub...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <>
      <Navbar />
      <section className="pt-28 pb-20 min-h-screen bg-[var(--background)] relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--primary)]/8 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-[var(--secondary)]/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[var(--accent)]/5 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">

          {/* ── HERO HEADER ── */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[var(--text-muted)] text-sm font-semibold uppercase tracking-widest mb-2">
                Welcome back
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 font-display">
                Hey,{" "}
                <span className="gradient-text">{profile.firstName}</span>! 🚀
              </h1>
              <p className="text-lg text-[var(--text-secondary)]">
                {profile.professionCategory
                  ? `${profile.professionCategory} · `
                  : ""}
                {profile.city || "Your Career Hub"}
              </p>
            </motion.div>

            {/* Level / XP Card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card px-6 py-4 rounded-2xl flex items-center gap-5 w-full lg:w-auto min-w-[320px]"
            >
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_var(--primary)]">
                  {level}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[var(--surface-elevated)] border border-[var(--border)] text-[10px] font-bold px-2 py-0.5 rounded-full text-[var(--text-primary)]">
                  LVL
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-[var(--text-primary)]">Experience Points</span>
                  <span className="text-[var(--primary)] font-bold">{xp} XP</span>
                </div>
                <div className="w-full bg-[var(--surface-light)] h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-full rounded-full shadow-[0_0_10px_var(--primary)]"
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                  {xpToNextLevel} XP to Level {level + 1}
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── QUICK ACTIONS GRID ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-lg font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-5 flex items-center gap-2">
              <FaBolt className="text-[var(--accent)]" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    href={action.href}
                    className="group flex flex-col items-center gap-3 p-4 rounded-2xl glass-card text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:border-[var(--primary)]/40"
                    style={{
                      ["--glow" as string]: action.glow,
                    }}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--text-primary)] leading-tight">
                        {action.label}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight hidden sm:block">
                        {action.desc}
                      </p>
                    </div>
                    <FaChevronRight className="text-[var(--text-muted)] text-xs group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── MAIN GRID ── */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT + CENTER — 2 cols */}
            <div className="lg:col-span-2 space-y-8">

              {/* STATS ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Applied",
                    value: totalApplications,
                    icon: <FaRocket />,
                    color: "from-cyan-500 to-blue-500",
                    bg: "rgba(0,212,255,0.08)",
                  },
                  {
                    label: "Interviews",
                    value: acceptedApps,
                    icon: <FaCheckCircle />,
                    color: "from-emerald-500 to-green-500",
                    bg: "rgba(16,185,129,0.08)",
                  },
                  {
                    label: "Pending",
                    value: pendingApps,
                    icon: <FaHourglassHalf />,
                    color: "from-amber-500 to-yellow-500",
                    bg: "rgba(245,158,11,0.08)",
                  },
                  {
                    label: "Profile Score",
                    value: `${profileCompletion}%`,
                    icon: <FaShieldAlt />,
                    color: "from-violet-500 to-purple-600",
                    bg: "rgba(139,92,246,0.08)",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="glass-card p-5 rounded-2xl cursor-default"
                    style={{ background: stat.bg }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-lg mb-3`}
                    >
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold font-display text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* APPLICATIONS TABLE / ACTIVITY TABS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-card rounded-3xl overflow-hidden"
              >
                {/* Tab Header */}
                <div className="flex items-center justify-between p-6 pb-0 border-b border-[var(--border)]">
                  <div className="flex gap-1">
                    {(["applications", "activity"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm capitalize transition-all duration-200 ${activeTab === tab
                          ? "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                      >
                        {tab === "applications" ? (
                          <span className="flex items-center gap-2">
                            <FaBriefcase /> My Applications
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <FaClock /> Activity Feed
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Filter pills — only for applications tab */}
                  {activeTab === "applications" && (
                    <div className="hidden sm:flex gap-2">
                      {(["all", "pending", "accepted", "rejected"] as FilterType[]).map(
                        (f) => (
                          <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f
                              ? f === "accepted"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : f === "rejected"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : f === "pending"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30"
                              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                              }`}
                          >
                            {f}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "applications" ? (
                      <motion.div
                        key="apps"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                      >
                        {filteredApps.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-3xl text-[var(--text-muted)]">
                              <FaBriefcase />
                            </div>
                            <p className="text-[var(--text-secondary)] mb-2 font-semibold text-lg">
                              No applications yet
                            </p>
                            <p className="text-[var(--text-muted)] text-sm mb-6">
                              Start applying to jobs and track your progress here.
                            </p>
                            <Link href="/jobs" className="btn-primary text-sm">
                              Browse Jobs <FaArrowRight />
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredApps.map((app, i) => {
                              const statusColor =
                                app.status === "accepted"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                                  : app.status === "rejected"
                                    ? "bg-red-500/15 text-red-400 border-red-500/25"
                                    : "bg-amber-500/15 text-amber-400 border-amber-500/25";
                              const statusIcon =
                                app.status === "accepted" ? (
                                  <FaCheckCircle />
                                ) : app.status === "rejected" ? (
                                  <FaTimesCircle />
                                ) : (
                                  <FaHourglassHalf />
                                );
                              const progressWidth =
                                app.status === "accepted"
                                  ? "100%"
                                  : app.status === "rejected"
                                    ? "15%"
                                    : "50%";
                              const progressColor =
                                app.status === "accepted"
                                  ? "bg-emerald-500"
                                  : app.status === "rejected"
                                    ? "bg-red-500"
                                    : "bg-amber-400";

                              return (
                                <motion.div
                                  key={app.id}
                                  custom={i}
                                  variants={fadeUp}
                                  initial="hidden"
                                  animate="visible"
                                  className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all group"
                                >
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-sm shrink-0">
                                        <FaBriefcase />
                                      </div>
                                      <div>
                                        <p className="font-bold text-[var(--text-primary)] text-sm leading-tight">
                                          {app.jobTitle}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                                          <FaCalendarAlt className="text-[10px]" />
                                          {new Date(app.timestamp).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase border shrink-0 ${statusColor}`}
                                    >
                                      {statusIcon} {app.status}
                                    </span>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-[var(--surface-light)] rounded-full overflow-hidden">
                                      <motion.div
                                        className={`h-full rounded-full ${progressColor}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: progressWidth }}
                                        transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold shrink-0">
                                      {app.status === "accepted"
                                        ? "Hired"
                                        : app.status === "rejected"
                                          ? "Closed"
                                          : "In Review"}
                                    </span>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="activity"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                      >
                        {applications.length === 0 ? (
                          <div className="text-center py-16">
                            <p className="text-[var(--text-secondary)] font-semibold">
                              No activity yet. Start applying!
                            </p>
                          </div>
                        ) : (
                          <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--primary)] to-transparent opacity-30" />
                            <div className="space-y-5">
                              {applications.slice(0, 8).map((app, i) => (
                                <motion.div
                                  key={app.id}
                                  custom={i}
                                  variants={fadeUp}
                                  initial="hidden"
                                  animate="visible"
                                  className="flex items-start gap-4 relative"
                                >
                                  <div
                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm shrink-0 z-10 ${app.status === "accepted"
                                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                      : app.status === "rejected"
                                        ? "bg-red-500/20 border-red-500 text-red-400"
                                        : "bg-amber-500/20 border-amber-500 text-amber-400"
                                      }`}
                                  >
                                    {app.status === "accepted" ? (
                                      <FaCheckCircle />
                                    ) : app.status === "rejected" ? (
                                      <FaTimesCircle />
                                    ) : (
                                      <FaHourglassHalf />
                                    )}
                                  </div>
                                  <div className="flex-1 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                                    <p className="font-bold text-sm text-[var(--text-primary)]">
                                      Applied to{" "}
                                      <span className="text-[var(--primary)]">
                                        {app.jobTitle}
                                      </span>
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                                      <FaClock className="text-[10px]" />
                                      {new Date(app.timestamp).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                      {" · "}
                                      Status:{" "}
                                      <span
                                        className={
                                          app.status === "accepted"
                                            ? "text-emerald-400"
                                            : app.status === "rejected"
                                              ? "text-red-400"
                                              : "text-amber-400"
                                        }
                                      >
                                        {app.status}
                                      </span>
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* CHARTS */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <h3 className="font-bold mb-1 flex items-center gap-2 text-[var(--text-primary)]">
                    <FaChartLine className="text-[var(--accent)]" /> Weekly Activity
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-4">
                    Your activity this week
                  </p>
                  <Line data={activityLineData} options={chartOptions} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <h3 className="font-bold mb-1 flex items-center gap-2 text-[var(--text-primary)]">
                    <FaGem className="text-[var(--primary)]" /> Application Status
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-4">
                    Breakdown of your applications
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32 shrink-0">
                      <Doughnut
                        data={statusChartData}
                        options={{ cutout: "72%", plugins: { legend: { display: false } } }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-bold text-xl text-[var(--text-primary)]">
                          {totalApplications}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                          Total
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 text-sm flex-1">
                      {[
                        { label: "Pending", val: pendingApps, color: "bg-amber-400" },
                        { label: "Accepted", val: acceptedApps, color: "bg-emerald-500" },
                        { label: "Rejected", val: rejectedApps, color: "bg-red-500" },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                          <span className="text-[var(--text-secondary)] flex-1 text-xs">
                            {s.label}
                          </span>
                          <span className="font-bold text-[var(--text-primary)] text-xs">
                            {s.val}
                          </span>
                        </div>
                      ))}
                      <div className="mt-1 pt-3 border-t border-[var(--border)]">
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Success Rate
                        </p>
                        <p className="text-lg font-bold gradient-text">
                          {totalApplications > 0
                            ? Math.round((acceptedApps / totalApplications) * 100)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6">

              {/* Profile Card */}
              <motion.div
                custom={0}
                variants={slideRight}
                initial="hidden"
                animate="visible"
                className="glass-card p-6 rounded-3xl text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  {/* Avatar */}
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full bg-[var(--surface-elevated)] p-1 ring-2 ring-[var(--primary)]/30">
                      {profile.profileImageUrl ? (
                        <Image
                          src={profile.profileImageUrl}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="rounded-full object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-3xl font-bold text-white">
                          {profile.firstName[0]}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-emerald-500 w-5 h-5 rounded-full border-4 border-[var(--surface)] shadow" />
                  </div>

                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  {profile.professionCategory && (
                    <p className="text-sm text-[var(--primary)] font-semibold mt-0.5">
                      {profile.professionSubcategory || profile.professionCategory}
                    </p>
                  )}
                  <p className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1 mt-1 mb-5">
                    <FaMapMarkerAlt className="text-[10px]" />
                    {profile.city}{profile.country ? `, ${profile.country}` : ""}
                  </p>

                  {/* Social Links */}
                  {(profile.linkedinUrl || profile.instagramUrl) && (
                    <div className="flex justify-center gap-3 mb-5">
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-blue-400 hover:bg-blue-600/30 transition-all"
                        >
                          <FaLinkedin />
                        </a>
                      )}
                      {profile.instagramUrl && (
                        <a
                          href={profile.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-9 h-9 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 hover:bg-pink-500/30 transition-all"
                        >
                          <FaInstagram />
                        </a>
                      )}
                      {profile.resumeUrl && (
                        <a
                          href={profile.resumeUrl}
                          download
                          className="w-9 h-9 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/30 transition-all"
                        >
                          <FaDownload />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Profile Completion */}
                  <div className="bg-[var(--surface-elevated)] p-4 rounded-xl text-left mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Profile Strength
                      </span>
                      <span
                        className={`text-xs font-bold ${profileCompletion === 100
                          ? "text-emerald-400"
                          : profileCompletion >= 60
                            ? "text-amber-400"
                            : "text-red-400"
                          }`}
                      >
                        {profileCompletion}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--surface-light)] rounded-full overflow-hidden mb-3">
                      <motion.div
                        className={`h-full rounded-full ${profileCompletion === 100
                          ? "bg-emerald-500"
                          : profileCompletion >= 60
                            ? "bg-amber-400"
                            : "bg-red-500"
                          }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${profileCompletion}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      {completionSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {step.done ? (
                            <FaCheckCircle className="text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-[var(--border)] shrink-0" />
                          )}
                          <span
                            className={
                              step.done
                                ? "text-[var(--text-secondary)]"
                                : "text-[var(--text-muted)]"
                            }
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href="/profile?edit=true"
                      className="btn-secondary flex-1 text-sm justify-center py-3 rounded-xl"
                    >
                      <FaEdit /> Edit
                    </Link>
                    <Link
                      href="/profile"
                      className="btn-secondary flex-1 text-sm justify-center py-3 rounded-xl"
                    >
                      <FaEye /> View
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Career Quests */}
              <motion.div
                custom={1}
                variants={slideRight}
                initial="hidden"
                animate="visible"
                className="glass-card p-6 rounded-3xl"
              >
                <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <FaCrown className="text-amber-400" /> Career Quests
                </h3>
                <div className="space-y-3">
                  {quests.map((quest, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border transition-all ${quest.done
                        ? "bg-emerald-500/8 border-emerald-500/20"
                        : "bg-[var(--surface-elevated)] border-[var(--border)] hover:border-[var(--primary)]/30"
                        }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${quest.done
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-[var(--surface-light)] text-[var(--text-muted)]"
                              }`}
                          >
                            {quest.done ? <FaMedal /> : quest.icon}
                          </div>
                          <span
                            className={`font-bold text-sm ${quest.done
                              ? "text-emerald-400"
                              : "text-[var(--text-primary)]"
                              }`}
                          >
                            {quest.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-lg">
                          +{quest.xpReward} XP
                        </span>
                      </div>
                      {/* Quest progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--surface-light)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${quest.done ? "bg-emerald-500" : "bg-[var(--primary)]"
                              }`}
                            style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] font-bold shrink-0">
                          {quest.progress}/{quest.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTA Banner */}
              <motion.div
                custom={2}
                variants={slideRight}
                initial="hidden"
                animate="visible"
                className="p-6 rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-xl relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-4">
                    🚀
                  </div>
                  <h3 className="font-bold text-xl mb-2">
                    Ready for More?
                  </h3>
                  <p className="text-white/80 text-sm mb-5">
                    Discover new events & jobs that match your skills perfectly.
                  </p>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[var(--primary)] font-bold rounded-full shadow-lg hover:scale-105 transition-transform text-sm"
                  >
                    Explore Jobs <FaArrowRight />
                  </Link>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}

