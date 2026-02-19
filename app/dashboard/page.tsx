"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
  FaArrowRight
} from "react-icons/fa";
import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

interface Profile {
  firstName: string;
  lastName: string;
  city: string;
  yearsOfExperience: string;
  profileImageUrl?: string;
  resumeUrl?: string;
}

interface Application {
  id: string;
  jobId: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
  jobTitle?: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [xp, setXp] = useState(0);

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
            getDocs(query(collection(db, "applications"), where("userEmail", "==", user.email!))),
          ]);

          if (userDoc.exists()) {
            setProfile(userDoc.data() as Profile);
          }

          const appsList = await Promise.all(
            appsSnapshot.docs.map(async (appDoc) => {
              const appData = appDoc.data() as Application;
              try {
                const jobDoc = await getDoc(doc(db, "jobs", appData.jobId));
                // Provide default title if job fetch fails (e.g. job deleted)
                const jobTitle = jobDoc.exists() ? jobDoc.data().title : "Position (Closed)";
                return { ...appData, id: appDoc.id, jobTitle };
              } catch (e) {
                return { ...appData, id: appDoc.id, jobTitle: "Unknown Position" };
              }
            })
          );

          setApplications(appsList);

          // Calculate Mock XP based on activity
          let calculatedXp = 0;
          if (userDoc.exists()) calculatedXp += 500; // Profile created
          calculatedXp += appsList.length * 150; // Each app
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)] font-semibold animate-pulse">Syncing your career capabilities...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  // Stats
  const totalApplications = applications.length;
  const pendingApps = applications.filter(app => app.status === "pending").length;
  const acceptedApps = applications.filter(app => app.status === "accepted").length;
  const latestApp = applications.length > 0 ? applications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] : null;

  // Chart Data
  const statusChartData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [{
      data: [pendingApps, acceptedApps, applications.filter(app => app.status === "rejected").length],
      backgroundColor: ["#FFB800", "#00D4FF", "#EF4444"],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const activityData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Views",
      data: [12, 19, 3, 5, 2, 3, 10], // Mock data for "viewer dopamine"
      borderColor: "#00D4FF",
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "rgba(0, 212, 255, 0.4)");
        gradient.addColorStop(1, "rgba(0, 212, 255, 0)");
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#00D4FF",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
    }],
  };

  // Level Calculation
  const level = Math.floor(xp / 1000) + 1;
  const xpToNextLevel = 1000 - (xp % 1000);
  const progressPercent = (xp % 1000) / 10;

  return (
    <>
      <Navbar />
      <section className="pt-28 pb-16 min-h-screen bg-[var(--background)] relative overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-[var(--primary)]/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[var(--accent)]/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">

          {/* Header & Level Info */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 font-display">
                Hello, <span className="gradient-text">{profile.firstName}</span>! 🚀
              </h1>
              <p className="text-xl text-[var(--text-secondary)]">You're making great moves. Keep the momentum going!</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card px-6 py-4 rounded-2xl flex items-center gap-6 w-full md:w-auto min-w-[300px]"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_var(--primary)]">
                  {level}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-bold px-2 py-1 rounded-full text-[var(--text-primary)]">
                  LVL
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-[var(--text-primary)]">Experience</span>
                  <span className="text-[var(--primary)] font-bold">{xp} XP</span>
                </div>
                <div className="w-full bg-[var(--surface-light)] h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-full rounded-full shadow-[0_0_10px_var(--primary)]"
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{xpToNextLevel} XP to Level {level + 1}</p>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN - MAIN STATS & TIMELINE */}
            <div className="lg:col-span-2 space-y-8">

              {/* Hero Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Applications", value: totalApplications, icon: <FaRocket />, color: "text-blue-400" },
                  { label: "Interviews", value: acceptedApps, icon: <FaCheckCircle />, color: "text-green-400" },
                  { label: "Profile Views", value: "128", icon: <FaFire />, color: "text-orange-400" },
                  { label: "Msgs", value: "3", icon: <FaBolt />, color: "text-yellow-400" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-5 rounded-2xl hover:border-[var(--primary)] transition-all cursor-default"
                  >
                    <div className={`text-2xl mb-2 ${stat.color}`}>{stat.icon}</div>
                    <div className="text-3xl font-bold font-display text-white mb-1">{stat.value}</div>
                    <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Latest Application Timeline - THE DOPAMINE HIT */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 rounded-3xl border border-[var(--primary)]/30 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <span className="animate-pulse inline-flex h-3 w-3 rounded-full bg-green-400"></span>
                </div>

                <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-3">
                  <FaBriefcase className="text-[var(--primary)]" /> Latest Activity
                </h2>

                {latestApp ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">{latestApp.jobTitle}</h3>
                        <p className="text-[var(--text-secondary)]">Applied on {new Date(latestApp.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full font-bold uppercase text-sm ${latestApp.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          latestApp.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {latestApp.status}
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="relative pt-6 pb-2">
                      <div className="h-2 bg-[var(--surface-light)] rounded-full mb-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: latestApp.status === 'accepted' ? '100%' : latestApp.status === 'rejected' ? '10%' : '50%' }}
                          className={`h-full rounded-full shadow-[0_0_15px_currentColor] ${latestApp.status === 'accepted' ? 'bg-green-500 text-green-500' :
                              latestApp.status === 'rejected' ? 'bg-red-500 text-red-500' : 'bg-yellow-400 text-yellow-400'
                            }`}
                        />
                      </div>
                      <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        <span className="text-[var(--primary)]">Applied</span>
                        <span className={latestApp.status !== 'pending' ? 'text-[var(--text-primary)]' : ''}>Reviewed</span>
                        <span className={latestApp.status === 'accepted' ? 'text-green-400' : ''}>Interview</span>
                        <span className={latestApp.status === 'accepted' ? 'text-green-400' : ''}>Hired</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[var(--text-secondary)] mb-4">No active applications. Start your streak today!</p>
                    <Link href="/portal/applications" className="btn-primary">Find a Job</Link>
                  </div>
                )}
              </motion.div>

              {/* Charts Area */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><FaChartLine className="text-[var(--accent)]" /> Profile Views</h3>
                  <Line data={activityData} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } }, elements: { point: { radius: 0 } } }} />
                </div>
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><FaGem className="text-[var(--primary)]" /> Success Rate</h3>
                  <div className="h-40 flex items-center justify-center relative">
                    <Doughnut data={statusChartData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                    <div className="absolute font-bold text-2xl text-[var(--text-primary)]">
                      {totalApplications > 0 ? Math.round((acceptedApps / totalApplications) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN - SIDEBAR & ACTIONS */}
            <div className="space-y-6">

              {/* Profile Strength */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 rounded-3xl text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto bg-[var(--surface-elevated)] rounded-full p-2 mb-4 relative">
                    {profile.profileImageUrl ? (
                      <Image src={profile.profileImageUrl} alt="Profile" width={96} height={96} className="rounded-full object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[var(--primary)] flex items-center justify-center text-3xl font-bold">{profile.firstName[0]}</div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-[var(--surface)]"></div>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{profile.firstName} {profile.lastName}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">{profile.city}</p>

                  <div className="bg-[var(--surface-elevated)] p-4 rounded-xl text-left mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Profile Strength</span>
                      <span className="text-xs font-bold text-green-400">Perfect</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--surface-light)] rounded-full overflow-hidden">
                      <div className="w-full h-full bg-green-500"></div>
                    </div>
                  </div>

                  <Link href="/profile?edit=true" className="btn-secondary w-full text-sm block">Edit Profile</Link>
                </div>
              </motion.div>

              {/* Quest / Action Center */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-3xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FaCrown className="text-yellow-400" /> Career Quests</h3>
                <div className="space-y-4">
                  {[
                    { title: "Apply to 3 Jobs", progress: Math.min(totalApplications, 3) + "/3", done: totalApplications >= 3 },
                    { title: "Complete Profile", progress: "1/1", done: true },
                    { title: "Upload Resume", progress: profile.resumeUrl ? "1/1" : "0/1", done: !!profile.resumeUrl }
                  ].map((quest, i) => (
                    <div key={i} className={`p-3 rounded-xl border transition-all ${quest.done ? 'bg-green-500/10 border-green-500/30' : 'bg-[var(--surface-elevated)] border-[var(--border)]'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold text-sm ${quest.done ? 'text-green-400' : 'text-[var(--text-primary)]'}`}>{quest.title}</span>
                        {quest.done ? <FaCheckCircle className="text-green-400" /> : <span className="text-xs text-[var(--text-secondary)]">{quest.progress}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recommendations */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <h3 className="font-bold text-xl mb-2 relative z-10">Upgrade Your Career</h3>
                <p className="text-white/80 text-sm mb-6 relative z-10">3 top-tier events match your skills. Apply now to boost your visibility!</p>
                <Link href="/portal/applications" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--primary)] font-bold rounded-full shadow-lg relative z-10 hover:scale-105 transition-transform">
                  View 3 Matches <FaArrowRight />
                </Link>
              </motion.div>

            </div>

          </div>
        </div>
      </section>
    </>
  );
}