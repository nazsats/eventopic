"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
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
  status: 'pending' | 'accepted' | 'rejected';
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
  const [selectedTab, setSelectedTab] = useState("jobs");
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
    if (!loading && !user) {
      router.push("/");
      return;
    }
    if (user) {
      const fetchData = async (retries = 3) => {
        setIsLoading(true);
        try {
          // Fetch admins
          const adminsSnapshot = await getDocs(collection(db, "admins"));
          const adminEmails = adminsSnapshot.docs.map(doc => doc.data().email as string);
          console.log("User email:", user.email); // Debug
          console.log("Admin emails:", adminEmails); // Debug

          // Seed initial admins from .env if collection is empty
          if (adminsSnapshot.empty) {
            const initialAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(email => email.trim()) || ["ansarinazrul91@gmail.com"];
            console.log("Seeding admins:", initialAdmins); // Debug
            for (const email of initialAdmins) {
              if (!adminEmails.includes(email)) {
                await addDoc(collection(db, "admins"), { email });
              }
            }
            // Refetch admins after seeding
            const updatedAdminsSnapshot = await getDocs(collection(db, "admins"));
            setAdmins(updatedAdminsSnapshot.docs.map(doc => doc.data().email as string));
          } else {
            setAdmins(adminEmails);
          }

          if (!adminEmails.includes(user.email!)) {
            toast.error("Access denied. You are not an admin.");
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
          console.error("Error fetching data:", error instanceof Error ? error.message : "Unknown error");
          if (retries > 0) {
            setTimeout(() => fetchData(retries - 1), 2000);
          } else {
            toast.error("Failed to load data after retries.");
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
      toast.success("Job added successfully!");
    } catch (error: unknown) {
      console.error("Error adding job:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to add job.");
    }
  };

  const onUpdateJob: SubmitHandler<JobFormData> = async (data: JobFormData) => {
    if (!editingJob) return;
    try {
      // Explicitly type the update data as Partial<Job> to match Firestore's expectations
      const updateData: Partial<Job> = { ...data };
      await updateDoc(doc(db, "jobs", editingJob.id), updateData);
      setJobs(jobs.map(j => j.id === editingJob.id ? { ...editingJob, ...data } : j));
      setEditingJob(null);
      reset();
      toast.success("Job updated successfully!");
    } catch (error: unknown) {
      console.error("Error updating job:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to update job.");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, "jobs", id));
      setJobs(jobs.filter(j => j.id !== id));
      toast.success("Job deleted successfully!");
    } catch (error: unknown) {
      console.error("Error deleting job:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to delete job.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, newStatus: Application['status']) => {
    try {
      await updateDoc(doc(db, "applications", appId), { status: newStatus });
      setApplications(applications.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      toast.success("Application status updated!");
    } catch (error: unknown) {
      console.error("Error updating application status:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to update status.");
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
      toast.error("Valid email is required.");
      return;
    }
    try {
      await addDoc(collection(db, "admins"), { email: newAdminEmail });
      setAdmins([...admins, newAdminEmail]);
      setNewAdminEmail("");
      toast.success("Admin added successfully!");
    } catch (error: unknown) {
      console.error("Error adding admin:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to add admin.");
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
      toast.success("Admin removed successfully!");
    } catch (error: unknown) {
      console.error("Error removing admin:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to remove admin.");
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
      <div className="py-20 text-center flex items-center justify-center min-h-screen" style={{ color: "#333333", backgroundColor: "#f5f5f5" }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section className="py-20 min-h-screen relative" style={{ backgroundColor: "#f5f5f5" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#800020]/10 to-[#800080]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-poppins"
            style={{ color: "#333333", textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}
          >
            Admin Dashboard
          </motion.h1>
          <div className="flex flex-col md:flex-row justify-center mb-12 space-y-4 md:space-y-0 md:space-x-4">
            {["jobs", "applications", "admins"].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 rounded-full font-semibold font-inter ${
                  selectedTab === tab 
                    ? "bg-gradient-to-r from-[#800020] to-[#800080] text-white" 
                    : "bg-[#ffffff] text-[#800020] border border-[#800020]"
                }`}
                aria-label={`Manage ${tab} Tab`}
              >
                Manage {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {selectedTab === "jobs" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold font-poppins" style={{ color: "#800020" }}>
                {editingJob ? "Edit Job" : "Add New Job"}
              </h2>
              <form onSubmit={handleSubmit(editingJob ? onUpdateJob : onAddJob)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input 
                    {...register("title", { required: "Title is required" })} 
                    placeholder="Title" 
                    className="neumorphic-input w-full font-inter" 
                    style={{ backgroundColor: "#ffffff", color: "#333333" }}
                    aria-label="Job Title"
                  />
                  {errors.title && <p className="text-[#800020] text-sm mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <input 
                    {...register("location", { required: "Location is required" })} 
                    placeholder="Location" 
                    className="neumorphic-input w-full font-inter" 
                    style={{ backgroundColor: "#ffffff", color: "#333333" }}
                    aria-label="Job Location"
                  />
                  {errors.location && <p className="text-[#800020] text-sm mt-1">{errors.location.message}</p>}
                </div>
                <div>
                  <input 
                    {...register("type", { required: "Type is required" })} 
                    placeholder="Type" 
                    className="neumorphic-input w-full font-inter" 
                    style={{ backgroundColor: "#ffffff", color: "#333333" }}
                    aria-label="Job Type"
                  />
                  {errors.type && <p className="text-[#800020] text-sm mt-1">{errors.type.message}</p>}
                </div>
                <div>
                  <input 
                    {...register("duration", { required: "Duration is required" })} 
                    placeholder="Duration" 
                    className="neumorphic-input w-full font-inter" 
                    style={{ backgroundColor: "#ffffff", color: "#333333" }}
                    aria-label="Job Duration"
                  />
                  {errors.duration && <p className="text-[#800020] text-sm mt-1">{errors.duration.message}</p>}
                </div>
                <div>
                  <input 
                    type="number" 
                    {...register("rate", { required: "Rate is required", min: { value: 0, message: "Rate must be positive" } })} 
                    placeholder="Rate" 
                    className="neumorphic-input w-full font-inter" 
                    style={{ backgroundColor: "#ffffff", color: "#333333" }}
                    aria-label="Job Rate"
                  />
                  {errors.rate && <p className="text-[#800020] text-sm mt-1">{errors.rate.message}</p>}
                </div>
                <div>
                  <select 
                    {...register("category", { required: "Category is required" })} 
                    className="neumorphic-input w-full font-inter"
                    style={{ backgroundColor: "#ffffff", color: "#333333" }}
                    aria-label="Job Category"
                  >
                    <option value="">Select Category</option>
                    <option value="staffing">Staffing</option>
                    <option value="models_entertainment">Models & Entertainment</option>
                    <option value="promotions">Promotions</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && <p className="text-[#800020] text-sm mt-1">{errors.category.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <textarea 
                    {...register("description", { required: "Description is required" })} 
                    placeholder="Description" 
                    className="neumorphic-input w-full font-inter" 
                    rows={4}
                    style={{ backgroundColor: "#ffffff", color: "#333333" }}
                    aria-label="Job Description"
                  />
                  {errors.description && <p className="text-[#800020] text-sm mt-1">{errors.description.message}</p>}
                </div>
                <button 
                  type="submit" 
                  className="px-6 py-3 rounded-2xl font-semibold font-inter col-span-2"
                  style={{ background: "linear-gradient(135deg, #800020, #800080)", color: "#ffffff" }}
                  aria-label={editingJob ? "Update Job" : "Add Job"}
                >
                  {editingJob ? "Update Job" : <><FaPlus className="inline mr-2" /> Add Job</>}
                </button>
                {editingJob && (
                  <button 
                    type="button"
                    onClick={() => { setEditingJob(null); reset(); }} 
                    className="px-6 py-3 rounded-2xl font-semibold font-inter col-span-2"
                    style={{ backgroundColor: "#ffffff", color: "#800020", border: "1px solid #800020" }}
                    aria-label="Cancel Edit"
                  >
                    Cancel
                  </button>
                )}
              </form>

              <h2 className="text-2xl font-semibold mt-8 font-poppins" style={{ color: "#800020" }}>Existing Jobs</h2>
              <div className="flex gap-4 mb-4">
                <input
                  placeholder="Search jobs..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="neumorphic-input flex-1 font-inter"
                  style={{ backgroundColor: "#ffffff", color: "#333333" }}
                  aria-label="Search Jobs"
                />
                <FaSearch style={{ color: "#800020", fontSize: "1.5rem" }} />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-[#800020]/20" style={{ backgroundColor: "#ffffff" }}>
                    <h3 className="font-semibold font-poppins" style={{ color: "#333333" }}>{job.title}</h3>
                    <p className="font-inter" style={{ color: "#666666" }}>{job.category}</p>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => {
                          setEditingJob(job);
                          Object.entries(job).forEach(([key, value]) => setValue(key as keyof JobFormData, value));
                        }} 
                        className="text-[#800020]"
                        aria-label={`Edit ${job.title}`}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(job.id)} 
                        className="text-[#800020]"
                        aria-label={`Delete ${job.title}`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {paginatedJobs.length < filteredJobs.length && (
                <div className="text-center mt-4">
                  <button 
                    onClick={() => setJobsPage(p => p + 1)}
                    className="px-6 py-3 rounded-2xl font-semibold font-inter"
                    style={{ background: "linear-gradient(135deg, #800020, #800080)", color: "#ffffff" }}
                    aria-label="Load More Jobs"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedTab === "applications" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold font-poppins" style={{ color: "#800020" }}>Manage Applications</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {paginatedApps.map((app) => (
                  <div key={app.id} className="p-4 rounded-xl border border-[#800020]/20" style={{ backgroundColor: "#ffffff" }}>
                    <p className="font-inter" style={{ color: "#333333" }}><strong>Job ID:</strong> {app.jobId}</p>
                    <p className="font-inter" style={{ color: "#333333" }}><strong>Applicant:</strong> {app.name} ({app.email})</p>
                    <p className="font-inter" style={{ color: "#333333" }}>
                      <strong>Status:</strong> 
                      <select 
                        value={app.status} 
                        onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value as Application['status'])} 
                        className="ml-2 neumorphic-input font-inter"
                        style={{ backgroundColor: "#ffffff", color: "#333333" }}
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
                  <button 
                    onClick={() => setAppsPage(p => p + 1)}
                    className="px-6 py-3 rounded-2xl font-semibold font-inter"
                    style={{ background: "linear-gradient(135deg, #800020, #800080)", color: "#ffffff" }}
                    aria-label="Load More Applications"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedTab === "admins" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold font-poppins" style={{ color: "#800020" }}>Manage Admins</h2>
              <div className="flex gap-4">
                <input
                  placeholder="New Admin Email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="neumorphic-input flex-1 font-inter"
                  style={{ backgroundColor: "#ffffff", color: "#333333" }}
                  aria-label="New Admin Email"
                />
                <button 
                  onClick={handleAddAdmin}
                  className="px-6 py-3 rounded-2xl font-semibold font-inter"
                  style={{ background: "linear-gradient(135deg, #800020, #800080)", color: "#ffffff" }}
                  aria-label="Add Admin"
                >
                  <FaPlus className="inline mr-2" /> Add Admin
                </button>
              </div>
              <div className="space-y-4">
                {admins.map((email) => (
                  <div key={email} className="flex justify-between items-center p-4 rounded-xl" style={{ backgroundColor: "#ffffff", border: "1px solid #800020/20" }}>
                    <p className="font-inter" style={{ color: "#333333" }}>{email}</p>
                    <button 
                      onClick={() => handleRemoveAdmin(email)} 
                      className="text-[#800020]"
                      aria-label={`Remove ${email} as admin`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deleteConfirmId && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="p-6 rounded-lg" style={{ backgroundColor: "#ffffff" }}>
                <p className="font-inter mb-4" style={{ color: "#333333" }}>Are you sure you want to delete this job?</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleDeleteJob(deleteConfirmId)}
                    className="px-4 py-2 rounded-full font-inter"
                    style={{ background: "linear-gradient(135deg, #800020, #800080)", color: "#ffffff" }}
                    aria-label="Confirm Delete"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-4 py-2 rounded-full font-inter"
                    style={{ backgroundColor: "#ffffff", color: "#800020", border: "1px solid #800020" }}
                    aria-label="Cancel Delete"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}