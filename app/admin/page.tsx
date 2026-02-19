"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaBriefcase,
  FaUserTie,
  FaUserShield,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaSave,
  FaTimes,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaClock,
  FaTag,
  FaFilter,
  FaArrowRight,
  FaEnvelope,
  FaPhone,
  FaUsers,
  FaDownload
} from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  duration: string;
  rate: number;
  paymentFrequency: string; // New field
  summary: string; // Changed from description
  category: string;
  requirements: string[]; // New
  benefits: string[]; // New
  postedBy: string; // New
}

interface Application {
  id: string;
  userEmail: string;
  jobId: string;
  name: string;
  email: string;
  mobile: string;
  whatsapp?: string; // Added optional
  coverLetter: string;
  timestamp: string;
  status: "pending" | "accepted" | "rejected";
}

interface JobFormData {
  title: string;
  location: string;
  type: string;
  duration: string;
  rate: number;
  paymentFrequency: string;
  summary: string;
  category: string;
}

interface CompanyProfile {
  name: string;
  employees: number;
  founded: number;
  rating: number;
  industry: string;
  culture: string;
  benefits: string[]; // Global benefits
}

export default function Admin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: "Eventopic",
    employees: 50,
    founded: 2020,
    rating: 4.8,
    industry: "Events & Entertainment",
    culture: "We are a team of passionate individuals dedicated to creating unforgettable experiences.",
    benefits: ["Flexible Hours", "Competitive Pay", "Transport Provided"]
  });

  const [selectedTab, setSelectedTab] = useState<"jobs" | "applications" | "admins" | "profile">("jobs");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [jobCategoryFilter, setJobCategoryFilter] = useState("all");
  const [jobSearch, setJobSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [appSearch, setAppSearch] = useState("");
  const [jobsPage, setJobsPage] = useState(1);
  const [appsPage, setAppsPage] = useState(1);
  const itemsPerPage = 10;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JobFormData>();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJobForApps, setSelectedJobForApps] = useState<string | null>(null);

  // Custom form state for dynamic lists
  const [jobRequirements, setJobRequirements] = useState<string[]>([]);
  const [jobBenefits, setJobBenefits] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  const [newAdminEmail, setNewAdminEmail] = useState("");

  const handleExportDatabase = async () => {
    if (!confirm("Download complete database backup? This may take a moment.")) return;
    setIsExporting(true);
    try {
      const collectionsToExport = ["users", "jobs", "applications", "admins", "settings", "staff_inquiries", "leads"];
      const exportData: Record<string, any[]> = {};

      for (const colName of collectionsToExport) {
        const querySnapshot = await getDocs(collection(db, colName));
        exportData[colName] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `eventopic_db_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Database export successful!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export database.");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch admins
          const adminsSnapshot = await getDocs(collection(db, "admins"));
          let adminEmails = adminsSnapshot.docs.map(doc => doc.data().email as string);

          // Seed initial admins if empty
          if (adminsSnapshot.empty) {
            const initialAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(email => email.trim()) || ["ansarinazrul91@gmail.com"];
            for (const email of initialAdmins) {
              if (!adminEmails.includes(email)) {
                await addDoc(collection(db, "admins"), { email });
              }
            }
            const updatedAdminsSnapshot = await getDocs(collection(db, "admins"));
            adminEmails = updatedAdminsSnapshot.docs.map(doc => doc.data().email as string);
          }
          setAdmins(adminEmails);

          // Check access
          if (!user.email || !adminEmails.includes(user.email)) {
            toast.error("Access denied. Admin privileges required.");
            router.push("/portal");
            return;
          }

          setIsAdmin(true);

          // Fetch Data
          const [jobsSnapshot, appsSnapshot, settingsSnapshot] = await Promise.all([
            getDocs(collection(db, "jobs")),
            getDocs(collection(db, "applications")),
            getDocs(collection(db, "settings")) // Fetch global settings
          ]);

          setJobs(jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
          setApplications(appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));


          if (!settingsSnapshot.empty) {
            const profileData = settingsSnapshot.docs[0].data() as CompanyProfile;
            setCompanyProfile(profileData);
          }

        } catch (error) {
          console.error("Admin error:", error);
          toast.error("Failed to load admin data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, loading, router]);

  const onAddJob: SubmitHandler<JobFormData> = async (data) => {
    try {
      const jobData = {
        ...data,
        requirements: jobRequirements,
        benefits: jobBenefits,
        postedBy: user?.email || "Admin",
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "jobs"), jobData);
      setJobs([...jobs, { id: docRef.id, ...jobData } as Job]);
      reset();
      setJobRequirements([]);
      setJobBenefits([]);
      toast.success("Job posted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to post job.");
    }
  };

  const onUpdateJob: SubmitHandler<JobFormData> = async (data) => {
    if (!editingJob) return;
    try {
      const jobData = {
        ...data,
        requirements: jobRequirements,
        benefits: jobBenefits
      };
      await updateDoc(doc(db, "jobs", editingJob.id), jobData);
      setJobs(jobs.map(j => j.id === editingJob.id ? { ...editingJob, ...jobData } : j));
      setEditingJob(null);
      reset();
      setJobRequirements([]);
      setJobBenefits([]);
      toast.success("Job updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update job.");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settingsRef = collection(db, "settings");
      const querySnapshot = await getDocs(settingsRef);

      if (querySnapshot.empty) {
        await addDoc(settingsRef, companyProfile);
      } else {
        const docId = querySnapshot.docs[0].id;
        await updateDoc(doc(db, "settings", docId), { ...companyProfile });
      }
      toast.success("Company profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, "jobs", id));
      setJobs(jobs.filter(j => j.id !== id));
      toast.success("Job deleted!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete job.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, newStatus: Application["status"]) => {
    try {
      await updateDoc(doc(db, "applications", appId), { status: newStatus });
      setApplications(applications.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      toast.success(`Application marked as ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Status update failed.");
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
      toast.error("Please enter a valid email.");
      return;
    }
    try {
      await addDoc(collection(db, "admins"), { email: newAdminEmail });
      setAdmins([...admins, newAdminEmail]);
      setNewAdminEmail("");
      toast.success("Admin added!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add admin.");
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm("Remove this admin access?")) return;
    try {
      const q = query(collection(db, "admins"), where("email", "==", email));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docSnap) => await deleteDoc(docSnap.ref));
      setAdmins(admins.filter(a => a !== email));
      toast.success("Admin removed.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove admin.");
    }
  };

  // Pagination & Filtering
  const SUPER_ADMIN_EMAIL = "test1@gmail.com";

  const normalize = (str?: string) => str?.toLowerCase().trim() || "";

  const filteredJobs = jobs.filter(j => {
    const userEmail = normalize(user?.email || "");
    const jobOwnerEmail = normalize(j.postedBy);
    const superAdminEmail = normalize(SUPER_ADMIN_EMAIL);

    const isOwner = jobOwnerEmail === userEmail;
    const isSuperAdmin = userEmail === superAdminEmail;
    const isLegacyJob = !jobOwnerEmail;

    // Filter by ownership (unless super admin or legacy job)
    if (!isSuperAdmin && !isOwner && !isLegacyJob) return false;

    const matchesSearch = j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.location.toLowerCase().includes(jobSearch.toLowerCase());
    const matchesCategory = jobCategoryFilter === "all" || j.category === jobCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredApplications = applications.filter(a => {
    // Find the job this application is for
    const job = jobs.find(j => j.id === a.jobId);

    // If we can't find the job, maybe don't show the application? 
    // Or if we can't verify ownership, hide it to be safe.
    if (!job) return false;

    const userEmail = normalize(user?.email || "");
    const jobOwnerEmail = normalize(job.postedBy);
    const superAdminEmail = normalize(SUPER_ADMIN_EMAIL);

    const isJobOwner = jobOwnerEmail === userEmail;
    const isSuperAdmin = userEmail === superAdminEmail;
    const isLegacyJob = !jobOwnerEmail;

    // Filter by job ownership (unless super admin or legacy job)
    if (!isSuperAdmin && !isJobOwner && !isLegacyJob) return false;

    const matchesSearch = a.name.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.jobId.includes(appSearch);
    const matchesStatus = appStatusFilter === "all" || a.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedJobs = filteredJobs.slice(0, jobsPage * itemsPerPage);
  const paginatedApps = filteredApplications.slice(0, appsPage * itemsPerPage);

  if (loading || isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section className="pt-24 pb-12 min-h-screen bg-[var(--background)] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display gradient-text mb-2">Admin Portal</h1>
              <p className="text-[var(--text-secondary)]">Manage jobs, applications, and system access.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/admin/leads"
                className="btn-primary px-4 py-3 rounded-xl flex items-center gap-2 font-bold whitespace-nowrap"
              >
                <FaUsers /> Leads
              </Link>

              <button
                onClick={handleExportDatabase}
                disabled={isExporting}
                className="btn-secondary px-4 py-3 rounded-xl flex items-center gap-2 font-bold whitespace-nowrap border border-[var(--border)] hover:border-[var(--primary)] transition-all"
              >
                {isExporting ? <FaHourglassHalf className="animate-spin" /> : <FaDownload />}
                {isExporting ? "Exporting..." : "Export DB"}
              </button>

              <div className="flex bg-[var(--surface-elevated)] p-1 rounded-xl border border-[var(--border)] overflow-x-auto max-w-full">
                {(["jobs", "applications", "admins", "profile"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${selectedTab === tab
                      ? "bg-[var(--primary)] text-white shadow-lg"
                      : "text-[var(--text-secondary)] hover:text-white"
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CONTENT TABS */}
          <AnimatePresence mode="wait">
            {selectedTab === "jobs" && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Add/Edit Job Form */}
                <div className="glass-card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                      <FaBriefcase />
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-[var(--text-primary)]">
                      {editingJob ? "Edit Position" : "Post New Position"}
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit(editingJob ? onUpdateJob : onAddJob)} className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <input
                        {...register("title", { required: true })}
                        placeholder="Job Title (e.g. Senior Event Host)"
                        className="modern-input text-lg font-bold w-full"
                      />
                      {errors.title && <span className="text-red-500 text-sm">Required</span>}
                    </div>

                    <div>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                        <select
                          {...register("location", { required: true })}
                          className="modern-input pr-10 appearance-none bg-[var(--surface)] text-[var(--text-primary)] w-full"
                        >
                          <option value="">Select Location</option>
                          <option value="Dubai">Dubai</option>
                          <option value="Abu Dhabi">Abu Dhabi</option>
                          <option value="Sharjah">Sharjah</option>
                          <option value="Ajman">Ajman</option>
                          <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                          <option value="Fujairah">Fujairah</option>
                          <option value="Umm Al Quwain">Umm Al Quwain</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <FaClock className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                        <select
                          {...register("type", { required: true })}
                          className="modern-input pr-10 appearance-none bg-[var(--surface)] text-[var(--text-primary)] w-full"
                        >
                          <option value="">Select Job Type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Contract">Contract</option>
                          <option value="Temporary">Temporary</option>
                          <option value="One-time Event">One-time Event</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <FaTag className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                        <select
                          {...register("category", { required: true })}
                          className="modern-input pr-10 appearance-none bg-[var(--surface)] text-[var(--text-primary)] w-full"
                        >
                          <option value="">Select Category</option>

                          <optgroup label="Event Staff">
                            <option value="Event Coordinator">Event Coordinator</option>
                            <option value="Team Leader">Team Leader</option>
                            <option value="Event Manager">Event Manager</option>
                            <option value="Greeter">Greeter</option>
                            <option value="Usher">Usher</option>
                            <option value="Receptionist">Receptionist</option>
                            <option value="Registration Staff">Registration Staff</option>
                            <option value="Security Staff">Security Staff</option>
                            <option value="Bouncer">Bouncer</option>
                          </optgroup>

                          <optgroup label="Models & Influencers">
                            <option value="Model">Model</option>
                            <option value="Fashion Model">Fashion Model</option>
                            <option value="Promotional Model">Promotional Model</option>
                            <option value="Influencer">Influencer</option>
                            <option value="Content Creator">Content Creator</option>
                            <option value="Reels Creator">Reels Creator</option>
                          </optgroup>

                          <optgroup label="Entertainment">
                            <option value="Stand Speaker">Stand Speaker</option>
                            <option value="MC / Anchor">MC / Anchor</option>
                            <option value="Hostess">Hostess</option>
                            <option value="VIP Hostess">VIP Hostess</option>
                            <option value="Dancer">Dancer</option>
                            <option value="Singer">Singer</option>
                            <option value="DJ">DJ</option>
                            <option value="Musician">Musician</option>
                            <option value="Flash Mob Artist">Flash Mob Artist</option>
                            <option value="Live Artist">Live Artist</option>
                          </optgroup>

                          <optgroup label="Technology & IT">
                            <option value="Software Developer">Software Developer</option>
                            <option value="IT Support Specialist">IT Support Specialist</option>
                            <option value="Network Administrator">Network Administrator</option>
                            <option value="Data Analyst">Data Analyst</option>
                            <option value="Web Developer">Web Developer</option>
                            <option value="UI/UX Designer">UI/UX Designer</option>
                          </optgroup>

                          <optgroup label="Promotions & Sales">
                            <option value="Promoter">Promoter</option>
                            <option value="Sales Promoter">Sales Promoter</option>
                            <option value="Brand Ambassador">Brand Ambassador</option>
                            <option value="Lead Generator">Lead Generator</option>
                            <option value="Sampling Staff">Sampling Staff</option>
                            <option value="Sales Representative">Sales Representative</option>
                            <option value="Business Development">Business Development</option>
                          </optgroup>

                          <optgroup label="Corporate & Office">
                            <option value="Administrative Assistant">Administrative Assistant</option>
                            <option value="Office Manager">Office Manager</option>
                            <option value="Data Entry Clerk">Data Entry Clerk</option>
                            <option value="Customer Service">Customer Service</option>
                            <option value="HR Specialist">HR Specialist</option>
                            <option value="Accountant">Accountant</option>
                          </optgroup>

                          <optgroup label="Logistics & Operations">
                            <option value="Logistics Coordinator">Logistics Coordinator</option>
                            <option value="Driver">Driver</option>
                            <option value="Delivery Staff">Delivery Staff</option>
                            <option value="Warehouse Staff">Warehouse Staff</option>
                            <option value="Operations Manager">Operations Manager</option>
                          </optgroup>

                          <optgroup label="Hospitality">
                            <option value="Waiter/Waitress">Waiter/Waitress</option>
                            <option value="Bartender">Bartender</option>
                            <option value="Chef">Chef</option>
                            <option value="Hotel Staff">Hotel Staff</option>
                            <option value="Kitchen Staff">Kitchen Staff</option>
                          </optgroup>

                          <optgroup label="Creative">
                            <option value="Photographer">Photographer</option>
                            <option value="Videographer">Videographer</option>
                            <option value="Graphic Designer">Graphic Designer</option>
                            <option value="Video Editor">Video Editor</option>
                          </optgroup>

                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <FaHourglassHalf className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                        <input
                          {...register("duration", { required: true })}
                          placeholder="Duration (e.g. 2 Days)"
                          className="modern-input pr-10 w-full"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                      <div className="relative">
                        <FaMoneyBillWave className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                        <input
                          type="number"
                          {...register("rate", { required: true })}
                          placeholder="Payment Amount (Numbers Only)"
                          className="modern-input pr-10 w-full"
                          onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                              event.preventDefault();
                            }
                          }}
                        />
                      </div>
                      <div className="relative">
                        <FaClock className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                        <select
                          {...register("paymentFrequency", { required: true })}
                          className="modern-input pr-10 appearance-none bg-[var(--surface)] text-[var(--text-primary)] w-full"
                          defaultValue="daily"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="project">Per Project</option>
                          <option value="annual">Annual</option>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-bold text-[var(--text-muted)]">Summary</label>
                      <textarea
                        {...register("summary", { required: true })}
                        placeholder="Brief Job Summary..."
                        rows={3}
                        className="modern-input resize-none"
                      />
                    </div>

                    {/* Requirements Section */}
                    <div className="md:col-span-2">
                      <label className="block mb-4 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Requirements</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {["Valid Emirates ID", "Fluent English", "Customer Service Exp.", "Vaccinated", "Own Transport", "Uniform/Formal Wear"].map(req => (
                          <label key={req} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                            <input
                              type="checkbox"
                              checked={jobRequirements.includes(req)}
                              onChange={(e) => {
                                if (e.target.checked) setJobRequirements([...jobRequirements, req]);
                                else setJobRequirements(jobRequirements.filter(r => r !== req));
                              }}
                              className="rounded border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            {req}
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          placeholder="Add custom requirement..."
                          className="modern-input py-2 flex-grow"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newRequirement) {
                              setJobRequirements([...jobRequirements, newRequirement]);
                              setNewRequirement("");
                            }
                          }}
                          className="btn-secondary py-2"
                        >
                          <FaPlus />
                        </button>
                      </div>
                      {/* Display Added Requirements */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {jobRequirements.filter(req => !["Valid Emirates ID", "Fluent English", "Customer Service Exp.", "Vaccinated", "Own Transport", "Uniform/Formal Wear"].includes(req)).map(req => (
                          <span key={req} className="px-3 py-1 bg-[var(--surface-elevated)] rounded-full text-xs flex items-center gap-2 border border-[var(--border)]">
                            {req}
                            <button type="button" onClick={() => setJobRequirements(jobRequirements.filter(r => r !== req))} className="text-red-400 hover:text-red-500"><FaTimes /></button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="md:col-span-2">
                      <label className="block mb-4 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Benefits & Offerings</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {["Transport Provided", "Meals Included", "Overtime Pay", "Completion Bonus", "Certificate Provided", "Flexible Shifts"].map(ben => (
                          <label key={ben} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                            <input
                              type="checkbox"
                              checked={jobBenefits.includes(ben)}
                              onChange={(e) => {
                                if (e.target.checked) setJobBenefits([...jobBenefits, ben]);
                                else setJobBenefits(jobBenefits.filter(b => b !== ben));
                              }}
                              className="rounded border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            {ben}
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={newBenefit}
                          onChange={(e) => setNewBenefit(e.target.value)}
                          placeholder="Add custom benefit..."
                          className="modern-input py-2 flex-grow"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newBenefit) {
                              setJobBenefits([...jobBenefits, newBenefit]);
                              setNewBenefit("");
                            }
                          }}
                          className="btn-secondary py-2"
                        >
                          <FaPlus />
                        </button>
                      </div>
                      {/* Display Added Benefits */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {jobBenefits.filter(ben => !["Transport Provided", "Meals Included", "Overtime Pay", "Completion Bonus", "Certificate Provided", "Flexible Shifts"].includes(ben)).map(ben => (
                          <span key={ben} className="px-3 py-1 bg-[var(--accent)]/10 rounded-full text-xs flex items-center gap-2 border border-[var(--accent)]/30 text-[var(--accent)]">
                            {ben}
                            <button type="button" onClick={() => setJobBenefits(jobBenefits.filter(b => b !== ben))} className="hover:text-red-400"><FaTimes /></button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2 flex gap-4 mt-4">
                      {editingJob && (
                        <button
                          type="button"
                          onClick={() => { setEditingJob(null); reset(); setJobRequirements([]); setJobBenefits([]); }}
                          className="btn-secondary"
                        >
                          <FaTimes /> Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="btn-primary flex-1 justify-center"
                      >
                        {editingJob ? <><FaSave /> Update Job</> : <><FaPlus /> Post Job</>}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Job List */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    <div className="relative flex-1 w-full">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      <input
                        value={jobSearch}
                        onChange={(e) => setJobSearch(e.target.value)}
                        placeholder="Search by title or location..."
                        className="modern-input pl-10 w-full"
                      />
                    </div>
                    <div className="relative w-full md:w-48">
                      <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      <select
                        value={jobCategoryFilter}
                        onChange={(e) => setJobCategoryFilter(e.target.value)}
                        className="modern-input pl-10 w-full appearance-none"
                      >
                        <option value="all">All Categories</option>
                        <option value="staffing">Staffing</option>
                        <option value="models">Models</option>
                        <option value="promotions">Promotions</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {paginatedJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location}</span>
                          <span className="flex items-center gap-1"><FaTag /> {job.category}</span>
                          <span className="flex items-center gap-1 text-[var(--accent)] font-bold">
                            <FaMoneyBillWave /> AED {job.rate} / {job.paymentFrequency ? job.paymentFrequency.charAt(0).toUpperCase() + job.paymentFrequency.slice(1) : 'Day'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingJob(job);
                            setValue("title", job.title);
                            setValue("location", job.location);
                            setValue("type", job.type);
                            setValue("category", job.category);
                            setValue("duration", job.duration);
                            setValue("rate", job.rate);
                            setValue("paymentFrequency", job.paymentFrequency || "daily");
                            setValue("summary", job.summary || (job as any).description);
                            setJobRequirements(job.requirements || []);
                            setJobBenefits(job.benefits || []);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-3 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(job.id)}
                          className="p-3 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:text-red-500 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {paginatedJobs.length < filteredJobs.length && (
                    <div className="text-center pt-4">
                      <button onClick={() => setJobsPage(p => p + 1)} className="btn-secondary">Load More</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {selectedTab === "applications" && (
              <motion.div
                key="applications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!selectedJobForApps ? (
                  // LEVEL 1: JOB LIST VIEW
                  <div className="space-y-6">
                    <div className="glass-card p-6 mb-6">
                      <h2 className="text-2xl font-bold mb-2">Application Management</h2>
                      <p className="text-[var(--text-secondary)]">Select a job to view and manage its applicants.</p>

                      {/* Search for Jobs */}
                      <div className="mt-4 relative max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                        <input
                          placeholder="Find your posted jobs..."
                          value={jobSearch}
                          onChange={(e) => setJobSearch(e.target.value)}
                          className="modern-input pl-10 w-full"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {jobs
                        .filter(job => {
                          const userEmail = normalize(user?.email || "");
                          const jobOwnerEmail = normalize(job.postedBy);
                          const superAdminEmail = normalize(SUPER_ADMIN_EMAIL);

                          const isOwner = jobOwnerEmail === userEmail;
                          const isSuperAdmin = userEmail === superAdminEmail;
                          const isLegacyJob = !jobOwnerEmail;

                          if (!isSuperAdmin && !isOwner && !isLegacyJob) return false;

                          return job.title.toLowerCase().includes(jobSearch.toLowerCase());
                        })
                        .map(job => {
                          const jobApps = applications.filter(app => app.jobId === job.id);
                          const pendingCount = jobApps.filter(a => a.status === 'pending').length;
                          const acceptedCount = jobApps.filter(a => a.status === 'accepted').length;

                          return (
                            <motion.div
                              key={job.id}
                              whileHover={{ y: -5 }}
                              onClick={() => setSelectedJobForApps(job.id)}
                              className="glass-card p-6 cursor-pointer group hover:border-[var(--primary)] transition-all relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FaBriefcase className="text-6xl text-[var(--primary)]" />
                              </div>

                              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 line-clamp-1">{job.title}</h3>
                              <p className="text-sm text-[var(--text-secondary)] mb-6 flex items-center gap-2">
                                <FaMapMarkerAlt /> {job.location} • <span className="capitalize">{job.type}</span>
                              </p>

                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)]">
                                  <div className="text-xl font-bold text-[var(--text-primary)]">{jobApps.length}</div>
                                  <div className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Total</div>
                                </div>
                                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                  <div className="text-xl font-bold text-yellow-500">{pendingCount}</div>
                                  <div className="text-[10px] uppercase text-yellow-500/70 font-bold">Pending</div>
                                </div>
                                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                  <div className="text-xl font-bold text-green-500">{acceptedCount}</div>
                                  <div className="text-[10px] uppercase text-green-500/70 font-bold">Accepted</div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                      {jobs.filter(job => {
                        const userEmail = normalize(user?.email || "");
                        const jobOwnerEmail = normalize(job.postedBy);
                        const superAdminEmail = normalize(SUPER_ADMIN_EMAIL);

                        const isOwner = jobOwnerEmail === userEmail;
                        const isSuperAdmin = userEmail === superAdminEmail;
                        const isLegacyJob = !jobOwnerEmail;

                        return isSuperAdmin || isOwner || isLegacyJob;
                      }).length === 0 && (
                          <div className="col-span-full text-center py-12 text-[var(--text-muted)]">
                            <div className="text-4xl mb-4">📂</div>
                            <p>You haven't posted any jobs yet.</p>
                            <button onClick={() => setSelectedTab('jobs')} className="text-[var(--primary)] hover:underline mt-2">Post a job now</button>
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  // LEVEL 2: APPLICANT LIST VIEW
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <button
                        onClick={() => setSelectedJobForApps(null)}
                        className="p-3 rounded-full bg-[var(--surface-elevated)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                      >
                        <FaArrowRight className="rotate-180" />
                      </button>
                      <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                          {jobs.find(j => j.id === selectedJobForApps)?.title}
                        </h2>
                        <p className="text-[var(--text-secondary)]">Managing Applicants</p>
                      </div>
                    </div>

                    <div className="glass-card p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex flex-col md:flex-row gap-4 w-full">
                        <div className="relative flex-1">
                          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                          <input
                            value={appSearch}
                            onChange={(e) => setAppSearch(e.target.value)}
                            placeholder="Search applicant name, email..."
                            className="modern-input pl-10 w-full"
                          />
                        </div>
                        <div className="relative w-full md:w-48">
                          <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                          <select
                            value={appStatusFilter}
                            onChange={(e) => setAppStatusFilter(e.target.value)}
                            className="modern-input pl-10 w-full appearance-none"
                          >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {applications
                        .filter(app => app.jobId === selectedJobForApps)
                        .filter(app => {
                          const matchesSearch = app.name.toLowerCase().includes(appSearch.toLowerCase()) ||
                            app.email.toLowerCase().includes(appSearch.toLowerCase());
                          const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map(app => (
                          <motion.div
                            key={app.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card p-6 border-l-4 border-l-[var(--border)] hover:border-l-[var(--primary)] transition-all"
                          >
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{app.name}</h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                    app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                      'bg-yellow-500/20 text-yellow-500'
                                    }`}>
                                    {app.status}
                                  </span>
                                  <span className="text-xs text-[var(--text-muted)] ml-auto lg:ml-0">
                                    {new Date(app.timestamp).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)] mb-4">
                                  <div className="flex items-center gap-2"><FaEnvelope className="text-[var(--primary)]" /> {app.email}</div>
                                  <div className="flex items-center gap-2"><FaPhone className="text-[var(--accent)]" /> {app.mobile}</div>
                                  {app.whatsapp && <div className="flex items-center gap-2"><FaArrowRight className="text-green-500" /> WhatsApp: {app.whatsapp}</div>}
                                </div>

                                <div className="bg-[var(--surface-elevated)] p-4 rounded-xl text-sm relative">
                                  <FaUserTie className="absolute top-4 right-4 text-[var(--text-muted)] opacity-20 text-4xl" />
                                  <span className="font-bold text-[var(--text-primary)] block mb-2 uppercase text-xs tracking-wider">Cover Letter</span>
                                  <p className="leading-relaxed whitespace-pre-wrap">{app.coverLetter || "No details provided."}</p>
                                </div>
                              </div>

                              <div className="flex flex-row lg:flex-col gap-3 min-w-[140px] justify-center">
                                <button
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                                  disabled={app.status === 'accepted'}
                                  className={`btn-secondary justify-center flex-1 ${app.status === 'accepted' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500 hover:text-white border-green-500/30 text-green-400'}`}
                                >
                                  <FaCheckCircle /> Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                                  disabled={app.status === 'rejected'}
                                  className={`btn-secondary justify-center flex-1 ${app.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 hover:text-white border-red-500/30 text-red-400'}`}
                                >
                                  <FaTimesCircle /> Reject
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                      {applications.filter(app => app.jobId === selectedJobForApps).length === 0 && (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                          No applications received for this job yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {selectedTab === "admins" && (
              <motion.div
                key="admins"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FaUserShield className="text-[var(--primary)]" /> Admin Management
                  </h2>

                  <div className="flex gap-4 mb-8">
                    <input
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin@eventopic.com"
                      className="modern-input"
                    />
                    <button onClick={handleAddAdmin} className="btn-primary">
                      <FaPlus /> Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {admins.map(email => (
                      <div key={email} className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-xs font-bold">
                            A
                          </div>
                          <span className="font-medium text-[var(--text-primary)]">{email}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveAdmin(email)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FaBriefcase className="text-[var(--primary)]" /> Company Profile Settings
                  </h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Company Name</label>
                        <input
                          value={companyProfile.name}
                          onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
                          className="modern-input"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Industry</label>
                        <input
                          value={companyProfile.industry}
                          onChange={(e) => setCompanyProfile({ ...companyProfile, industry: e.target.value })}
                          className="modern-input"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Employees</label>
                        <input
                          type="number"
                          value={companyProfile.employees}
                          onChange={(e) => setCompanyProfile({ ...companyProfile, employees: parseInt(e.target.value) })}
                          className="modern-input"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Founded Year</label>
                        <input
                          type="number"
                          value={companyProfile.founded}
                          onChange={(e) => setCompanyProfile({ ...companyProfile, founded: parseInt(e.target.value) })}
                          className="modern-input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Culture & Values</label>
                        <textarea
                          value={companyProfile.culture}
                          onChange={(e) => setCompanyProfile({ ...companyProfile, culture: e.target.value })}
                          className="modern-input"
                          rows={4}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Global Benefits (Comma separated)</label>
                        <input
                          value={companyProfile.benefits.join(", ")}
                          onChange={(e) => setCompanyProfile({ ...companyProfile, benefits: e.target.value.split(",").map(b => b.trim()) })}
                          className="modern-input"
                          placeholder="Flexible Hours, Health Insurance, etc."
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center">
                      <FaSave className="mr-2" /> Save Profile
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteConfirmId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="glass-card p-8 max-w-sm w-full text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6">
                    <FaTrash className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Delete Position?</h3>
                  <p className="text-[var(--text-secondary)] mb-6">This action cannot be undone.</p>
                  <div className="flex gap-4">
                    <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                    <button onClick={() => handleDeleteJob(deleteConfirmId)} className="btn-primary flex-1 justify-center bg-red-500 border-red-500">Delete</button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </>
  );
}
