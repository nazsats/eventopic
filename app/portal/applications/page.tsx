
"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { motion, Variants } from "framer-motion";
import { toast } from "react-toastify";
import { FaBriefcase, FaClock, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { value: "all", label: "All" },
    { value: "staffing", label: "Staffing" },
    { value: "models_entertainment", label: "Models & Entertainment" },
    { value: "promotions", label: "Promotions" },
    { value: "other", label: "Other" },
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
        const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        setJobs(jobsList);
        setIsLoading(false);
      } catch (error: unknown) {
        console.error("Error fetching jobs:", error instanceof Error ? error.message : "Unknown error");
        toast.error("Failed to load jobs. Please try again.");
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="py-20 text-center flex items-center justify-center min-h-screen font-body text-[var(--text-body)]" style={{ backgroundColor: "var(--secondary)" }}>
        Loading...
      </div>
    );
  }

  if (!user) return null;

  const filteredJobs = selectedCategory === "all" ? jobs : jobs.filter(job => job.category === selectedCategory);

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 10 } },
  };

  const containerVariants: Variants = {
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", stiffness: 100 } },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 80 } },
    hover: {
      scale: 1.1,
      y: -5,
      boxShadow: "0 8px 24px rgba(0, 196, 180, 0.4)",
      backgroundColor: "var(--teal-accent)",
      borderColor: "var(--teal-accent)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <Navbar />
      <section className="py-24 min-h-screen relative" style={{ backgroundColor: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl font-bold text-center mb-16 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Job Opportunities
          </motion.h1>
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat.value}
                variants={buttonVariants}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-8 py-3 rounded-full text-lg font-bold font-body transition-all duration-300 group relative ${
                  selectedCategory === cat.value ? "bg-[var(--accent)] text-[var(--white)] shadow-xl" : "bg-[var(--primary)]/80 text-[var(--text-accent)] border border-[var(--light)]/30"
                }`}
                style={selectedCategory === cat.value ? { backgroundColor: "var(--accent)", border: "2px solid var(--light)" } : {}}
                aria-label={`Filter by ${cat.label}`}
              >
                {cat.label}
                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
              </motion.button>
            ))}
          </motion.div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredJobs.length === 0 ? (
              <p className="text-center col-span-full text-lg font-body text-[var(--text-body)]">No jobs found in this category.</p>
            ) : (
              filteredJobs.map((job) => (
                <Link href={`/portal/applications/${job.id}`} key={job.id}>
                  <motion.div
                    variants={cardVariants}
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="card p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border max-w-sm mx-auto bg-[var(--primary)]/80 backdrop-blur-sm relative overflow-hidden group cursor-pointer"
                    style={{ borderColor: "var(--light)/30" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--teal-accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <h2 className="text-2xl md:text-3xl font-semibold mb-4 font-heading flex items-center gap-2 text-[var(--text-accent)] relative z-10">
                      <FaBriefcase className="text-2xl" /> {job.title}
                    </h2>
                    <p className="mb-3 flex items-center gap-2 text-lg font-body text-[var(--text-body)] relative z-10">
                      <FaMapMarkerAlt className="text-2xl" /> {job.location}
                    </p>
                    <p className="mb-3 flex items-center gap-2 text-lg font-body text-[var(--text-body)] relative z-10">
                      <FaClock className="text-2xl" /> {job.type} - {job.duration}
                    </p>
                    <p className="mb-4 flex items-center gap-2 text-lg font-body text-[var(--text-body)] relative z-10">
                      <FaMoneyBillWave className="text-2xl" /> AED {job.rate}/hour
                    </p>
                    <p className="text-lg italic font-body text-[var(--text-accent)] relative z-10">
                      Click for full details and to apply
                    </p>
                  </motion.div>
                </Link>
              ))
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}
