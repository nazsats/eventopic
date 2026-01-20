//app/dashboard/page.tsx
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
import { toast } from "react-toastify";
import {
  FaUser,
  FaMapMarkerAlt,
  FaClock,
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
  FaAward
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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [userDoc, skillsDoc, appsSnapshot] = await Promise.all([
            getDoc(doc(db, "users", user.uid)),
            getDoc(doc(db, "user_skills", user.uid)),
            getDocs(query(collection(db, "applications"), where("userEmail", "==", user.email!))),
          ]);

          if (userDoc.exists()) {
            setProfile(userDoc.data() as Profile);
          }

          const appsList = await Promise.all(
            appsSnapshot.docs.map(async (appDoc) => {
              const appData = appDoc.data() as Application;
              const jobDoc = await getDoc(doc(db, "jobs", appData.jobId));
              const jobTitle = jobDoc.exists() ? jobDoc.data().title : "Unknown Job";
              return { ...appData, id: appDoc.id, jobTitle };
            })
          );
          setApplications(appsList);
        } catch (error) {
          console.error("Dashboard fetch error:", error);
          toast.error("Failed to load dashboard data.");
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
          <p className="text-[var(--text-secondary)] font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  // Calculate stats
  const totalApplications = applications.length;
  const pendingApps = applications.filter(app => app.status === "pending").length;
  const acceptedApps = applications.filter(app => app.status === "accepted").length;
  const rejectedApps = applications.filter(app => app.status === "rejected").length;
  const responseRate = totalApplications > 0 ? Math.round(((acceptedApps + rejectedApps) / totalApplications) * 100) : 0;

  // Chart data with theme colors
  const statusChartData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [{
      data: [pendingApps, acceptedApps, rejectedApps],
      backgroundColor: ["#FFB800", "#00D4FF", "#EF4444"],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const activityData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Application Activity",
      data: [2, 3, 1, 4, 2, 1, 3],
      borderColor: "#00D4FF",
      backgroundColor: "rgba(0, 212, 255, 0.1)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#00D4FF",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  return (
    <>
      <Navbar />
      <section className="pt-24 pb-16 min-h-screen bg-[var(--background)] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 font-display">
              <span className="gradient-text">Welcome Back</span>, {profile.firstName}! 👋
            </h1>
            <p className="text-xl text-[var(--text-secondary)]">Here&apos;s your career progress at a glance</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Applications", value: totalApplications, icon: <FaBriefcase />, gradient: "from-[var(--primary)] to-[var(--secondary)]", trend: "+2 this week" },
              { label: "Pending Review", value: pendingApps, icon: <FaHourglassHalf />, gradient: "from-[var(--accent)] to-orange-500", trend: "Awaiting response" },
              { label: "Accepted", value: acceptedApps, icon: <FaCheckCircle />, gradient: "from-green-500 to-emerald-500", trend: "Great progress!" },
              { label: "Response Rate", value: `${responseRate}%`, icon: <FaChartLine />, gradient: "from-[var(--primary)] to-cyan-500", trend: "Industry avg: 65%" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card p-6 group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="text-4xl text-[var(--primary)] group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="px-3 py-1 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] text-xs font-bold">
                    {stat.trend}
                  </div>
                </div>
                <div className="text-4xl font-bold mb-1 font-display gradient-text relative z-10">{stat.value}</div>
                <div className="text-sm text-[var(--text-secondary)] relative z-10">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile & Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold font-display gradient-text flex items-center gap-2">
                    <FaUser /> Your Profile
                  </h2>
                  <Link
                    href="/profile?edit=true"
                    className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                  >
                    <FaEdit /> Edit
                  </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    {profile.profileImageUrl ? (
                      <Image
                        src={profile.profileImageUrl}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="rounded-2xl object-cover border-4 border-[var(--primary)] shadow-lg aspect-square"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-[var(--text-secondary)]">Professional Event Staff</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <FaMapMarkerAlt className="text-[var(--primary)]" />
                        <span>{profile.city}, UAE</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <FaClock className="text-[var(--primary)]" />
                        <span>{profile.yearsOfExperience} years exp.</span>
                      </div>
                    </div>

                    {profile.resumeUrl && (
                      <a
                        href={profile.resumeUrl}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--surface-light)] hover:border-[var(--primary)] transition-all"
                      >
                        <FaDownload /> Download Resume
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Charts Row */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Application Status Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-bold mb-4 font-display gradient-text">
                    Application Status
                  </h3>
                  <div className="flex justify-center">
                    <div className="w-48 h-48">
                      <Doughnut
                        data={statusChartData}
                        options={{
                          cutout: "70%",
                          plugins: {
                            legend: { display: false },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--accent)]"></div>
                        <span className="text-[var(--text-secondary)]">Pending</span>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{pendingApps}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>
                        <span className="text-[var(--text-secondary)]">Accepted</span>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{acceptedApps}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-[var(--text-secondary)]">Rejected</span>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{rejectedApps}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Activity Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-bold mb-4 font-display gradient-text">
                    Weekly Activity
                  </h3>
                  <Line
                    data={activityData}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 1, color: 'rgba(184, 188, 200, 0.5)' },
                          grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        },
                        x: {
                          ticks: { color: 'rgba(184, 188, 200, 0.5)' },
                          grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        }
                      },
                    }}
                  />
                </motion.div>
              </div>

              {/* Recent Applications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="glass-card p-6"
              >
                <h2 className="text-2xl font-bold mb-6 font-display gradient-text flex items-center gap-2">
                  <FaBriefcase /> Recent Applications ({applications.length})
                </h2>

                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-xl text-[var(--text-secondary)] mb-4">No applications yet</p>
                    <Link
                      href="/portal/applications"
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      Browse Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app) => (
                      <motion.div
                        key={app.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--primary)] transition-all"
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-[var(--text-primary)] mb-1">{app.jobTitle}</h4>
                          <p className="text-sm text-[var(--text-secondary)]">
                            Applied {new Date(app.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          {app.status === "pending" && (
                            <span className="px-4 py-2 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] text-sm font-bold flex items-center gap-2">
                              <FaHourglassHalf /> Pending
                            </span>
                          )}
                          {app.status === "accepted" && (
                            <span className="px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-bold flex items-center gap-2">
                              <FaCheckCircle /> Accepted
                            </span>
                          )}
                          {app.status === "rejected" && (
                            <span className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-bold flex items-center gap-2">
                              <FaTimesCircle /> Rejected
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Achievements & Quick Actions */}
            <div className="space-y-6">
              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-card p-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 font-display gradient-text-accent relative z-10">
                  <FaTrophy /> Achievements
                </h3>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                    <div className="text-3xl">🎯</div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">Quick Starter</p>
                      <p className="text-sm text-[var(--text-secondary)]">Applied to 5+ jobs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                    <div className="text-3xl">⭐</div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">Profile Complete</p>
                      <p className="text-sm text-[var(--text-secondary)]">100% completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                    <div className="text-3xl">🔥</div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">Active Candidate</p>
                      <p className="text-sm text-[var(--text-secondary)]">Weekly applications</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-bold mb-4 font-display gradient-text">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/portal/applications"
                    className="block p-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold hover:scale-105 transition-transform text-center shadow-md"
                  >
                    <FaRocket className="inline mr-2" /> Browse New Jobs
                  </Link>
                  <Link
                    href="/profile?edit=true"
                    className="block p-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-orange-500 text-white font-bold hover:scale-105 transition-transform text-center shadow-md"
                  >
                    <FaEdit className="inline mr-2" /> Update Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:scale-105 transition-transform text-center shadow-md"
                  >
                    <FaGem className="inline mr-2" /> Settings
                  </Link>
                </div>
              </motion.div>

              {/* Tips Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-card p-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-lg font-bold mb-3 font-display text-[var(--primary)] flex items-center gap-2 relative z-10">
                  <FaStar /> Pro Tip
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed relative z-10">
                  Boost your chances by 40%! Upload a professional photo and keep your profile updated with latest skills.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}