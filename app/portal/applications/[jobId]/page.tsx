
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import { doc, getDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
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
    email: "",
    mobile: "",
    coverLetter: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync applicationData with user data when user changes
  useEffect(() => {
    if (user) {
      console.log("JobDetails: Updating applicationData with user data", { name: user.displayName, email: user.email });
      setApplicationData((prev) => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      console.log("JobDetails: No user, allowing job details view");
    }

    const fetchJobAndApplication = async () => {
      try {
        if (typeof jobId !== "string") {
          console.log("JobDetails: Invalid job ID", jobId);
          toast.error("Invalid job ID.");
          router.push("/portal/applications");
          return;
        }

        const jobDoc = doc(db, "jobs", jobId);
        const jobSnapshot = await getDoc(jobDoc);
        if (!jobSnapshot.exists()) {
          console.log("JobDetails: Job not found for ID", jobId);
          toast.error("Job not found.");
          router.push("/portal/applications");
          return;
        }
        const jobData = { id: jobSnapshot.id, ...jobSnapshot.data() } as Job;
        setJob(jobData);
        console.log("JobDetails: Fetched job data:", jobData);

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
            console.log("JobDetails: Fetched application data:", appData);
          } else {
            console.log("JobDetails: No existing application found for user", user.email);
          }
        }
      } catch (error) {
        console.error("JobDetails: Error fetching job:", error);
        toast.error("Failed to load job details.");
      }
    };

    fetchJobAndApplication();
  }, [jobId, user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    console.log("JobDetails: Input changed:", { name: e.target.name, value: e.target.value });
    setApplicationData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("JobDetails: Form submitted with data:", applicationData);
    if (!user) {
      console.log("JobDetails: Submit attempted without user");
      setIsModalOpen(true);
      return;
    }

    if (!applicationData.name || !applicationData.email || !applicationData.mobile || !applicationData.coverLetter) {
      console.log("JobDetails: Validation failed, missing fields:", applicationData);
      toast.error("Please fill in all fields.");
      return;
    }

    if (!/^05\d{8}$/.test(applicationData.mobile)) {
      console.log("JobDetails: Invalid mobile number:", applicationData.mobile);
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
      console.log("JobDetails: Application submitted successfully");
      toast.success("Application submitted successfully!");
      setApplication({ id: "", status: "pending" });
    } catch (error) {
      console.error("JobDetails: Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified animation variants to avoid conflicts
  const textVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
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
            className="text-5xl md:text-6xl font-bold text-center mb-12 font-heading text-[var(--text-accent)]"
          >
            {job.title}
          </motion.h1>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card p-10 rounded-2xl shadow-xl max-w-3xl mx-auto border bg-[var(--primary)]/80 backdrop-blur-sm"
            style={{ borderColor: "var(--light)/30" }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 font-heading flex items-center gap-2 text-[var(--text-accent)]">
              <FaBriefcase className="text-2xl" /> Job Details
            </h2>
            <p className="mb-3 flex items-center gap-2 text-lg font-body text-[var(--text-body)]">
              <FaMapMarkerAlt className="text-2xl" /> <strong>Location:</strong> {job.location}
            </p>
            <p className="mb-3 flex items-center gap-2 text-lg font-body text-[var(--text-body)]">
              <FaClock className="text-2xl" /> <strong>Type:</strong> {job.type}
            </p>
            <p className="mb-3 flex items-center gap-2 text-lg font-body text-[var(--text-body)]">
              <FaClock className="text-2xl" /> <strong>Duration:</strong> {job.duration}
            </p>
            <p className="mb-6 flex items-center gap-2 text-lg font-body text-[var(--text-body)]">
              <FaMoneyBillWave className="text-2xl" /> <strong>Rate:</strong> AED {job.rate}/hour
            </p>
            <p className="mb-6 text-lg font-body text-[var(--text-body)]">
              <strong>Description:</strong> {job.description}
            </p>

            {user ? (
              application ? (
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-6 p-8 rounded-lg border bg-[var(--primary)]/50 backdrop-blur-sm"
                  style={{ borderColor: "var(--light)/20" }}
                >
                  <p className="flex items-center gap-2 text-lg font-semibold font-body text-[var(--text-accent)]">
                    <FaExclamationTriangle className="text-2xl" /> Application Status: {application.status}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-6 font-heading text-[var(--text-accent)]">
                    Apply for this Job
                  </h2>
                  {[
                    { label: "Full Name", name: "name", type: "text", placeholder: "Enter your full name" },
                    { label: "Email", name: "email", type: "email", placeholder: "Enter your email" },
                    { label: "Mobile Number", name: "mobile", type: "text", placeholder: "Enter your mobile number (e.g., 05xxxxxxxx)" },
                  ].map((field, index) => (
                    <div key={field.name} className="mb-6">
                      <label htmlFor={field.name} className="block mb-2 text-lg font-semibold font-body text-[var(--text-accent)]">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        id={field.name}
                        value={applicationData[field.name as keyof typeof applicationData]}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-lg text-lg font-body bg-[var(--primary)]/50 border border-[var(--light)]/30 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--teal-accent)]/50 focus:outline-none"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                  <div className="mb-6">
                    <label htmlFor="coverLetter" className="block mb-2 text-lg font-semibold font-body text-[var(--text-accent)]">
                      Cover Letter
                    </label>
                    <textarea
                      name="coverLetter"
                      id="coverLetter"
                      value={applicationData.coverLetter}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-lg text-lg font-body bg-[var(--primary)]/50 border border-[var(--light)]/30 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--teal-accent)]/50 focus:outline-none"
                      placeholder="Why are you a good fit for this role?"
                      rows={5}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    variants={buttonVariants}
                    className={`w-full py-4 px-10 rounded-full text-xl font-bold font-body ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </motion.button>
                </form>
              )
            ) : (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="mt-8 text-center"
              >
                <motion.button
                  variants={buttonVariants}
                  onClick={() => setIsModalOpen(true)}
                  className="px-10 py-4 rounded-full text-xl font-bold font-body"
                  style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                  aria-label="Log in to Apply"
                >
                  Log in to Apply
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
        <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode="signin" />
      </section>
      <Footer />
      <style jsx>{`
        input, textarea {
          pointer-events: auto !important;
          user-select: text !important;
          opacity: 1 !important;
          cursor: text !important;
        }
        input:focus, textarea:focus {
          outline: none;
          border-color: var(--teal-accent);
          box-shadow: 0 0 0 2px var(--teal-accent);
        }
        input::placeholder, textarea::placeholder {
          color: var(--text-body);
          opacity: 0.7;
        }
      `}</style>
    </>
  );
}
