"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../../lib/firebase";
import Navbar from "../../../components/Navbar";
import { motion } from "framer-motion";
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
    return <div className="py-20 text-center flex items-center justify-center min-h-screen" style={{ color: "var(--white)" }}>Loading...</div>;
  }

  if (!user) return null;

  const filteredJobs = selectedCategory === "all" 
    ? jobs 
    : jobs.filter(job => job.category === selectedCategory);

  return (
    <>
      <Navbar />
      <section className="py-20 bg-[var(--secondary)] min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading relative" 
            style={{ color: "var(--white)", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            Job Opportunities
          </motion.h1>
          <div className="flex flex-col md:flex-row justify-center mb-12 space-y-4 md:space-y-0 md:space-x-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === cat.value 
                    ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)] shadow-lg" 
                    : "bg-[var(--accent)] text-[var(--white)] hover:bg-gradient-to-r hover:from-[var(--color-accent)] hover:to-[var(--teal-accent)] hover:text-[var(--primary)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.length === 0 ? (
              <p className="text-center col-span-full" style={{ color: "var(--light)" }}>No jobs found in this category.</p>
            ) : (
              filteredJobs.map((job) => (
                <Link href={`/portal/applications/${job.id}`} key={job.id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    className="job-card cursor-pointer"
                  >
                    <h2 className="text-2xl font-semibold mb-4 font-heading flex items-center gap-2" style={{ color: "var(--color-accent)" }}>
                      <FaBriefcase /> {job.title}
                    </h2>
                    <p className="mb-2 flex items-center gap-2 text-sm" style={{ color: "var(--light)" }}>
                      <FaMapMarkerAlt /> {job.location}
                    </p>
                    <p className="mb-2 flex items-center gap-2 text-sm" style={{ color: "var(--light)" }}>
                      <FaClock /> {job.type} - {job.duration}
                    </p>
                    <p className="mb-4 flex items-center gap-2 text-sm" style={{ color: "var(--light)" }}>
                      <FaMoneyBillWave /> AED {job.rate}/hour
                    </p>
                    <p className="text-sm italic group-hover:underline" style={{ color: "var(--teal-accent)" }}>
                      Click for full details and to apply
                    </p>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}