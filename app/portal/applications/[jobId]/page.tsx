//app/portal/applications/[jobId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import { doc, getDoc, collection, getDocs, query, where, addDoc, orderBy, limit } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import AuthModal from "../../../../components/AuthModal";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import Link from "next/link";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaPaperPlane,
  FaCalendar,
  FaExclamationTriangle,
  FaStar,
  FaHeart,
  FaShare,
  FaBookmark,
  FaUsers,
  FaChartLine,
  FaLightbulb,
  FaArrowRight,
  FaInfoCircle,
  FaShieldAlt,
  FaRocket,
  FaTrophy,
  FaGem,
  FaFire,
  FaCertificate,
  FaGraduationCap,
  FaLanguage,
  FaHandshake
} from "react-icons/fa";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  duration: string;
  rate: number;
  description: string;
  category: string;
  requirements?: string[];
  benefits?: string[];
  companyInfo?: string;
}

interface Profile {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  city?: string;
}

interface RelatedJob {
  id: string;
  title: string;
  category: string;
  rate: number;
  location: string;
}

export default function JobDetails() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<RelatedJob[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [application, setApplication] = useState<{ id: string; status: string } | null>(null);
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    mobile: "",
    whatsapp: "",
    availability: "",
    experience: "",
    whyYou: "",
    skills: "",
    languages: "",
  });
  const [formProgress, setFormProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'apply' | 'company'>('overview');

  // Mock company data - in real app this would come from job data
  const companyData = {
    name: "Eventopic",
    rating: 4.8,
    employees: "500+",
    founded: "2021",
    industry: "Event Management",
    benefits: ["Health Insurance", "Flexible Hours", "Career Growth", "Team Events"],
    culture: "We foster creativity, innovation, and excellence in everything we do."
  };

  // Calculate form progress
  useEffect(() => {
    const requiredFields = ['name', 'email', 'mobile', 'availability', 'whyYou'];
    const filledFields = requiredFields.filter(field =>
      applicationData[field as keyof typeof applicationData]
    ).length;
    const progress = Math.round((filledFields / requiredFields.length) * 100);
    setFormProgress(progress);
  }, [applicationData]);

  // Fetch job, profile, and related jobs
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (typeof jobId !== "string") {
          toast.error("Invalid job ID.");
          router.push("/portal/applications");
          return;
        }

        // Fetch job
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        if (!jobDoc.exists()) {
          toast.error("Job not found.");
          router.push("/portal/applications");
          return;
        }

        const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
        setJob(jobData);

        // Fetch related jobs
        const relatedQuery = query(
          collection(db, "jobs"),
          where("category", "==", jobData.category),
          orderBy("rate", "desc"),
          limit(3)
        );
        const relatedSnapshot = await getDocs(relatedQuery);
        const relatedJobsList = relatedSnapshot.docs
          .filter(doc => doc.id !== jobId)
          .map(doc => ({ id: doc.id, ...doc.data() } as RelatedJob))
          .slice(0, 2);
        setRelatedJobs(relatedJobsList);

        // Fetch user profile if logged in
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data() as Profile;
            setProfile(profileData);

            // Auto-fill form
            setApplicationData(prev => ({
              ...prev,
              name: `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() || user.displayName || "",
              email: user.email || "",
              mobile: profileData.phoneNumber || "",
              whatsapp: profileData.whatsappNumber || profileData.phoneNumber || "",
            }));
          }

          // Check existing application
          const appsQuery = query(
            collection(db, "applications"),
            where("userEmail", "==", user.email),
            where("jobId", "==", jobId)
          );
          const appsSnapshot = await getDocs(appsQuery);
          if (!appsSnapshot.empty) {
            const appData = appsSnapshot.docs[0].data();
            setApplication({ id: appsSnapshot.docs[0].id, status: appData.status });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load job details.");
      }
    };

    fetchData();
  }, [jobId, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setApplicationData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Job removed from saved" : "Job saved for later!");
  };

  const handleShare = async (platform?: string) => {
    const shareData = {
      title: `${job?.title} at Eventopic`,
      text: `Check out this ${job?.title} position in ${job?.location}`,
      url: window.location.href,
    };

    if (platform === 'copy') {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } else if (navigator.share) {
      await navigator.share(shareData);
    }
    setShowShareMenu(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setIsModalOpen(true);
      return;
    }

    // Enhanced validation
    const errors: string[] = [];

    if (!applicationData.name.trim()) errors.push("Full name is required");
    if (!applicationData.email.trim()) errors.push("Email is required");
    if (!applicationData.mobile.trim()) errors.push("Mobile number is required");
    if (!applicationData.availability) errors.push("Availability is required");
    if (!applicationData.whyYou.trim()) errors.push("Please tell us why you're a good fit");

    if (!/^05\d{8}$/.test(applicationData.mobile.replace(/\s/g, ""))) {
      errors.push("Please enter a valid Dubai mobile number (05xxxxxxxx)");
    }

    if (applicationData.whyYou.length < 50) {
      errors.push("Please provide at least 50 characters explaining why you're a good fit");
    }

    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        userEmail: user.email,
        jobId,
        jobTitle: job?.title,
        ...applicationData,
        timestamp: new Date().toISOString(),
        status: "pending",
      });

      toast.success("Application submitted successfully!");
      setApplication({ id: "", status: "pending" });
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMatchScore = () => {
    // Simple matching algorithm based on filled profile
    let score = 60; // Base score
    if (applicationData.experience) score += 15;
    if (applicationData.skills) score += 15;
    if (applicationData.languages) score += 10;
    return Math.min(score, 95);
  };

  const defaultRequirements = [
    "Valid UAE residence or work permit",
    "Professional appearance and attitude",
    "Excellent communication skills",
    "Punctual and reliable",
    "Team player with positive energy"
  ];

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)] font-semibold">Loading job details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="section-hero relative overflow-hidden pt-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)] rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--secondary)] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container relative z-10 py-16">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <ol className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
              <li><Link href="/portal" className="hover:text-[var(--primary)] transition-colors">Portal</Link></li>
              <li>/</li>
              <li><Link href="/portal/applications" className="hover:text-[var(--primary)] transition-colors">Jobs</Link></li>
              <li>/</li>
              <li className="text-[var(--text-primary)] font-semibold">{job.title}</li>
            </ol>
          </motion.nav>

          {/* Job Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 mb-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 -z-10"></div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="job-card-icon">
                    <FaBriefcase />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 border border-[var(--border)] text-[var(--primary)] text-sm font-bold">
                      {job.category === "staffing" ? "👥 Staffing" :
                        job.category === "models_entertainment" ? "🎭 Entertainment" :
                          job.category === "promotions" ? "📢 Promotions" : "✨ Other"}
                    </span>
                    {user && (
                      <div className="inline-flex items-center gap-2 ml-3">
                        <FaStar className="text-[var(--accent)] text-sm" />
                        <span className="text-sm font-bold text-[var(--text-primary)]">{getMatchScore()}% Match</span>
                      </div>
                    )}
                  </div>
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">
                  {job.title}
                </h1>

                <div className="grid md:grid-cols-3 gap-4 text-[var(--text-secondary)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                      <FaMapMarkerAlt className="text-[var(--primary)]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Location</div>
                      <div className="font-bold text-[var(--text-primary)]">{job.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                      <FaClock className="text-[var(--secondary)]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Type</div>
                      <div className="font-bold text-[var(--text-primary)]">{job.type} • {job.duration}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center">
                      <FaMoneyBillWave className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Hourly Rate</div>
                      <div className="text-2xl font-black gradient-text-accent">AED {job.rate}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={handleSaveJob}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`btn-secondary flex items-center gap-2 ${isSaved ? 'text-red-400 border-red-400' : ''}`}
                >
                  <FaHeart className={isSaved ? 'text-red-400' : ''} />
                  {isSaved ? 'Saved' : 'Save Job'}
                </motion.button>

                <div className="relative">
                  <motion.button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FaShare />
                    Share
                  </motion.button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute top-full mt-2 right-0 glass-card p-4 min-w-48 z-20"
                      >
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                        >
                          📋 Copy Link
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!application && (
                  <motion.button
                    onClick={() => setActiveTab('apply')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FaRocket />
                    Apply Now
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="glass-card p-2 inline-flex rounded-full">
              {[
                { id: 'overview', label: 'Job Overview', icon: <FaInfoCircle /> },
                { id: 'apply', label: 'Apply', icon: <FaPaperPlane /> },
                { id: 'company', label: 'Company Info', icon: <FaUsers /> }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2 space-y-6">
                  {/* Job Description */}
                  <div className="glass-card p-8">
                    <h3 className="font-heading text-2xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                      <FaGem className="text-[var(--primary)]" />
                      Job Description
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-lg mb-6">
                      {job.description}
                    </p>

                    {/* Quick Stats */}
                    <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--primary)] mb-1">⚡</div>
                        <div className="text-sm text-[var(--text-muted)]">Fast-paced</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--secondary)] mb-1">🤝</div>
                        <div className="text-sm text-[var(--text-muted)]">Team-oriented</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--accent)] mb-1">🎯</div>
                        <div className="text-sm text-[var(--text-muted)]">Goal-driven</div>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="glass-card p-8">
                    <h3 className="font-heading text-2xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
                      <FaShieldAlt className="text-[var(--secondary)]" />
                      Requirements
                    </h3>
                    <div className="space-y-3">
                      {(job.requirements || defaultRequirements).map((req, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <FaCheckCircle className="text-[var(--primary)] mt-1 flex-shrink-0" />
                          <span className="text-[var(--text-secondary)]">{req}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="glass-card p-8">
                    <h3 className="font-heading text-2xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
                      <FaTrophy className="text-[var(--accent)]" />
                      What We Offer
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(job.benefits || [
                        "Competitive hourly rates",
                        "Flexible scheduling",
                        "Professional development",
                        "Networking opportunities",
                        "Career growth potential",
                        "Team events and recognition"
                      ]).map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <FaStar className="text-[var(--accent)] flex-shrink-0" />
                          <span className="text-[var(--text-secondary)]">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Application Tips */}
                  <div className="glass-card p-6">
                    <h4 className="font-heading text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                      <FaLightbulb className="text-[var(--accent)]" />
                      Application Tips
                    </h4>
                    <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-start gap-2">
                        <span className="text-[var(--primary)] font-bold">1.</span>
                        <span>Complete your profile for better chances</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[var(--primary)] font-bold">2.</span>
                        <span>Highlight relevant experience clearly</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[var(--primary)] font-bold">3.</span>
                        <span>Respond to interview requests quickly</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[var(--primary)] font-bold">4.</span>
                        <span>Be specific about your availability</span>
                      </div>
                    </div>
                  </div>

                  {/* Processing Time */}
                  <div className="glass-card p-6">
                    <h4 className="font-heading text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                      <FaClock className="text-[var(--secondary)]" />
                      Processing Time
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Application Review:</span>
                        <span className="font-bold text-[var(--text-primary)]">1-2 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Interview Process:</span>
                        <span className="font-bold text-[var(--text-primary)]">2-3 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Final Decision:</span>
                        <span className="font-bold text-[var(--text-primary)]">1-2 days</span>
                      </div>
                    </div>
                  </div>

                  {/* Related Jobs */}
                  {relatedJobs.length > 0 && (
                    <div className="glass-card p-6">
                      <h4 className="font-heading text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                        <FaFire className="text-[var(--accent)]" />
                        Similar Jobs
                      </h4>
                      <div className="space-y-3">
                        {relatedJobs.map((relatedJob) => (
                          <Link
                            key={relatedJob.id}
                            href={`/portal/applications/${relatedJob.id}`}
                            className="block p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all group"
                          >
                            <div className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                              {relatedJob.title}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)] flex items-center justify-between mt-1">
                              <span>{relatedJob.location}</span>
                              <span className="font-bold text-[var(--accent)]">AED {relatedJob.rate}/hr</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'apply' && (
              <motion.div
                key="apply"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                {user ? (
                  application ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card p-12 text-center relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 -z-10"></div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-6" />
                      </motion.div>
                      <h2 className="font-display text-4xl font-bold mb-4 text-[var(--text-primary)]">
                        Application Submitted!
                      </h2>
                      <p className="text-xl text-[var(--text-secondary)] mb-4">
                        Status: <span className="font-bold capitalize text-[var(--primary)]">{application.status}</span>
                      </p>
                      <p className="text-[var(--text-secondary)] mb-8">
                        We&apos;ll notify you once we review your application. Expected response within 2-3 business days.
                      </p>
                      <div className="flex justify-center gap-4">
                        <Link href="/dashboard" className="btn-primary">
                          View Dashboard
                        </Link>
                        <Link href="/portal/applications" className="btn-secondary">
                          Browse More Jobs
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-8 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 -z-10"></div>

                      {/* Progress Indicator */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="font-display text-3xl font-bold text-[var(--text-primary)]">
                            Job Application
                          </h2>
                          <span className="text-sm font-bold text-[var(--primary)]">
                            {formProgress}% Complete
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: `${formProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      <form onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Personal Information */}
                          <div className="md:col-span-2">
                            <h3 className="font-heading text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                              <FaUser className="text-[var(--primary)]" />
                              Personal Information
                            </h3>
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-bold text-[var(--text-primary)]">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={applicationData.name}
                              onChange={handleInputChange}
                              className="modern-input"
                              placeholder="Your full name"
                              required
                            />
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-bold text-[var(--text-primary)]">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={applicationData.email}
                              onChange={handleInputChange}
                              className="modern-input opacity-60"
                              placeholder="your.email@example.com"
                              required
                              readOnly
                            />
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-bold text-[var(--text-primary)]">
                              Mobile Number *
                            </label>
                            <input
                              type="tel"
                              name="mobile"
                              value={applicationData.mobile}
                              onChange={handleInputChange}
                              className="modern-input"
                              placeholder="05xxxxxxxx"
                              required
                            />
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-bold text-[var(--text-primary)]">
                              WhatsApp Number
                            </label>
                            <input
                              type="tel"
                              name="whatsapp"
                              value={applicationData.whatsapp}
                              onChange={handleInputChange}
                              className="modern-input"
                              placeholder="Same as mobile or different"
                            />
                          </div>

                          {/* Job-Specific Information */}
                          <div className="md:col-span-2 mt-6">
                            <h3 className="font-heading text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                              <FaBriefcase className="text-[var(--secondary)]" />
                              Job-Specific Information
                            </h3>
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-bold text-[var(--text-primary)]">
                              When can you start? *
                            </label>
                            <select
                              name="availability"
                              value={applicationData.availability}
                              onChange={handleInputChange}
                              className="modern-input"
                              required
                            >
                              <option value="">Select your availability</option>
                              <option value="immediately">Immediately</option>
                              <option value="1week">Within 1 week</option>
                              <option value="2weeks">Within 2 weeks</option>
                              <option value="1month">Within 1 month</option>
                            </select>
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-bold text-[var(--text-primary)]">
                              Languages Spoken
                            </label>
                            <input
                              type="text"
                              name="languages"
                              value={applicationData.languages}
                              onChange={handleInputChange}
                              className="modern-input"
                              placeholder="e.g., English, Arabic, Hindi..."
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-bold text-[var(--text-primary)]">
                              Relevant Skills
                            </label>
                            <input
                              type="text"
                              name="skills"
                              value={applicationData.skills}
                              onChange={handleInputChange}
                              className="modern-input"
                              placeholder="e.g., Customer service, Public speaking, Event coordination..."
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-bold text-[var(--text-primary)]">
                              Relevant Experience (Optional)
                            </label>
                            <textarea
                              name="experience"
                              value={applicationData.experience}
                              onChange={handleInputChange}
                              className="modern-input"
                              rows={3}
                              placeholder="Briefly describe any relevant experience in events, hospitality, or customer service..."
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-bold text-[var(--text-primary)]">
                              <FaExclamationTriangle className="inline mr-2" />
                              Why are you the perfect fit for this role? * (Min 50 characters)
                            </label>
                            <textarea
                              name="whyYou"
                              value={applicationData.whyYou}
                              onChange={handleInputChange}
                              className="modern-input"
                              rows={4}
                              placeholder="Tell us what makes you the perfect candidate for this position. Highlight your relevant skills, experience, and enthusiasm..."
                              required
                            />
                            <div className={`text-sm mt-2 ${applicationData.whyYou.length >= 50 ? 'text-green-400' : 'text-[var(--text-muted)]'}`}>
                              {applicationData.whyYou.length}/50 characters {applicationData.whyYou.length >= 50 && '✓'}
                            </div>
                          </div>
                        </div>

                        <motion.button
                          type="submit"
                          disabled={isSubmitting || formProgress < 100}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full mt-8 btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                              Processing Application...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <FaPaperPlane />
                              Submit Application
                            </div>
                          )}
                        </motion.button>
                      </form>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-12 text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 -z-10"></div>
                    <FaRocket className="text-6xl text-[var(--primary)] mx-auto mb-6" />
                    <h2 className="font-display text-4xl font-bold mb-4 text-[var(--text-primary)]">
                      Ready to Apply?
                    </h2>
                    <p className="text-xl text-[var(--text-secondary)] mb-8">
                      Sign in to submit your application and track your progress
                    </p>
                    <motion.button
                      onClick={() => setIsModalOpen(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary text-lg px-12 py-4"
                    >
                      Sign In to Apply
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'company' && (
              <motion.div
                key="company"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <div className="glass-card p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 -z-10"></div>

                  {/* Company Header */}
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-4">
                      <FaRocket className="text-3xl text-white" />
                    </div>
                    <h2 className="font-display text-4xl font-bold mb-2 text-[var(--text-primary)]">{companyData.name}</h2>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`text-sm ${i < Math.floor(companyData.rating) ? 'text-[var(--accent)]' : 'text-[var(--surface-light)]'}`} />
                        ))}
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{companyData.rating}</span>
                      <span className="text-[var(--text-secondary)]">• {companyData.employees} employees</span>
                    </div>
                  </div>

                  {/* Company Stats */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <FaCalendar className="text-2xl text-[var(--primary)] mx-auto mb-2" />
                      <div className="font-bold text-[var(--text-primary)]">Founded {companyData.founded}</div>
                      <div className="text-sm text-[var(--text-secondary)]">Years of Experience</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <FaUsers className="text-2xl text-[var(--secondary)] mx-auto mb-2" />
                      <div className="font-bold text-[var(--text-primary)]">{companyData.employees}</div>
                      <div className="text-sm text-[var(--text-secondary)]">Professional Team</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <FaCertificate className="text-2xl text-[var(--accent)] mx-auto mb-2" />
                      <div className="font-bold text-[var(--text-primary)]">{companyData.industry}</div>
                      <div className="text-sm text-[var(--text-secondary)]">Industry Leader</div>
                    </div>
                  </div>

                  {/* Company Culture */}
                  <div className="mb-8">
                    <h3 className="font-heading text-2xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                      <FaHeart className="text-[var(--accent)]" />
                      Our Culture
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                      {companyData.culture}
                    </p>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h3 className="font-heading text-2xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                      <FaGem className="text-[var(--primary)]" />
                      Employee Benefits
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {companyData.benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <FaCheckCircle className="text-[var(--primary)] flex-shrink-0" />
                          <span className="text-[var(--text-secondary)]">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode="signin" />
      </section>

      <Footer />

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          colors={["#00D4FF", "#FFB800", "#8B5CF6", "#10B981"]}
        />
      )}
    </>
  );
}