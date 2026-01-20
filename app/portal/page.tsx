//app/portal/page.tsx
"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  FaBriefcase, 
  FaUserTie, 
  FaTachometerAlt,
  FaRocket,
  FaStar,
  FaChartLine,
  FaArrowRight,
  FaFire,
  FaGem,
  FaShieldAlt,
  FaBell
} from "react-icons/fa";

export default function Portal() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?mode=signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)] font-semibold">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const portalCards = [
    {
      icon: <FaBriefcase className="text-5xl text-white" />,
      title: "Explore Jobs",
      desc: "Browse exciting opportunities and apply for positions that match your skills and career goals.",
      link: "/portal/applications",
      gradient: "from-[var(--primary)] to-[var(--secondary)]",
      stats: "50+ Active Positions",
      badge: "Hot",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      features: ["Quick Apply", "AI Matching", "Instant Updates"],
      bgPattern: "🎯"
    },
    {
      icon: <FaTachometerAlt className="text-5xl text-white" />,
      title: "Your Dashboard",
      desc: "Track applications, manage profile, and view personalized job recommendations tailored to you.",
      link: "/dashboard",
      gradient: "from-blue-500 to-cyan-500",
      stats: "Your Career Hub",
      badge: "New",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      features: ["Application Status", "Profile Analytics", "Job Alerts"],
      bgPattern: "📊"
    },
    {
      icon: <FaUserTie className="text-5xl text-white" />,
      title: "Profile Manager",
      desc: "Update your skills, experience, and preferences to get better job matches and opportunities.",
      link: "/profile",
      gradient: "from-green-500 to-emerald-500",
      stats: "Stand Out",
      badge: "Pro",
      badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
      features: ["Skill Showcase", "Portfolio", "Recommendations"],
      bgPattern: "💎"
    },
  ];

  const quickStats = [
    { label: "Profile Views", value: "1.2K", icon: "👁️", trend: "+23%", color: "text-blue-400" },
    { label: "Applications", value: "12", icon: "📄", trend: "+5", color: "text-green-400" },
    { label: "Matches", value: "8", icon: "✨", trend: "New", color: "text-purple-400" },
    { label: "Success Rate", value: "67%", icon: "🎯", trend: "+12%", color: "text-orange-400" },
  ];

  const tips = [
    "Complete your profile to increase visibility by 3x",
    "Upload a professional photo to boost application success",
    "Respond within 24 hours to interview requests",
    "Check daily for new matches and opportunities"
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="section-hero relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)] rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--secondary)] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container relative z-10 min-h-screen flex flex-col justify-center items-center text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto shadow-2xl relative">
                <FaRocket className="text-3xl text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center">
                  <FaBell className="text-white text-xs" />
                </div>
              </div>
            </motion.div>
            
            <h1 className="font-display text-6xl md:text-8xl font-bold mb-6 leading-tight">
              Welcome Back, <br />
              <span className="gradient-text">
                {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || "Professional"}
              </span>!
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-[var(--text-secondary)] leading-relaxed">
              Your career journey starts here. Explore opportunities, track progress, and land your dream role.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="glass-card px-6 py-3">
                <span className="text-[var(--text-secondary)] font-semibold">✉️ {user.email}</span>
              </div>
              <div className="px-6 py-3 rounded-16 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold shadow-lg">
                ⭐ Premium Member
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="section-standard">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-bold text-center mb-16 gradient-text"
          >
            Your Portal Dashboard
          </motion.h2>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {portalCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative"
              >
                <Link href={card.link}>
                  <div className="glass-card p-8 relative overflow-hidden h-full">
                    {/* Background Pattern */}
                    <div className="absolute top-4 right-4 text-6xl opacity-5">
                      {card.bgPattern}
                    </div>

                    {/* Badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full ${card.badgeColor} backdrop-blur-sm border`}>
                      <span className="text-xs font-bold">{card.badge}</span>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon with gradient background */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        {card.icon}
                      </div>

                      <h3 className="font-heading text-2xl font-bold mb-3 text-[var(--text-primary)] group-hover:gradient-text transition-all duration-300">
                        {card.title}
                      </h3>
                      
                      <p className="text-[var(--text-secondary)] mb-4 text-lg leading-relaxed">
                        {card.desc}
                      </p>

                      {/* Stats */}
                      <div className="mb-6 px-4 py-2 rounded-12 bg-[var(--surface)] border border-[var(--border)] inline-block">
                        <span className="text-[var(--text-primary)] font-bold text-sm">{card.stats}</span>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {card.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-[var(--text-secondary)]">
                            <FaStar className="text-[var(--accent)] text-sm" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                        <span className="text-[var(--text-primary)] font-bold text-lg">Explore Now</span>
                        <FaArrowRight className="text-[var(--primary)] group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="section-standard">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-display text-4xl font-bold text-center mb-12 text-[var(--text-primary)]"
          >
            Your Impact at a Glance
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {quickStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card p-6 text-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-[var(--text-secondary)] mb-2">{stat.label}</div>
                  <div className="text-xs font-bold text-green-400 bg-green-500/10 rounded-full px-2 py-1 inline-block border border-green-500/20">
                    {stat.trend}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="section-standard">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-card p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 -z-10"></div>
              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                      <FaChartLine className="text-white text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-2xl font-bold mb-4 text-[var(--text-primary)]">
                      💡 Pro Tips for Success
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {tips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-start gap-3 text-[var(--text-secondary)]"
                        >
                          <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[var(--primary)] font-bold text-sm">{index + 1}</span>
                          </div>
                          <span className="leading-relaxed">{tip}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}