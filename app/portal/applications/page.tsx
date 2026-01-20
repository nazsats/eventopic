//app/portal/applications/page.tsx
"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaBriefcase,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaStar,
  FaFire,
  FaArrowRight,
  FaUsers,
  FaGem
} from "react-icons/fa";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  duration: string;
  rate: number;
  description: string;
  category: string;
}

export default function Applications() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { value: "all", label: "All Jobs", icon: "🎯", count: 0 },
    { value: "staffing", label: "Staffing", icon: "👥", count: 0 },
    { value: "models_entertainment", label: "Entertainment", icon: "🎭", count: 0 },
    { value: "promotions", label: "Promotions", icon: "📢", count: 0 },
    { value: "other", label: "Other", icon: "✨", count: 0 },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    const fetchJobs = async () => {
      try {
        const jobsCollection = collection(db, "jobs");
        const jobsSnapshot = await getDocs(jobsCollection);
        const jobsList = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          description: doc.data().description || "Join our professional team for exciting event opportunities in Dubai&apos;s vibrant scene."
        } as Job));
        setJobs(jobsList);
        setFilteredJobs(jobsList);

        // Update category counts
        categories[0].count = jobsList.length;
        categories[1].count = jobsList.filter(job => job.category === "staffing").length;
        categories[2].count = jobsList.filter(job => job.category === "models_entertainment").length;
        categories[3].count = jobsList.filter(job => job.category === "promotions").length;
        categories[4].count = jobsList.filter(job => job.category === "other").length;

        setIsLoading(false);
      } catch (error: unknown) {
        console.error("Error fetching jobs:", error instanceof Error ? error.message : "Unknown error");
        toast.error("Failed to load jobs. Please try again.");
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [user, loading, router]);

  useEffect(() => {
    let filtered = jobs;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [selectedCategory, searchQuery, jobs]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)] font-semibold">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="section-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)] rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--secondary)] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container relative z-10 min-h-[70vh] flex flex-col justify-center items-center text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-block mb-4">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold text-sm shadow-lg flex items-center gap-2">
                <FaFire />
                {filteredJobs.length} Hot Opportunities Available
              </div>
            </div>

            <h1 className="font-display text-6xl md:text-8xl font-bold mb-6 leading-tight">
              Find Your Perfect <span className="gradient-text">Role</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-[var(--text-secondary)] leading-relaxed">
              Discover exciting positions at Dubai&apos;s most prestigious events and luxury venues
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xl" />
                <input
                  type="text"
                  placeholder="Search by job title, location, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="modern-input pl-16 pr-6 py-5 text-lg shadow-xl"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-[var(--background)] border-b border-[var(--border)] backdrop-blur-xl sticky top-20 z-40">
        <div className="container">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--primary)] scrollbar-track-[var(--surface)]">
            <div className="flex items-center gap-2 text-[var(--text-primary)] flex-shrink-0">
              <FaFilter className="text-[var(--primary)]" />
              <span className="font-heading font-semibold">Filter:</span>
            </div>
            {categories.map((cat, index) => (
              <motion.button
                key={cat.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedCategory(cat.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${selectedCategory === cat.value
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg"
                    : "glass-card text-[var(--text-primary)] hover:border-[var(--border-hover)]"
                  }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${selectedCategory === cat.value
                    ? "bg-white/20 text-white"
                    : "bg-[var(--surface)] text-[var(--text-muted)]"
                  }`}>
                  {cat.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="section-standard">
        <div className="container">
          {filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="glass-card p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No jobs found</h3>
                <p className="text-[var(--text-secondary)]">Try adjusting your filters or search terms</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Link href={`/portal/applications/${job.id}`}>
                    <div className="glass-card p-6 relative overflow-hidden h-full">
                      {/* Background gradient - positioned behind content */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />

                      {/* Content Container - Always on top */}
                      <div className="relative z-20">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          {/* Job Icon */}
                          <div className="job-card-icon group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <FaBriefcase />
                          </div>

                          {/* Category Badge */}
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 border border-[var(--border)]">
                            <span className="text-xs font-bold text-[var(--primary)]">
                              {job.category === "staffing" ? "👥 Staffing" :
                                job.category === "models_entertainment" ? "🎭 Entertainment" :
                                  job.category === "promotions" ? "📢 Promotions" : "✨ Other"}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="job-card-title group-hover:gradient-text transition-all duration-300 mb-4">
                          {job.title}
                        </h3>

                        {/* Details */}
                        <div className="space-y-3 mb-4">
                          <div className="job-card-meta">
                            <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--border-hover)] transition-colors">
                              <FaMapMarkerAlt className="text-[var(--primary)] text-sm" />
                            </div>
                            <div>
                              <div className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">Location</div>
                              <div className="text-sm font-bold text-[var(--text-primary)]">{job.location}</div>
                            </div>
                          </div>

                          <div className="job-card-meta">
                            <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--border-hover)] transition-colors">
                              <FaClock className="text-[var(--secondary)] text-sm" />
                            </div>
                            <div>
                              <div className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">Type</div>
                              <div className="text-sm font-bold text-[var(--text-primary)]">{job.type} • {job.duration}</div>
                            </div>
                          </div>

                          <div className="job-card-meta">
                            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center">
                              <FaMoneyBillWave className="text-[var(--accent)] text-sm" />
                            </div>
                            <div>
                              <div className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">Rate</div>
                              <div className="text-lg font-black gradient-text-accent">AED {job.rate}/hour</div>
                            </div>
                          </div>
                        </div>

                        {/* Description Preview */}
                        {job.description && (
                          <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        )}

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] group-hover:border-[var(--border-hover)] transition-colors">
                          <span className="text-sm font-bold text-[var(--primary)]">Apply Now</span>
                          <FaArrowRight className="text-[var(--secondary)] group-hover:translate-x-2 transition-transform" />
                        </div>

                        {/* Matching Score */}
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
                            <motion.div
                              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
                              initial={{ width: "0%" }}
                              animate={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <FaStar className="text-[var(--accent)] text-xs" />
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {Math.floor(Math.random() * 40 + 60)}% Match
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-standard">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="glass-card p-12 max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 -z-10"></div>
              <div className="relative z-10">
                <FaGem className="text-5xl gradient-text mx-auto mb-6" />
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">
                  Can&apos;t Find What You&apos;re Looking For?
                </h2>
                <p className="text-xl mb-8 text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                  Submit your profile and we&apos;ll notify you when new positions match your skills and preferences.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/profile"
                    className="btn-primary text-lg px-12 py-4 inline-flex items-center gap-3"
                  >
                    <FaUsers />
                    Complete Your Profile
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}