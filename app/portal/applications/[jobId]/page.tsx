
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import { doc, getDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { toast } from "react-toastify";
import { motion, Variants } from "framer-motion";
import AuthModal from "../../../../components/AuthModal";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa";

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

export default function JobDetails() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<{ id: string; status: string } | null>(null);
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: user?.email || "",
    mobile: "",
    coverLetter: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // No redirect; allow unauthenticated users to view job details
    }

    const fetchJobAndApplication = async () => {
      try {
        if (typeof jobId !== "string") {
          toast.error("Invalid job ID.");
          router.push("/portal/applications");
          return;
        }

        const jobDoc = doc(db, "jobs", jobId);
        const jobSnapshot = await getDoc(jobDoc);
        if (!jobSnapshot.exists()) {
          toast.error("Job not found.");
          router.push("/portal/applications");
          return;
        }
        setJob({ id: jobSnapshot.id, ...jobSnapshot.data() } as Job);

        if (user) {
          const applicationsQuery = query(
            collection(db, "applications"),
            where("userEmail", "==", user.email),
            where("jobId", "==", jobId)
          );
          const applicationsSnapshot = await getDocs(applicationsQuery);
          if (!applicationsSnapshot.empty) {
            const appData = applicationsSnapshot.docs[0].data();
            setApplication({ id: applicationsSnapshot.docs[0].id, status: appData.status });
          }
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details.");
      }
    };

    fetchJobAndApplication();
  }, [jobId, user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setApplicationData({ ...applicationData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!applicationData.name || !applicationData.email || !applicationData.mobile || !applicationData.coverLetter) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!/^05\d{8}$/.test(applicationData.mobile)) {
      toast.error("Please enter a valid Dubai mobile number (e.g., 05xxxxxxxx).");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        userEmail: user.email,
        jobId,
        ...applicationData,
        timestamp: new Date().toISOString(),
        status: "pending",
      });
      toast.success("Application submitted successfully!");
      setApplication({ id: "", status: "pending" });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 font-body text-[var(--text-body)]" style={{ backgroundColor: "var(--secondary)" }}>
          Loading...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="min-h-screen py-24 relative" style={{ backgroundColor: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl font-bold text-center mb-12 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            {job.title}
          </motion.h1>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card p-10 rounded-2xl shadow-xl max-w-3xl mx-auto border bg-[var(--primary)]/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group relative"
            style={{ borderColor: "var(--light)/30" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--teal-accent)]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 font-heading flex items-center gap-2 text-[var(--text-accent)] relative z-10">
              <FaBriefcase className="text-2xl" /> Job Details
            </h2>
            <p className="mb-3 flex items-center gap-2 text-lg font-body text-[var(--text-body)] relative z-10">
              <FaMapMarkerAlt className="text-2xl" /> <strong>Location:</strong> {job.location}
            </p>
            <p className="mb-3 flex items-center gap-2 text-lg font-body text-[var(--text-body)] relative z-10">
              <FaClock className="text-2xl" /> <strong>Type:</strong> {job.type}
            </p>
            <p className="mb-3 flex items-center gap-2 text-lg font-body text-[var(--text-body)] relative z-10">
              <FaClock className="text-2xl" /> <strong>Duration:</strong> {job.duration}
            </p>
            <p className="mb-6 flex items-center gap-2 text-lg font-body text-[var(--text-body)] relative z-10">
              <FaMoneyBillWave className="text-2xl" /> <strong>Rate:</strong> AED {job.rate}/hour
            </p>
            <p className="mb-6 text-lg font-body text-[var(--text-body)] relative z-10">
              <strong>Description:</strong> {job.description}
            </p>

            {user ? (
              application ? (
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-6 p-8 rounded-lg border bg-[var(--primary)]/50 backdrop-blur-sm relative z-10"
                  style={{ borderColor: "var(--light)/20" }}
                >
                  <p className="flex items-center gap-2 text-lg font-semibold font-body text-[var(--text-accent)]">
                    <FaExclamationTriangle className="text-2xl" /> Application Status: {application.status}
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className="mt-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-2xl md:text-3xl font-semibold mb-6 font-heading text-[var(--text-accent)] relative z-10">
                    Apply for this Job
                  </h2>
                  {[
                    { label: "Full Name", name: "name", type: "text", placeholder: "Enter your full name" },
                    { label: "Email", name: "email", type: "email", placeholder: "Enter your email", disabled: true },
                    { label: "Mobile Number", name: "mobile", type: "text", placeholder: "Enter your mobile number (e.g., 05xxxxxxxx)" },
                  ].map((field, index) => (
                    <motion.div
                      key={field.name}
                      variants={cardVariants}
                      transition={{ delay: index * 0.2 }}
                      className="mb-6"
                    >
                      <label htmlFor={field.name} className="block mb-2 text-lg font-semibold font-body text-[var(--text-accent)]">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={applicationData[field.name as keyof typeof applicationData]}
                        onChange={handleInputChange}
                        disabled={field.disabled}
                        className="w-full p-4 rounded-lg text-lg font-body bg-[var(--primary)]/50 border border-[var(--light)]/30 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--teal-accent)]/50 focus:outline-none transition-all duration-300"
                        placeholder={field.placeholder}
                      />
                    </motion.div>
                  ))}
                  <motion.div
                    variants={cardVariants}
                    transition={{ delay: 0.6 }}
                    className="mb-6"
                  >
                    <label htmlFor="coverLetter" className="block mb-2 text-lg font-semibold font-body text-[var(--text-accent)]">
                      Cover Letter
                    </label>
                    <textarea
                      name="coverLetter"
                      value={applicationData.coverLetter}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-lg text-lg font-body bg-[var(--primary)]/50 border border-[var(--light)]/30 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--teal-accent)]/50 focus:outline-none transition-all duration-300"
                      placeholder="Why are you a good fit for this role?"
                      rows={5}
                    />
                  </motion.div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    variants={buttonVariants}
                    className={`w-full py-4 px-10 rounded-full text-xl font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 relative z-10 group ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                    <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                  </motion.button>
                </motion.form>
              )
            ) : (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="mt-8 text-center group relative"
              >
                <motion.button
                  variants={buttonVariants}
                  onClick={() => setIsModalOpen(true)}
                  className="px-10 py-4 rounded-full text-xl font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block focus:ring-4 focus:ring-[var(--teal-accent)]/50 relative z-10"
                  style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                  aria-label="Log in to Apply"
                >
                  Log in to Apply
                  <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
        <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode="signin" />
      </section>
      <Footer />
      <style jsx>{`
        input::placeholder,
        textarea::placeholder {
          color: var(--text-body);
          opacity: 0.7;
        }
      `}</style>
    </>
  );
}
