"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaBriefcase,
  FaUserEdit,
  FaChartLine,
  FaLightbulb,
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaUsers
} from "react-icons/fa";

export default function Portal() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeJobsCount, setActiveJobsCount] = useState(128); // Mock real-time data

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    // Simulate live counter
    const interval = setInterval(() => {
      setActiveJobsCount(prev => prev + (Math.random() > 0.7 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <section className="pt-32 pb-12 min-h-screen bg-[var(--background)] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">

          {/* Simplified Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold font-display text-[var(--text-primary)]">
              Welcome, {user.displayName || "User"}
            </h1>
            <p className="text-[var(--text-secondary)]">Manage your career and access exclusive opportunities.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* MAIN ACTION: Explore Jobs (Clickbait Style) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <Link href="/portal/applications" className="block group">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] p-1">
                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
                  <div className="relative bg-[var(--background)]/90 backdrop-blur-xl rounded-[22px] p-8 h-full border border-transparent group-hover:border-white/20 transition-all">

                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-[var(--primary)]/20 p-4 rounded-2xl text-[var(--primary)] text-3xl">
                        <FaBriefcase />
                      </div>
                      <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {activeJobsCount} Active Jobs
                      </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white group-hover:text-[var(--primary)] transition-colors">
                      Explore High-Paying Roles Now
                    </h2>
                    <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-xl">
                      Don't miss out! Top brands are hiring for upcoming mega-events. Apply instantly and get hired faster than ever.
                    </p>

                    <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-lg group-hover:gap-4 transition-all">
                      Start Applying <FaArrowRight />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Side Column */}
            <div className="space-y-6">

              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-3xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-secondary)]">
                    <FaUserEdit />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">Your Profile</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Keep it updated</p>
                  </div>
                </div>
                <Link href="/profile" className="btn-secondary w-full justify-center">
                  Edit Profile
                </Link>
              </motion.div>

              {/* Your Impact (Real-time Config) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-3xl"
              >
                <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <FaChartLine className="text-[var(--accent)]" /> Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)] text-sm">Match Rate</span>
                    <span className="font-bold text-green-400">98%</span>
                  </div>
                  <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[98%]"></div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[var(--text-secondary)] text-sm">Success Rate</span>
                    <span className="font-bold text-[var(--primary)]">100%</span>
                  </div>
                  <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--primary)] h-full w-full"></div>
                  </div>
                </div>
              </motion.div>

              {/* Pro Tip */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10 border border-[var(--secondary)]/20 p-6 rounded-3xl"
              >
                <div className="flex items-start gap-3">
                  <FaLightbulb className="text-[var(--secondary)] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)] mb-2">Boost Your Visibility</h4>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                      Complete your profile and add relevant skills to appear in 3x more searches by top recruiters.
                    </p>
                    <Link href="/profile?edit=true" className="text-[var(--secondary)] text-sm font-bold hover:underline">
                      Update Skills &rarr;
                    </Link>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* Quick Actions / dashboard link */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Link href="/dashboard" className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:border-[var(--primary)] transition-all group">
              <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaChartLine />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">View Dashboard</h3>
                <p className="text-sm text-[var(--text-secondary)]">Check your applications status</p>
              </div>
              <FaArrowRight className="ml-auto text-[var(--text-muted)] group-hover:text-[var(--primary)]" />
            </Link>

            <Link href="/contact" className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:border-[var(--accent)] transition-all group">
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaUsers />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">Get Support</h3>
                <p className="text-sm text-[var(--text-secondary)]">Talk to our team 24/7</p>
              </div>
              <FaArrowRight className="ml-auto text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}