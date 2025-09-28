
"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";

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

interface Application {
  id: string;
  userEmail: string;
  jobId: string;
  name: string;
  email: string;
  mobile: string;
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
  description: string;
  category: string;
}

export default function Admin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<"jobs" | "applications" | "admins">("jobs");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [jobSearch, setJobSearch] = useState("");
  const [jobsPage, setJobsPage] = useState(1);
  const [appsPage, setAppsPage] = useState(1);
  const itemsPerPage = 10;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JobFormData>();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    console.log("Admin useEffect: user =", user?.email, "loading =", loading);
    if (!loading && !user) {
      console.log("Admin: Redirecting to homepage (user is null, loading:", loading, ")");
      router.push("/");
      return;
    }
    if (user) {
      const fetchData = async (retries = 3) => {
        setIsLoading(true);
        try {
          // Fetch admins
          const adminsSnapshot = await getDocs(collection(db, "admins"));
          let adminEmails = adminsSnapshot.docs.map(doc => doc.data().email as string);
          console.log("Admin: User email:", user.email);
          console.log("Admin: Admin emails:", adminEmails);

          // Seed initial admins from .env if collection is empty
          if (adminsSnapshot.empty) {
            const initialAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(email => email.trim()) || ["ansarinazrul91@gmail.com"];
            console.log("Admin: Seeding admins:", initialAdmins);
            for (const email of initialAdmins) {
              if (!adminEmails.includes(email)) {
                await addDoc(collection(db, "admins"), { email });
              }
            }
            // Refetch admins after seeding
            const updatedAdminsSnapshot = await getDocs(collection(db, "admins"));
            adminEmails = updatedAdminsSnapshot.docs.map(doc => doc.data().email as string);
            setAdmins(adminEmails);
          } else {
            setAdmins(adminEmails);
          }

          // Check if user.email exists and is in adminEmails
          if (!user.email || !adminEmails.includes(user.email)) {
            console.log("Admin: Access denied. Redirecting to /portal. User email:", user.email, "Admin emails:", adminEmails);
            toast.error("Access denied. You are not an admin.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
            router.push("/portal");
            return;
          }

          setIsAdmin(true);

          // Fetch jobs
          const jobsSnapshot = await getDocs(collection(db, "jobs"));
          setJobs(jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));

          // Fetch applications
          const appsSnapshot = await getDocs(collection(db, "applications"));
          setApplications(appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));

        } catch (error: unknown) {
          console.error("Admin: Error fetching data:", error instanceof Error ? error.message : "Unknown error");
          if (retries > 0) {
            setTimeout(() => fetchData(retries - 1), 2000);
          } else {
            toast.error("Failed to load data after retries.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, loading, router]);

  const onAddJob: SubmitHandler<JobFormData> = async (data) => {
    try {
      const docRef = await addDoc(collection(db, "jobs"), data);
      setJobs([...jobs, { id: docRef.id, ...data }]);
      reset();
      toast.success("Job added successfully!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: unknown) {
      console.error("Admin: Error adding job:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to add job.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    }
  };

  const onUpdateJob: SubmitHandler<JobFormData> = async (data) => {
    if (!editingJob) return;
    try {
      const updateData: Partial<Job> = { ...data };
      await updateDoc(doc(db, "jobs", editingJob.id), updateData);
      setJobs(jobs.map(j => j.id === editingJob.id ? { ...editingJob, ...data } : j));
      setEditingJob(null);
      reset();
      toast.success("Job updated successfully!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: unknown) {
      console.error("Admin: Error updating job:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to update job.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, "jobs", id));
      setJobs(jobs.filter(j => j.id !== id));
      toast.success("Job deleted successfully!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: unknown) {
      console.error("Admin: Error deleting job:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to delete job.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, newStatus: Application["status"]) => {
    try {
      await updateDoc(doc(db, "applications", appId), { status: newStatus });
      setApplications(applications.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      toast.success("Application status updated!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: unknown) {
      console.error("Admin: Error updating application status:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to update status.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
      toast.error("Valid email is required.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      return;
    }
    try {
      await addDoc(collection(db, "admins"), { email: newAdminEmail });
      setAdmins([...admins, newAdminEmail]);
      setNewAdminEmail("");
      toast.success("Admin added successfully!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: unknown) {
      console.error("Admin: Error adding admin:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to add admin.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    try {
      const adminsQuery = query(collection(db, "admins"), where("email", "==", email));
      const adminsSnapshot = await getDocs(adminsQuery);
      adminsSnapshot.forEach(async (docSnap) => {
        await deleteDoc(docSnap.ref);
      });
      setAdmins(admins.filter(a => a !== email));
      toast.success("Admin removed successfully!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: unknown) {
      console.error("Admin: Error removing admin:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to remove admin.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    }
  };

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.category.toLowerCase().includes(jobSearch.toLowerCase())
  );
  const paginatedJobs = filteredJobs.slice(0, jobsPage * itemsPerPage);
  const paginatedApps = applications.slice(0, appsPage * itemsPerPage);

  if (loading || isLoading || !isAdmin) {
    return (
      <div className="py-20 text-center flex items-center justify-center min-h-screen bg-[var(--secondary)] text-[var(--text-body)]">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section className="py-24 min-h-screen bg-[var(--secondary)] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-5xl md:text-6xl font-bold text-center mb-16 font-heading text-[var(--text-accent)] text-shadow"
            aria-label="Admin Dashboard"
          >
            Admin Dashboard
          </motion.h1>
          <div className="flex flex-col md:flex-row justify-center mb-12 space-y-4 md:space-y-0 md:space-x-4">
            {["jobs", "applications", "admins"].map(tab => (
              <motion.button
                key={tab}
                onClick={() => setSelectedTab(tab as typeof selectedTab)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full font-semibold font-body transition-all duration-300 animate-pulse ${
                  selectedTab === tab
                    ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-white shadow-lg"
                    : "bg-[var(--secondary)] text-[var(--text-accent)] border border-[var(--light)]/50 hover:bg-[var(--soft)]"
                }`}
                aria-label={`Manage ${tab} Tab`}
              >
                Manage {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>

          {selectedTab === "jobs" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-semibold font-heading text-[var(--text-accent)]">
                {editingJob ? "Edit Job" : "Add New Job"}
              </h2>
              <form onSubmit={handleSubmit(editingJob ? onUpdateJob : onAddJob)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register("title", { required: "Title is required" })}
                    placeholder="Title"
                    className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--text-body)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                    aria-label="Job Title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <input
                    {...register("location", { required: "Location is required" })}
                    placeholder="Location"
                    className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--text-body)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                    aria-label="Job Location"
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                </div>
                <div>
                  <input
                    {...register("type", { required: "Type is required" })}
                    placeholder="Type"
                    className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--text-body)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                    aria-label="Job Type"
                  />
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
                </div>
                <div>
                  <input
                    {...register("duration", { required: "Duration is required" })}
                    placeholder="Duration"
                    className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--text-body)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                    aria-label="Job Duration"
                  />
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>}
                </div>
                <div>
                  <input
                    type="number"
                    {...register("rate", { required: "Rate is required", min: { value: 0, message: "Rate must be positive" } })}
                    placeholder="Rate"
                    className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--text-body)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                    aria-label="Job Rate"
                  />
                  {errors.rate && <p className="text-red-500 text-sm mt-1">{errors.rate.message}</p>}
                </div>
                <div>
                  <select
                    {...register("category", { required: "Category is required" })}
                    className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--text-body)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                    aria-label="Job Category"
                  >
                    <option value="">Select Category</option>
                    <option value="staffing">Staffing</option>
                    <option value="models_entertainment">Models & Entertainment</option>
                    <option value="promotions">Promotions</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <textarea
                    {...register("description", { required: "Description is required" })}
                    placeholder="Description"
                    className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--text-body)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                    rows={4}
                    aria-label="Job Description"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-2xl font-semibold font-body bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse col-span-2"
                  aria-label={editingJob ? "Update Job" : "Add Job"}
                >
                  {editingJob ? "Update Job" : <><FaPlus className="inline mr-2" /> Add Job</>}
                </motion.button>
                {editingJob && (
                  <motion.button
                    type="button"
                    onClick={() => { setEditingJob(null); reset(); }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-2xl font-semibold font-body bg-[var(--secondary)] text-[var(--text-accent)] border border-[var(--light)]/50 hover:bg-[var(--soft)] transition-all duration-300 col-span-2"
                    aria-label="Cancel Edit"
                  >
                    Cancel
                  </motion.button>
                )}
              </form>

              <h2 className="text-3xl font-semibold mt-8 font-heading text-[var(--text-accent)]">Existing Jobs</h2>
              <div className="flex gap-4 mb-4">
                <input
                  placeholder="Search jobs..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="flex-1 p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--text-body)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                  aria-label="Search Jobs"
                />
                <FaSearch className="text-[var(--text-accent)] text-xl self-center" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-[var(--light)]/30 bg-[var(--secondary)] card">
                    <h3 className="font-semibold font-heading text-[var(--text-body)]">{job.title}</h3>
                    <p className="font-body text-[var(--text-body)] opacity-80">{job.category}</p>
                    <div className="flex gap-2 mt-2">
                      <motion.button
                        onClick={() => {
                          setEditingJob(job);
                          Object.entries(job).forEach(([key, value]) => setValue(key as keyof JobFormData, value));
                        }}
                        whileHover={{ scale: 1.1 }}
                        className="text-[var(--text-accent)]"
                        aria-label={`Edit ${job.title}`}
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button
                        onClick={() => setDeleteConfirmId(job.id)}
                        whileHover={{ scale: 1.1 }}
                        className="text-[var(--text-accent)]"
                        aria-label={`Delete ${job.title}`}
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
              {paginatedJobs.length < filteredJobs.length && (
                <div className="text-center mt-4">
                  <motion.button
                    onClick={() => setJobsPage(p => p + 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-2xl font-semibold font-body bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
                    aria-label="Load More Jobs"
                  >
                    Load More
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {selectedTab === "applications" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-semibold font-heading text-[var(--text-accent)]">Manage Applications</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {paginatedApps.map((app) => (
                  <div key={app.id} className="p-4 rounded-xl border border-[var(--light)]/30 bg-[var(--secondary)] card">
                    <p className="font-body text-[var(--text-body)]"><strong>Job ID:</strong> {app.jobId}</p>
                    <p className="font-body text-[var(--text-body)]"><strong>Applicant:</strong> {app.name} ({app.email})</p>
                    <p className="font-body text-[var(--text-body)]">
                      <strong>Status:</strong>
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value as Application["status"])}
                        className="ml-2 p-2 rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--text-body)] border border-[var(--light)]/50"
                        aria-label={`Update status for ${app.name}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </p>
                  </div>
                ))}
              </div>
              {paginatedApps.length < applications.length && (
                <div className="text-center mt-4">
                  <motion.button
                    onClick={() => setAppsPage(p => p + 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-2xl font-semibold font-body bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
                    aria-label="Load More Applications"
                  >
                    Load More
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {selectedTab === "admins" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-semibold font-heading text-[var(--text-accent)]">Manage Admins</h2>
              <div className="flex gap-4">
                <input
                  placeholder="New Admin Email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1 p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--text-body)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                  aria-label="New Admin Email"
                />
                <motion.button
                  onClick={handleAddAdmin}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-2xl font-semibold font-body bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
                  aria-label="Add Admin"
                >
                  <FaPlus className="inline mr-2" /> Add Admin
                </motion.button>
              </div>
              <div className="space-y-4">
                {admins.map((email) => (
                  <div key={email} className="flex justify-between items-center p-4 rounded-xl border border-[var(--light)]/30 bg-[var(--secondary)] card">
                    <p className="font-body text-[var(--text-body)]">{email}</p>
                    <motion.button
                      onClick={() => handleRemoveAdmin(email)}
                      whileHover={{ scale: 1.1 }}
                      className="text-[var(--text-accent)]"
                      aria-label={`Remove ${email} as admin`}
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deleteConfirmId && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="p-6 rounded-2xl bg-[var(--secondary)] card">
                <p className="font-body mb-4 text-[var(--text-body)]">Are you sure you want to delete this job?</p>
                <div className="flex gap-4">
                  <motion.button
                    onClick={() => handleDeleteJob(deleteConfirmId)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full font-body bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-white"
                    aria-label="Confirm Delete"
                  >
                    Yes
                  </motion.button>
                  <motion.button
                    onClick={() => setDeleteConfirmId(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full font-body bg-[var(--secondary)] text-[var(--text-accent)] border border-[var(--light)]/50"
                    aria-label="Cancel Delete"
                  >
                    No
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
