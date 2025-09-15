"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

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

export default function Admin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [newJob, setNewJob] = useState<Partial<Job>>({});
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [selectedTab, setSelectedTab] = useState("jobs");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    if (user) {
      if (user.email !== "ansarinazrul91@gmail.com") {
        toast.error("Access denied. You are not an admin.");
        router.push("/portal");
        return;
      }
      setIsAdmin(true);
      const fetchData = async () => {
        try {
          const jobsSnapshot = await getDocs(collection(db, "jobs"));
          setJobs(jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));

          const appsSnapshot = await getDocs(collection(db, "applications"));
          setApplications(appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));

          const adminsSnapshot = await getDocs(collection(db, "admins"));
          setAdmins(adminsSnapshot.docs.map(doc => doc.data().email));

          setIsLoading(false);
        } catch (error: unknown) {
          console.error("Error fetching admin data:", error instanceof Error ? error.message : "Unknown error");
          toast.error("Failed to load admin data.");
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, loading, router]);

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.category) {
      toast.error("Title and category are required.");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "jobs"), newJob);
      setJobs([...jobs, { id: docRef.id, ...newJob } as Job]);
      setNewJob({});
      toast.success("Job added successfully!");
    } catch (error: unknown) {
      console.error("Error adding job:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to add job.");
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    try {
      const { id, ...updateData } = editingJob;
      await updateDoc(doc(db, "jobs", id), updateData);
      setJobs(jobs.map(j => j.id === editingJob.id ? editingJob : j));
      setEditingJob(null);
      toast.success("Job updated successfully!");
    } catch (error: unknown) {
      console.error("Error updating job:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to update job.");
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteDoc(doc(db, "jobs", id));
      setJobs(jobs.filter(j => j.id !== id));
      toast.success("Job deleted successfully!");
    } catch (error: unknown) {
      console.error("Error deleting job:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to delete job.");
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
    if (!newAdminEmail) {
      toast.error("Email is required.");
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

  if (loading || isLoading || !isAdmin) {
    return <div className="py-20 text-center flex items-center justify-center min-h-screen" style={{ color: "var(--white)" }}>Loading...</div>;
  }

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
            Admin Dashboard
          </motion.h1>
          <div className="flex flex-col md:flex-row justify-center mb-12 space-y-4 md:space-y-0 md:space-x-4">
            <button onClick={() => setSelectedTab("jobs")} className={`px-6 py-3 rounded-full font-semibold ${selectedTab === "jobs" ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)]" : "bg-[var(--accent)] text-[var(--white)]"}`}>Manage Jobs</button>
            <button onClick={() => setSelectedTab("applications")} className={`px-6 py-3 rounded-full font-semibold ${selectedTab === "applications" ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)]" : "bg-[var(--accent)] text-[var(--white)]"}`}>Manage Applications</button>
            <button onClick={() => setSelectedTab("admins")} className={`px-6 py-3 rounded-full font-semibold ${selectedTab === "admins" ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)]" : "bg-[var(--accent)] text-[var(--white)]"}`}>Manage Admins</button>
          </div>

          {selectedTab === "jobs" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold" style={{ color: "var(--color-accent)" }}>Add New Job</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Title" value={newJob.title || ""} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="neumorphic-input" />
                <input placeholder="Location" value={newJob.location || ""} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} className="neumorphic-input" />
                <input placeholder="Type" value={newJob.type || ""} onChange={(e) => setNewJob({ ...newJob, type: e.target.value })} className="neumorphic-input" />
                <input placeholder="Duration" value={newJob.duration || ""} onChange={(e) => setNewJob({ ...newJob, duration: e.target.value })} className="neumorphic-input" />
                <input type="number" placeholder="Rate" value={newJob.rate || ""} onChange={(e) => setNewJob({ ...newJob, rate: parseInt(e.target.value) })} className="neumorphic-input" />
                <select value={newJob.category || ""} onChange={(e) => setNewJob({ ...newJob, category: e.target.value })} className="neumorphic-input">
                  <option value="">Select Category</option>
                  <option value="staffing">Staffing</option>
                  <option value="models_entertainment">Models & Entertainment</option>
                  <option value="promotions">Promotions</option>
                  <option value="other">Other</option>
                </select>
                <textarea placeholder="Description" value={newJob.description || ""} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} className="neumorphic-input col-span-2" rows={4} />
              </div>
              <button onClick={handleAddJob} className="px-6 py-3 rounded-2xl font-semibold" style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}>
                <FaPlus /> Add Job
              </button>

              <h2 className="text-2xl font-semibold mt-8" style={{ color: "var(--color-accent)" }}>Existing Jobs</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <div key={job.id} className="card p-4 rounded-xl border border-[var(--accent)]/20">
                    {editingJob?.id === job.id ? (
                      <>
                        <input value={editingJob.title} onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })} className="neumorphic-input mb-2" />
                        <input value={editingJob.location} onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })} className="neumorphic-input mb-2" />
                        <input value={editingJob.type} onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })} className="neumorphic-input mb-2" />
                        <input value={editingJob.duration} onChange={(e) => setEditingJob({ ...editingJob, duration: e.target.value })} className="neumorphic-input mb-2" />
                        <input type="number" value={editingJob.rate} onChange={(e) => setEditingJob({ ...editingJob, rate: parseInt(e.target.value) })} className="neumorphic-input mb-2" />
                        <select value={editingJob.category} onChange={(e) => setEditingJob({ ...editingJob, category: e.target.value })} className="neumorphic-input mb-2">
                          <option value="">Select Category</option>
                          <option value="staffing">Staffing</option>
                          <option value="models_entertainment">Models & Entertainment</option>
                          <option value="promotions">Promotions</option>
                          <option value="other">Other</option>
                        </select>
                        <textarea value={editingJob.description} onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })} className="neumorphic-input mb-2" rows={4} />
                        <button onClick={handleUpdateJob} className="px-4 py-2 rounded-full bg-[var(--teal-accent)] text-[var(--primary)] mr-2">Save</button>
                        <button onClick={() => setEditingJob(null)} className="px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--white)]">Cancel</button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p>{job.category}</p>
                        <button onClick={() => setEditingJob(job)} className="text-[var(--color-accent)] mr-2"><FaEdit /></button>
                        <button onClick={() => handleDeleteJob(job.id)} className="text-[var(--color-accent)]"><FaTrash /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "applications" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold" style={{ color: "var(--color-accent)" }}>Manage Applications</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {applications.map((app) => (
                  <div key={app.id} className="card p-4 rounded-xl border border-[var(--accent)]/20">
                    <p><strong>Job ID:</strong> {app.jobId}</p>
                    <p><strong>Applicant:</strong> {app.name} ({app.email})</p>
                    <p><strong>Status:</strong> 
                      <select value={app.status} onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value as Application['status'])} className="ml-2 neumorphic-input">
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "admins" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold" style={{ color: "var(--color-accent)" }}>Manage Admins</h2>
              <div className="flex gap-4">
                <input placeholder="New Admin Email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="neumorphic-input flex-1" />
                <button onClick={handleAddAdmin} className="px-6 py-3 rounded-2xl font-semibold" style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}>
                  <FaPlus /> Add Admin
                </button>
              </div>
              <div className="space-y-4">
                {admins.map((email) => (
                  <div key={email} className="flex justify-between items-center p-4 bg-[var(--soft)] rounded-xl">
                    <p>{email}</p>
                    <button onClick={() => handleRemoveAdmin(email)} className="text-[var(--color-accent)]"><FaTrash /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}