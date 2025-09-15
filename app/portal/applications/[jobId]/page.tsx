"use client";

import { useAuth } from "../../../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "../../../../lib/firebase";
import Navbar from "../../../../components/Navbar";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaBriefcase, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaUser, FaEnvelope, FaComment, FaPhone } from "react-icons/fa";

interface Job {
  title: string;
  location: string;
  type: string;
  duration: string;
  rate: number;
  description: string;
  category: string;
}

interface Application {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function JobDetails() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: user?.email || "",
    mobile: "",
    coverLetter: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    const fetchJobAndApplication = async () => {
      try {
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        if (jobDoc.exists()) {
          setJob(jobDoc.data() as Job);
        } else {
          toast.error("Job not found.");
          router.push("/portal/applications");
          return;
        }

        const applicationsQuery = query(
          collection(db, "applications"),
          where("userEmail", "==", user?.email),
          where("jobId", "==", jobId)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        if (!applicationsSnapshot.empty) {
          const appDoc = applicationsSnapshot.docs[0];
          setApplication({ id: appDoc.id, status: appDoc.data().status });
        }
        setIsLoading(false);
      } catch (error: unknown) {
        console.error("Error fetching data:", error instanceof Error ? error.message : "Unknown error");
        toast.error("Failed to load job details.");
        setIsLoading(false);
      }
    };
    fetchJobAndApplication();
  }, [user, loading, router, jobId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData({ ...applicationData, [name]: value });
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, mobile, coverLetter } = applicationData;
    if (!name || !email || !mobile || !coverLetter) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!/^05\d{8}$/.test(mobile)) {
      toast.error("Please enter a valid Dubai mobile number (e.g., 05xxxxxxxx).");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        userEmail: user?.email,
        jobId,
        name,
        email,
        mobile,
        coverLetter,
        timestamp: new Date().toISOString(),
        status: "pending",
      });
      toast.success("Application submitted successfully!");
      setApplication({ id: '', status: 'pending' });
    } catch (error: unknown) {
      console.error("Error submitting application:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return <div className="py-20 text-center flex items-center justify-center min-h-screen" style={{ color: "var(--white)" }}>Loading...</div>;
  }

  if (!job) return null;

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
            {job.title}
          </motion.h1>
          <div className="max-w-3xl mx-auto card p-8 rounded-2xl shadow-2xl border border-[var(--accent)]/30 bg-[var(--primary)]/70 backdrop-blur-md">
            <div className="space-y-4 mb-8">
              <p className="text-lg" style={{ color: "var(--light)" }}>{job.description}</p>
              <p className="flex items-center gap-2" style={{ color: "var(--light)" }}>
                <FaMapMarkerAlt /> <strong>Location:</strong> {job.location}
              </p>
              <p className="flex items-center gap-2" style={{ color: "var(--light)" }}>
                <FaClock /> <strong>Type:</strong> {job.type}
              </p>
              <p className="flex items-center gap-2" style={{ color: "var(--light)" }}>
                <FaClock /> <strong>Duration:</strong> {job.duration}
              </p>
              <p className="flex items-center gap-2" style={{ color: "var(--light)" }}>
                <FaMoneyBillWave /> <strong>Rate:</strong> AED {job.rate}/hour
              </p>
              <p className="flex items-center gap-2" style={{ color: "var(--light)" }}>
                <FaBriefcase /> <strong>Category:</strong> {job.category.charAt(0).toUpperCase() + job.category.slice(1).replace('_', ' ')}
              </p>
            </div>

            {application ? (
              <div className="text-center p-4 rounded-xl bg-[var(--soft)]">
                <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--color-accent)" }}>Application Status: {application.status.toUpperCase()}</h3>
                <p style={{ color: "var(--light)" }}>You have already applied for this job.</p>
              </div>
            ) : (
              <motion.form 
                onSubmit={submitApplication}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold font-heading flex items-center gap-2" style={{ color: "var(--color-accent)" }}>
                  <FaBriefcase /> Apply for this Job
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: "var(--light)" }}>
                    <FaUser /> Full Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={applicationData.name}
                    onChange={handleInputChange}
                    className="neumorphic-input w-full"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: "var(--light)" }}>
                    <FaEnvelope /> Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={applicationData.email}
                    onChange={handleInputChange}
                    className="neumorphic-input w-full"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: "var(--light)" }}>
                    <FaPhone /> Mobile No. (Dubai)*
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={applicationData.mobile}
                    onChange={handleInputChange}
                    className="neumorphic-input w-full"
                    placeholder="05xxxxxxxx"
                    pattern="05\d{8}"
                    title="Dubai mobile: 05 followed by 8 digits"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: "var(--light)" }}>
                    <FaComment /> Cover Letter*
                  </label>
                  <textarea
                    name="coverLetter"
                    value={applicationData.coverLetter}
                    onChange={handleInputChange}
                    className="neumorphic-input w-full"
                    rows={5}
                    placeholder="Why are you a good fit for this role?"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full p-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}