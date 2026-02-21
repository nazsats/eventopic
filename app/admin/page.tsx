"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { logActivity } from "../../lib/activityLog";
import type { ActivityLogEntry } from "../../lib/activityLog";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FaEdit, FaTrash, FaPlus, FaSearch, FaBriefcase, FaUserTie, FaUserShield,
  FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSave, FaTimes,
  FaMoneyBillWave, FaMapMarkerAlt, FaClock, FaTag, FaFilter, FaArrowRight, FaArrowLeft,
  FaEnvelope, FaPhone, FaUsers, FaDownload, FaCrown, FaHistory, FaEye,
  FaUserPlus, FaChartBar, FaShieldAlt, FaCalendar, FaUserCircle
} from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";

// ─── Interfaces ─────────────────────────────────────────────
interface Job {
  id: string; title: string; location: string; type: string; duration: string;
  rate: number; paymentFrequency: string; summary: string; category: string;
  requirements: string[]; benefits: string[]; postedBy: string;
}
interface Application {
  id: string; userEmail: string; jobId: string; name: string; email: string;
  mobile: string; whatsapp?: string; coverLetter: string; timestamp: string;
  status: "pending" | "accepted" | "rejected";
}
interface JobFormData {
  title: string; location: string; type: string; duration: string;
  rate: number; paymentFrequency: string; summary: string; category: string;
}
interface CompanyProfile {
  name: string; employees: number; founded: number; rating: number;
  industry: string; culture: string; benefits: string[];
}
interface AdminRecord {
  id: string; email: string; role: "super_admin" | "admin";
  addedBy?: string; addedAt?: string;
}
interface UserRecord {
  id: string; email?: string; firstName?: string; lastName?: string;
  profileImageUrl?: string; city?: string; country?: string;
  professionCategory?: string; professionSubcategory?: string;
  isProfileComplete?: boolean; createdAt?: string; phoneNumber?: string;
}

// ─── Tabs ───────────────────────────────────────────────────
type TabKey = "jobs" | "applications" | "users" | "admins" | "activity" | "profile";
const SUPER_ADMIN_TABS: TabKey[] = ["jobs", "applications", "users", "admins", "activity", "profile"];
const ADMIN_TABS: TabKey[] = ["jobs", "applications", "profile"];

const TAB_ICONS: Record<TabKey, React.ReactNode> = {
  jobs: <FaBriefcase className="text-xs" />, applications: <FaUserTie className="text-xs" />,
  users: <FaUsers className="text-xs" />, admins: <FaShieldAlt className="text-xs" />,
  activity: <FaHistory className="text-xs" />, profile: <FaChartBar className="text-xs" />,
};

export default function Admin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [myRole, setMyRole] = useState<"super_admin" | "admin">("admin");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [adminRecords, setAdminRecords] = useState<AdminRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<(ActivityLogEntry & { id: string })[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: "Eventopic", employees: 50, founded: 2020, rating: 4.8,
    industry: "Events & Entertainment",
    culture: "We are a team of passionate individuals dedicated to creating unforgettable experiences.",
    benefits: ["Flexible Hours", "Competitive Pay", "Transport Provided"]
  });

  const [selectedTab, setSelectedTab] = useState<TabKey>("jobs");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [jobCategoryFilter, setJobCategoryFilter] = useState("all");
  const [jobSearch, setJobSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [appSearch, setAppSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userProfileFilter, setUserProfileFilter] = useState("all");
  const [userProfessionFilter, setUserProfessionFilter] = useState("all");
  const [activityCategoryFilter, setActivityCategoryFilter] = useState("all");
  const [activityActorFilter, setActivityActorFilter] = useState("all");
  const [jobsPage, setJobsPage] = useState(1);
  const [appsPage, setAppsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const itemsPerPage = 10;
  const usersPerPage = 20;
  const logsPerPage = 25;
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "super_admin">("admin");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JobFormData>();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJobForApps, setSelectedJobForApps] = useState<string | null>(null);
  const [jobRequirements, setJobRequirements] = useState<string[]>([]);
  const [jobBenefits, setJobBenefits] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  const SUPER_ADMIN_EMAIL = "test1@gmail.com";
  const normalize = (str?: string) => str?.toLowerCase().trim() || "";
  const availableTabs = isSuperAdmin ? SUPER_ADMIN_TABS : ADMIN_TABS;

  // ─── Export ───────────────────────────────────────────────
  const handleExportDatabase = async () => {
    if (!confirm("Download complete database backup? This may take a moment.")) return;
    setIsExporting(true);
    try {
      const cols = ["users", "jobs", "applications", "admins", "settings", "staff_inquiries", "leads", "activityLogs"];
      const exportData: Record<string, any[]> = {};
      for (const colName of cols) {
        const snap = await getDocs(collection(db, colName));
        exportData[colName] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eventopic_db_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Database export successful!");
      await logActivity({ actorEmail: user?.email || "", actorRole: myRole, action: "exported_database", category: "system" });
    } catch (error) {
      console.error("Export error:", error); toast.error("Failed to export database.");
    } finally { setIsExporting(false); }
  };

  // ─── Data Fetch ───────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) { router.push("/"); return; }
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch admin records (with roles)
          const adminsSnap = await getDocs(collection(db, "admins"));
          let records: AdminRecord[] = adminsSnap.docs.map(d => ({
            id: d.id, email: d.data().email,
            role: d.data().role || "admin",
            addedBy: d.data().addedBy, addedAt: d.data().addedAt,
          }));

          // Seed if empty
          if (adminsSnap.empty) {
            const initEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(e => e.trim()) || ["ansarinazrul91@gmail.com"];
            for (const email of initEmails) {
              await addDoc(collection(db, "admins"), { email, role: "super_admin", addedAt: new Date().toISOString() });
            }
            const snap2 = await getDocs(collection(db, "admins"));
            records = snap2.docs.map(d => ({ id: d.id, email: d.data().email, role: d.data().role || "admin", addedBy: d.data().addedBy, addedAt: d.data().addedAt }));
          }

          // Ensure super admin email has super_admin role
          const superRec = records.find(r => normalize(r.email) === normalize(SUPER_ADMIN_EMAIL));
          if (superRec && superRec.role !== "super_admin") {
            await updateDoc(doc(db, "admins", superRec.id), { role: "super_admin" });
            superRec.role = "super_admin";
          }

          setAdminRecords(records);
          const adminEmails = records.map(r => r.email);

          if (!user.email || !adminEmails.includes(user.email)) {
            toast.error("Access denied. Admin privileges required.");
            router.push("/jobs"); return;
          }

          const myRec = records.find(r => normalize(r.email) === normalize(user.email || ""));
          const amISuperAdmin = myRec?.role === "super_admin" || normalize(user.email || "") === normalize(SUPER_ADMIN_EMAIL);
          setIsSuperAdmin(amISuperAdmin);
          setMyRole(amISuperAdmin ? "super_admin" : "admin");
          setIsAdmin(true);

          // Fetch jobs, applications, settings
          const [jobsSnap, appsSnap, settingsSnap] = await Promise.all([
            getDocs(collection(db, "jobs")),
            getDocs(collection(db, "applications")),
            getDocs(collection(db, "settings")),
          ]);
          setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
          setApplications(appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
          if (!settingsSnap.empty) setCompanyProfile(settingsSnap.docs[0].data() as CompanyProfile);

          // Super admin: fetch users + activity logs
          if (amISuperAdmin) {
            const [usersSnap, logsSnap] = await Promise.all([
              getDocs(collection(db, "users")),
              getDocs(query(collection(db, "activityLogs"), orderBy("timestamp", "desc"), limit(200))),
            ]);
            setAllUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as UserRecord)));
            setActivityLogs(logsSnap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLogEntry & { id: string })));
          }
        } catch (error) {
          console.error("Admin error:", error); toast.error("Failed to load admin data.");
        } finally { setIsLoading(false); }
      };
      fetchData();
    }
  }, [user, loading, router]);

  // ─── Handlers ─────────────────────────────────────────────
  const onAddJob: SubmitHandler<JobFormData> = async (data) => {
    try {
      const jobData = { ...data, requirements: jobRequirements, benefits: jobBenefits, postedBy: user?.email || "Admin", createdAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, "jobs"), jobData);
      setJobs([...jobs, { id: docRef.id, ...jobData } as Job]);
      reset(); setJobRequirements([]); setJobBenefits([]);
      toast.success("Job posted successfully!");
      await logActivity({ actorEmail: user?.email || "", actorRole: myRole, action: "posted_job", category: "jobs", targetId: docRef.id, targetLabel: data.title });
    } catch (error) { console.error(error); toast.error("Failed to post job."); }
  };

  const onUpdateJob: SubmitHandler<JobFormData> = async (data) => {
    if (!editingJob) return;
    try {
      const jobData = { ...data, requirements: jobRequirements, benefits: jobBenefits };
      await updateDoc(doc(db, "jobs", editingJob.id), jobData);
      setJobs(jobs.map(j => j.id === editingJob.id ? { ...editingJob, ...jobData } : j));
      setEditingJob(null); reset(); setJobRequirements([]); setJobBenefits([]);
      toast.success("Job updated successfully!");
      await logActivity({ actorEmail: user?.email || "", actorRole: myRole, action: "updated_job", category: "jobs", targetId: editingJob.id, targetLabel: data.title });
    } catch (error) { console.error(error); toast.error("Failed to update job."); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ref = collection(db, "settings");
      const snap = await getDocs(ref);
      if (snap.empty) await addDoc(ref, companyProfile);
      else await updateDoc(doc(db, "settings", snap.docs[0].id), { ...companyProfile });
      toast.success("Company profile updated!");
      await logActivity({ actorEmail: user?.email || "", actorRole: myRole, action: "updated_company_profile", category: "profile" });
    } catch (error) { console.error(error); toast.error("Failed to update profile."); }
  };

  const handleDeleteJob = async (id: string) => {
    const jobTitle = jobs.find(j => j.id === id)?.title || "Unknown";
    try {
      await deleteDoc(doc(db, "jobs", id));
      setJobs(jobs.filter(j => j.id !== id));
      toast.success("Job deleted!");
      await logActivity({ actorEmail: user?.email || "", actorRole: myRole, action: "deleted_job", category: "jobs", targetId: id, targetLabel: jobTitle });
    } catch (error) { console.error(error); toast.error("Failed to delete job."); }
    finally { setDeleteConfirmId(null); }
  };

  const handleUpdateApplicationStatus = async (appId: string, newStatus: Application["status"]) => {
    const app = applications.find(a => a.id === appId);
    try {
      await updateDoc(doc(db, "applications", appId), { status: newStatus });
      setApplications(applications.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      toast.success(`Application marked as ${newStatus}`);
      await logActivity({ actorEmail: user?.email || "", actorRole: myRole, action: `${newStatus}_application`, category: "applications", targetId: appId, targetLabel: app?.name || "" });
    } catch (error) { console.error(error); toast.error("Status update failed."); }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
      toast.error("Please enter a valid email."); return;
    }
    if (adminRecords.find(r => normalize(r.email) === normalize(newAdminEmail))) {
      toast.error("This email is already an admin."); return;
    }
    try {
      const newRec = { email: newAdminEmail, role: newAdminRole, addedBy: user?.email || "", addedAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, "admins"), newRec);
      setAdminRecords([...adminRecords, { id: docRef.id, ...newRec }]);
      setNewAdminEmail("");
      toast.success(`Admin added as ${newAdminRole}!`);
      await logActivity({ actorEmail: user?.email || "", actorRole: myRole, action: "added_admin", category: "admins", targetLabel: newAdminEmail, details: `Role: ${newAdminRole}` });
    } catch (error) { console.error(error); toast.error("Failed to add admin."); }
  };

  const handleRemoveAdmin = async (rec: AdminRecord) => {
    if (normalize(rec.email) === normalize(user?.email || "")) {
      toast.error("You cannot remove yourself."); return;
    }
    const superAdminCount = adminRecords.filter(r => r.role === "super_admin").length;
    if (rec.role === "super_admin" && superAdminCount <= 1) {
      toast.error("Cannot remove the last super admin."); return;
    }
    if (!confirm(`Remove admin access for ${rec.email}?`)) return;
    try {
      await deleteDoc(doc(db, "admins", rec.id));
      setAdminRecords(adminRecords.filter(r => r.id !== rec.id));
      toast.success("Admin removed.");
      await logActivity({ actorEmail: user?.email || "", actorRole: myRole, action: "removed_admin", category: "admins", targetLabel: rec.email });
    } catch (error) { console.error(error); toast.error("Failed to remove admin."); }
  };

  const handleChangeAdminRole = async (rec: AdminRecord, newRole: "admin" | "super_admin") => {
    if (rec.role === newRole) return;
    const superAdminCount = adminRecords.filter(r => r.role === "super_admin").length;
    if (rec.role === "super_admin" && newRole === "admin" && superAdminCount <= 1) {
      toast.error("Cannot demote the last super admin."); return;
    }
    try {
      await updateDoc(doc(db, "admins", rec.id), { role: newRole });
      setAdminRecords(adminRecords.map(r => r.id === rec.id ? { ...r, role: newRole } : r));
      toast.success(`${rec.email} is now ${newRole === "super_admin" ? "Super Admin" : "Admin"}`);
      await logActivity({ actorEmail: user?.email || "", actorRole: myRole, action: "changed_admin_role", category: "admins", targetLabel: rec.email, details: `New role: ${newRole}` });
    } catch (error) { console.error(error); toast.error("Failed to change role."); }
  };

  // ─── Filtering ────────────────────────────────────────────
  const filteredJobs = jobs.filter(j => {
    const ue = normalize(user?.email || "");
    const oe = normalize(j.postedBy);
    if (!isSuperAdmin && oe !== ue && oe) return false;
    const ms = j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.location.toLowerCase().includes(jobSearch.toLowerCase());
    const mc = jobCategoryFilter === "all" || j.category === jobCategoryFilter;
    return ms && mc;
  });

  const filteredApplications = applications.filter(a => {
    const job = jobs.find(j => j.id === a.jobId);
    if (!job) return false;
    const ue = normalize(user?.email || "");
    const oe = normalize(job.postedBy);
    if (!isSuperAdmin && oe !== ue && oe) return false;
    const ms = a.name.toLowerCase().includes(appSearch.toLowerCase()) || a.email.toLowerCase().includes(appSearch.toLowerCase()) || a.jobId.includes(appSearch);
    const mst = appStatusFilter === "all" || a.status === appStatusFilter;
    return ms && mst;
  });

  const filteredUsers = allUsers.filter(u => {
    const s = userSearch.toLowerCase();
    const matchSearch = !s || (u.firstName || "").toLowerCase().includes(s) || (u.lastName || "").toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s);
    const matchProfile = userProfileFilter === "all" || (userProfileFilter === "complete" ? u.isProfileComplete : !u.isProfileComplete);
    const matchProfession = userProfessionFilter === "all" || u.professionCategory === userProfessionFilter;
    return matchSearch && matchProfile && matchProfession;
  });

  const filteredLogs = activityLogs.filter(l => {
    const mc = activityCategoryFilter === "all" || l.category === activityCategoryFilter;
    const ma = activityActorFilter === "all" || l.actorRole === activityActorFilter;
    return mc && ma;
  });

  const userProfessionCategories = Array.from(new Set(allUsers.map(u => u.professionCategory).filter(Boolean))) as string[];
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((usersPage - 1) * usersPerPage, usersPage * usersPerPage);
  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice((activityPage - 1) * logsPerPage, activityPage * logsPerPage);

  const paginatedJobs = filteredJobs.slice(0, jobsPage * itemsPerPage);
  const paginatedApps = filteredApplications.slice(0, appsPage * itemsPerPage);

  // ─── Stats ────────────────────────────────────────────────
  const pendingApps = applications.filter(a => a.status === "pending").length;
  const acceptedApps = applications.filter(a => a.status === "accepted").length;
  const acceptRate = applications.length > 0 ? Math.round((acceptedApps / applications.length) * 100) : 0;

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
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display gradient-text mb-1">Admin Portal</h1>
              <p className="text-[var(--text-secondary)] flex items-center gap-2">
                {isSuperAdmin ? <><FaCrown className="text-yellow-500" /> Super Admin</> : <><FaShieldAlt className="text-[var(--primary)]" /> Admin</>}
                <span className="mx-1">•</span> {user?.email}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href="/admin/leads" className="btn-primary px-4 py-3 rounded-xl flex items-center gap-2 font-bold whitespace-nowrap"><FaUsers /> Leads</Link>
              <button onClick={handleExportDatabase} disabled={isExporting} className="btn-secondary px-4 py-3 rounded-xl flex items-center gap-2 font-bold whitespace-nowrap border border-[var(--border)] hover:border-[var(--primary)] transition-all">
                {isExporting ? <FaHourglassHalf className="animate-spin" /> : <FaDownload />}
                {isExporting ? "Exporting..." : "Export DB"}
              </button>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            {[
              { label: "Total Jobs", value: jobs.length, icon: <FaBriefcase />, color: "var(--primary)" },
              { label: "Applications", value: applications.length, icon: <FaUserTie />, color: "var(--accent)" },
              { label: "Pending", value: pendingApps, icon: <FaHourglassHalf />, color: "#eab308" },
              { label: "Accept Rate", value: `${acceptRate}%`, icon: <FaCheckCircle />, color: "#22c55e" },
              ...(isSuperAdmin ? [
                { label: "Users", value: allUsers.length, icon: <FaUsers />, color: "#8b5cf6" },
                { label: "Admins", value: adminRecords.length, icon: <FaShieldAlt />, color: "#f97316" },
              ] : []),
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${stat.color}20`, color: stat.color }}>{stat.icon}</div>
                <div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</div>
                  <div className="text-[10px] uppercase text-[var(--text-muted)] font-bold tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex bg-[var(--surface-elevated)] p-1 rounded-xl border border-[var(--border)] overflow-x-auto max-w-full mb-8">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 md:px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-2 ${selectedTab === tab
                  ? "bg-[var(--primary)] text-white shadow-lg"
                  : "text-[var(--text-secondary)] hover:text-white"}`}
              >
                {TAB_ICONS[tab]}
                <span className="hidden sm:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </button>
            ))}
          </div>

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
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold">Application Management</h2>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">Select a job to view and manage its applicants.</p>
                        </div>
                        <div className="relative w-full md:w-72">
                          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                          <input
                            placeholder="Search your jobs..."
                            value={jobSearch}
                            onChange={(e) => setJobSearch(e.target.value)}
                            className="modern-input pl-10 w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jobs
                        .filter(job => {
                          const ue = normalize(user?.email || "");
                          const oe = normalize(job.postedBy);
                          const isMine = !oe || oe === ue;
                          if (!isSuperAdmin && !isMine) return false;
                          return job.title.toLowerCase().includes(jobSearch.toLowerCase());
                        })
                        .map(job => {
                          const jobApps = applications.filter(app => app.jobId === job.id);
                          const pendingCount = jobApps.filter(a => a.status === 'pending').length;
                          const acceptedCount = jobApps.filter(a => a.status === 'accepted').length;

                          return (
                            <motion.div
                              key={job.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setSelectedJobForApps(job.id)}
                              className="glass-card p-5 cursor-pointer group hover:border-[var(--primary)] transition-all bg-[var(--surface-elevated)]"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-[var(--text-primary)] text-lg line-clamp-1">{job.title}</h3>
                                <div className="text-[var(--primary)] opacity-40 group-hover:opacity-100 transition-opacity">
                                  <FaBriefcase />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-4">
                                <span className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">{job.type}</span>
                                <span>{job.location}</span>
                              </div>

                              <div className="flex items-center gap-4 border-t border-[var(--border)] pt-4">
                                <div className="flex-1">
                                  <div className="text-lg font-bold text-[var(--text-primary)]">{jobApps.length}</div>
                                  <div className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Total</div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-lg font-bold text-yellow-500">{pendingCount}</div>
                                  <div className="text-[10px] uppercase text-yellow-500/70 font-bold">Pending</div>
                                </div>
                                <div className="flex-1 text-right">
                                  <div className="text-lg font-bold text-green-500">{acceptedCount}</div>
                                  <div className="text-[10px] uppercase text-green-500/70 font-bold">Accepted</div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                      {jobs.length === 0 && (
                        <div className="col-span-full text-center py-16 text-[var(--text-muted)] glass-card">
                          <FaBriefcase className="text-4xl mx-auto mb-4 opacity-20" />
                          <p>No jobs found.</p>
                          <button onClick={() => setSelectedTab('jobs')} className="text-[var(--primary)] hover:underline mt-2">Post your first job</button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // LEVEL 2: APPLICANT LIST VIEW
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSelectedJobForApps(null)}
                          className="p-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--primary)] hover:text-white transition-all border border-[var(--border)] shadow-sm"
                        >
                          <FaArrowLeft />
                        </button>
                        <div>
                          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                            {jobs.find(j => j.id === selectedJobForApps)?.title}
                          </h2>
                          <p className="text-xs text-[var(--text-secondary)]">Applicants Management</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-xs" />
                          <input
                            value={appSearch}
                            onChange={(e) => setAppSearch(e.target.value)}
                            placeholder="Name or email..."
                            className="modern-input pl-9 w-40 md:w-56 py-2 text-xs"
                          />
                        </div>
                        <select
                          value={appStatusFilter}
                          onChange={(e) => setAppStatusFilter(e.target.value)}
                          className="modern-input py-2 px-3 text-xs appearance-none w-32 border border-[var(--border)]"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-5 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all bg-[var(--surface-elevated)]"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">{app.name}</h3>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                    app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                      'bg-yellow-500/20 text-yellow-500'
                                    }`}>
                                    {app.status}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
                                  <span className="flex items-center gap-1.5"><FaEnvelope className="text-[var(--primary)]" /> {app.email}</span>
                                  <span className="flex items-center gap-1.5"><FaPhone className="text-[var(--accent)]" /> {app.mobile}</span>
                                  <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><FaHistory /> {new Date(app.timestamp).toLocaleDateString()}</span>
                                </div>
                              </div>

                              <div className="flex gap-2 w-full md:w-auto">
                                <button
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                                  disabled={app.status === 'accepted'}
                                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${app.status === 'accepted'
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20 opacity-50 cursor-not-allowed'
                                    : 'bg-[var(--surface)] text-green-400 border-green-500/30 hover:bg-green-500 hover:text-white'
                                    }`}
                                >
                                  {app.status === 'accepted' ? 'Accepted' : 'Accept'}
                                </button>
                                <button
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                                  disabled={app.status === 'rejected'}
                                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${app.status === 'rejected'
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20 opacity-50 cursor-not-allowed'
                                    : 'bg-[var(--surface)] text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white'
                                    }`}
                                >
                                  {app.status === 'rejected' ? 'Rejected' : 'Reject'}
                                </button>
                              </div>
                            </div>

                            {app.coverLetter && (
                              <details className="mt-4 group">
                                <summary className="text-[10px] font-bold uppercase text-[var(--text-muted)] cursor-pointer hover:text-[var(--primary)] transition-colors list-none flex items-center gap-1">
                                  <FaUserTie className="opacity-50" />
                                  <span>Cover Letter</span>
                                  <span className="group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="mt-3 p-4 rounded-xl bg-[var(--surface)] text-sm text-[var(--text-secondary)] leading-relaxed border border-[var(--border)] whitespace-pre-wrap">
                                  {app.coverLetter}
                                </div>
                              </details>
                            )}
                          </motion.div>
                        ))}

                      {applications.filter(app => app.jobId === selectedJobForApps).length === 0 && (
                        <div className="text-center py-16 text-[var(--text-muted)] glass-card">
                          <FaUserCircle className="text-4xl mx-auto mb-4 opacity-20" />
                          <p>No applications received for this job yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
                }
              </motion.div>
            )}

            {selectedTab === "users" && isSuperAdmin && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="glass-card p-6">
                  {/* Header + Filters */}
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3"><FaUsers className="text-[var(--primary)]" /> All Users</h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{filteredUsers.length} of {allUsers.length} users</p>
                      </div>
                      <div className="relative w-full md:w-72">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                        <input value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setUsersPage(1); }} placeholder="Search by name or email..." className="modern-input pl-10 w-full" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <select value={userProfileFilter} onChange={(e) => { setUserProfileFilter(e.target.value); setUsersPage(1); }} className="modern-input py-2 text-sm appearance-none w-40">
                        <option value="all">All Profiles</option>
                        <option value="complete">✅ Complete</option>
                        <option value="incomplete">⏳ Incomplete</option>
                      </select>
                      {userProfessionCategories.length > 0 && (
                        <select value={userProfessionFilter} onChange={(e) => { setUserProfessionFilter(e.target.value); setUsersPage(1); }} className="modern-input py-2 text-sm appearance-none w-48">
                          <option value="all">All Professions</option>
                          {userProfessionCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* User List */}
                  <div className="grid gap-3">
                    {paginatedUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--primary)] transition-all">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                          {u.profileImageUrl ? <Image src={u.profileImageUrl} alt="" width={48} height={48} className="w-full h-full object-cover" /> : (u.firstName?.[0] || u.email?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[var(--text-primary)] truncate">{u.firstName || ""} {u.lastName || ""}</span>
                            {u.isProfileComplete && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full font-bold uppercase">Complete</span>}
                            {!u.isProfileComplete && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] rounded-full font-bold uppercase">Incomplete</span>}
                          </div>
                          <div className="text-sm text-[var(--text-secondary)] truncate">{u.email}</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {u.professionCategory && <span className="text-xs text-[var(--text-muted)]">{u.professionCategory}</span>}
                            {u.city && <span className="text-xs text-[var(--text-muted)]">📍 {u.city}</span>}
                            {u.phoneNumber && <span className="text-xs text-[var(--text-muted)]">📱 {u.phoneNumber}</span>}
                          </div>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] flex-shrink-0">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </div>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && <div className="text-center py-12 text-[var(--text-muted)]">No users found.</div>}
                  </div>

                  {/* Pagination */}
                  {totalUserPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)]">
                        Showing {(usersPage - 1) * usersPerPage + 1}–{Math.min(usersPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage === 1} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-[var(--text-secondary)] hover:text-white disabled:opacity-30 transition-colors text-sm">‹</button>
                        {Array.from({ length: Math.min(totalUserPages, 7) }, (_, i) => {
                          const pg = totalUserPages <= 7 ? i + 1 : usersPage <= 4 ? i + 1 : Math.min(usersPage - 3 + i, totalUserPages);
                          return (
                            <button key={pg} onClick={() => setUsersPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${usersPage === pg ? "bg-[var(--primary)] text-white" : "glass-card text-[var(--text-secondary)] hover:text-white"}`}>{pg}</button>
                          );
                        })}
                        <button onClick={() => setUsersPage(p => Math.min(totalUserPages, p + 1))} disabled={usersPage === totalUserPages} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-[var(--text-secondary)] hover:text-white disabled:opacity-30 transition-colors text-sm">›</button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {selectedTab === "admins" && isSuperAdmin && (
              <motion.div key="admins" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-6">
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FaUserShield className="text-[var(--primary)]" /> Admin Management
                  </h2>
                  {/* Add Admin Form */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <input value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="admin@eventopic.com" className="modern-input flex-1" />
                    <select value={newAdminRole} onChange={(e) => setNewAdminRole(e.target.value as "admin" | "super_admin")} className="modern-input w-full sm:w-44 appearance-none">
                      <option value="admin">🛡️ Admin</option>
                      <option value="super_admin">👑 Super Admin</option>
                    </select>
                    <button onClick={handleAddAdmin} className="btn-primary whitespace-nowrap"><FaPlus /> Add</button>
                  </div>
                  {/* Admin List */}
                  <div className="space-y-3">
                    {adminRecords.map(rec => (
                      <div key={rec.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${rec.role === "super_admin" ? "bg-gradient-to-br from-yellow-500 to-orange-600" : "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]"}`}>
                            {rec.role === "super_admin" ? <FaCrown /> : <FaShieldAlt />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-[var(--text-primary)]">{rec.email}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${rec.role === "super_admin" ? "bg-yellow-500/20 text-yellow-500" : "bg-[var(--primary)]/20 text-[var(--primary)]"}`}>
                                {rec.role === "super_admin" ? "Super Admin" : "Admin"}
                              </span>
                            </div>
                            {rec.addedBy && <div className="text-xs text-[var(--text-muted)] mt-0.5">Added by {rec.addedBy} {rec.addedAt ? `· ${new Date(rec.addedAt).toLocaleDateString()}` : ""}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                          <select
                            value={rec.role}
                            onChange={(e) => handleChangeAdminRole(rec, e.target.value as "admin" | "super_admin")}
                            className="modern-input py-1 px-3 text-sm appearance-none bg-[var(--surface)] w-36"
                            disabled={normalize(rec.email) === normalize(user?.email || "")}
                          >
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveAdmin(rec)}
                            disabled={normalize(rec.email) === normalize(user?.email || "")}
                            className="text-red-400 hover:text-red-300 transition-colors p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === "activity" && isSuperAdmin && (
              <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="glass-card p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-3"><FaHistory className="text-[var(--primary)]" /> Activity Log</h2>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">Track all actions across the platform</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <select value={activityCategoryFilter} onChange={(e) => { setActivityCategoryFilter(e.target.value); setActivityPage(1); }} className="modern-input py-2 text-sm appearance-none flex-1 md:w-36">
                        <option value="all">All Categories</option>
                        <option value="jobs">Jobs</option>
                        <option value="applications">Applications</option>
                        <option value="users">Users</option>
                        <option value="admins">Admins</option>
                        <option value="leads">Leads</option>
                        <option value="profile">Profile</option>
                        <option value="system">System</option>
                      </select>
                      <select value={activityActorFilter} onChange={(e) => { setActivityActorFilter(e.target.value); setActivityPage(1); }} className="modern-input py-2 text-sm appearance-none flex-1 md:w-36">
                        <option value="all">All Actors</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {filteredLogs.length === 0 && <div className="text-center py-12 text-[var(--text-muted)]">No activity logs yet. Actions will be tracked here.</div>}
                    {paginatedLogs.map(log => {
                      const actionColors: Record<string, string> = {
                        posted_job: "#22c55e", updated_job: "#3b82f6", deleted_job: "#ef4444",
                        accepted_application: "#22c55e", rejected_application: "#ef4444",
                        added_admin: "#8b5cf6", removed_admin: "#ef4444", changed_admin_role: "#f97316",
                        updated_company_profile: "#3b82f6", exported_database: "#6366f1",
                        user_joined: "#22c55e", profile_completed: "#8b5cf6",
                        uploaded_leads: "#22c55e", deleted_lead: "#ef4444", deleted_leads_bulk: "#ef4444", updated_lead_status: "#3b82f6",
                      };
                      const color = actionColors[log.action] || "var(--primary)";
                      const actionLabels: Record<string, string> = {
                        posted_job: "Posted a job", updated_job: "Updated a job", deleted_job: "Deleted a job",
                        accepted_application: "Accepted application", rejected_application: "Rejected application",
                        added_admin: "Added admin", removed_admin: "Removed admin", changed_admin_role: "Changed admin role",
                        updated_company_profile: "Updated company profile", exported_database: "Exported database",
                        user_joined: "User joined", profile_completed: "Profile completed",
                        uploaded_leads: "Uploaded leads", deleted_lead: "Deleted lead", deleted_leads_bulk: "Bulk deleted leads", updated_lead_status: "Updated lead status",
                      };
                      return (
                        <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all">
                          <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[var(--text-primary)] text-sm">{actionLabels[log.action] || log.action.replace(/_/g, " ")}</span>
                              {log.targetLabel && <span className="text-sm text-[var(--accent)]">"{log.targetLabel}"</span>}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${log.actorRole === "super_admin" ? "bg-yellow-500/20 text-yellow-500" : log.actorRole === "admin" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>
                                {log.actorRole === "super_admin" ? "Super Admin" : log.actorRole}
                              </span>
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">
                              by {log.actorEmail} • {new Date(log.timestamp).toLocaleString()}
                              {log.details && <span className="ml-2 text-[var(--text-secondary)]">— {log.details}</span>}
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-[var(--surface)] text-[10px] font-bold uppercase text-[var(--text-muted)] flex-shrink-0">{log.category}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalLogPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)]">
                        Showing {(activityPage - 1) * logsPerPage + 1}–{Math.min(activityPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setActivityPage(p => Math.max(1, p - 1))} disabled={activityPage === 1} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-[var(--text-secondary)] hover:text-white disabled:opacity-30 transition-colors text-sm">‹</button>
                        {Array.from({ length: Math.min(totalLogPages, 7) }, (_, i) => {
                          const pg = totalLogPages <= 7 ? i + 1 : activityPage <= 4 ? i + 1 : Math.min(activityPage - 3 + i, totalLogPages);
                          return (
                            <button key={pg} onClick={() => setActivityPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${activityPage === pg ? "bg-[var(--primary)] text-white" : "glass-card text-[var(--text-secondary)] hover:text-white"}`}>{pg}</button>
                          );
                        })}
                        <button onClick={() => setActivityPage(p => Math.min(totalLogPages, p + 1))} disabled={activityPage === totalLogPages} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-[var(--text-secondary)] hover:text-white disabled:opacity-30 transition-colors text-sm">›</button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {selectedTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto">
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FaBriefcase className="text-[var(--primary)]" /> Company Profile Settings
                  </h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Company Name</label>
                        <input value={companyProfile.name} onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })} className="modern-input" />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Industry</label>
                        <input value={companyProfile.industry} onChange={(e) => setCompanyProfile({ ...companyProfile, industry: e.target.value })} className="modern-input" />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Employees</label>
                        <input type="number" value={companyProfile.employees} onChange={(e) => setCompanyProfile({ ...companyProfile, employees: parseInt(e.target.value) })} className="modern-input" />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Founded Year</label>
                        <input type="number" value={companyProfile.founded} onChange={(e) => setCompanyProfile({ ...companyProfile, founded: parseInt(e.target.value) })} className="modern-input" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Culture & Values</label>
                        <textarea value={companyProfile.culture} onChange={(e) => setCompanyProfile({ ...companyProfile, culture: e.target.value })} className="modern-input" rows={4} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)]">Global Benefits (Comma separated)</label>
                        <input value={companyProfile.benefits.join(", ")} onChange={(e) => setCompanyProfile({ ...companyProfile, benefits: e.target.value.split(",").map(b => b.trim()) })} className="modern-input" placeholder="Flexible Hours, Health Insurance, etc." />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center"><FaSave className="mr-2" /> Save Profile</button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteConfirmId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card p-8 max-w-sm w-full text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6"><FaTrash className="text-2xl" /></div>
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
