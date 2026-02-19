// app/admin/leads/page.tsx
"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Navbar from "../../../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import {
    FaUpload,
    FaSearch,
    FaFilter,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaTrash,
    FaDownload,
    FaInstagram,
    FaFacebook,
    FaLinkedin,
    FaYoutube,
    FaTiktok,
    FaTwitter,
    FaPhone,
    FaEnvelope,
    FaGlobe,
    FaBuilding,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaStar,
    FaTimesCircle,
    FaCircle,
    FaArrowLeft,
    FaUsers,
    FaFileUpload,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadStatus = "new" | "contacted" | "priority" | "rejected";

interface Lead {
    id: string;
    imageUrl?: string;
    title: string;
    instagram?: string;
    instagram2?: string;
    facebook?: string;
    facebook2?: string;
    linkedin?: string;
    linkedin2?: string;
    youtube?: string;
    youtube2?: string;
    tiktok?: string;
    tiktok2?: string;
    twitter?: string;
    twitter2?: string;
    phone?: string;
    email1?: string;
    email2?: string;
    email3?: string;
    email4?: string;
    email5?: string;
    city?: string;
    website?: string;
    url?: string;
    status: LeadStatus;
    uploadedAt: string;
    notes?: string;
}

type SortField = keyof Pick<Lead, "title" | "city" | "status" | "uploadedAt">;
type SortDir = "asc" | "desc";

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];

    // Parse headers
    const headers = splitCSVLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/\//g, "_"));

    return lines.slice(1).map((line) => {
        const values = splitCSVLine(line);
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
            row[h] = (values[i] || "").trim();
        });
        return row;
    });
}

function splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

// Map CSV row → Lead fields (flexible column name matching)
function mapRowToLead(row: Record<string, string>): Omit<Lead, "id" | "status" | "uploadedAt"> {
    const get = (...keys: string[]) => {
        for (const k of keys) {
            if (row[k]) return row[k];
        }
        return "";
    };

    return {
        imageUrl: get("imageurl", "image_url", "image", "logo"),
        title: get("title", "name", "company", "business_name") || "Unnamed",
        instagram: get("instagram", "instagram_0", "instagrams_0"),
        instagram2: get("instagram2", "instagram_1", "instagrams_1"),
        facebook: get("facebook", "facebook_0", "facebooks_0"),
        facebook2: get("facebook2", "facebook_1", "facebooks_1"),
        linkedin: get("linkedin", "linkedin_0", "linkedins_0"),
        linkedin2: get("linkedin2", "linkedin_1", "linkedins_1"),
        youtube: get("youtube", "youtubes_0", "youtube_0"),
        youtube2: get("youtube2", "youtubes_1", "youtube_1"),
        tiktok: get("tiktok", "tiktoks_0", "tiktok_0"),
        tiktok2: get("tiktok2", "tiktoks_1", "tiktok_1"),
        twitter: get("twitter", "twitters_0", "twitter_0"),
        twitter2: get("twitter2", "twitters_1", "twitter_1"),
        phone: get("phone", "phone_number", "mobile"),
        email1: get("emails_0", "email_0", "email1", "email"),
        email2: get("emails_1", "email_1", "email2"),
        email3: get("emails_2", "email_2", "email3"),
        email4: get("emails_3", "email_3", "email4"),
        email5: get("emails_4", "email_4", "email5"),
        city: get("city", "location", "emirate"),
        website: get("website", "web", "site"),
        url: get("url", "source_url", "profile_url"),
        notes: "",
    };
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: React.ReactNode }> = {
    new: { label: "New", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <FaCircle size={10} /> },
    contacted: { label: "Contacted", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <FaCheckCircle size={10} /> },
    priority: { label: "Priority", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: <FaStar size={10} /> },
    rejected: { label: "Not Interested", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <FaTimesCircle size={10} /> },
};

// ─── Social Link Button ───────────────────────────────────────────────────────

function SocialBtn({ href, icon, color }: { href?: string; icon: React.ReactNode; color: string }) {
    if (!href) return null;
    return (
        <a
            href={href.startsWith("http") ? href : `https://${href}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all hover:scale-110 ${color}`}
            title={href}
        >
            {icon}
        </a>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

export default function LeadsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [sortField, setSortField] = useState<SortField>("uploadedAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState<{ id: string; note: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Auth check ──
    useEffect(() => {
        if (!loading && !user) { router.push("/"); return; }
        if (user) {
            const check = async () => {
                try {
                    const snap = await getDocs(collection(db, "admins"));
                    const emails = snap.docs.map((d) => d.data().email as string);
                    if (!user.email || !emails.includes(user.email)) {
                        toast.error("Access denied.");
                        router.push("/");
                        return;
                    }
                    setIsAdmin(true);
                    const leadsSnap = await getDocs(collection(db, "leads"));
                    setLeads(leadsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Lead)));
                } catch (e) {
                    toast.error("Failed to load leads.");
                } finally {
                    setIsLoading(false);
                }
            };
            check();
        }
    }, [user, loading, router]);

    // ── CSV Upload with Dedup ──
    const handleFile = useCallback(async (file: File) => {
        if (!file.name.endsWith(".csv")) {
            toast.error("Please upload a .csv file. In Google Sheets: File → Download → CSV");
            return;
        }
        setIsUploading(true);
        try {
            const text = await file.text();
            const rows = parseCSV(text);
            if (rows.length === 0) { toast.error("No data found in CSV."); return; }

            const now = new Date().toISOString();
            const norm = (s?: string) => (s || "").toLowerCase().trim().replace(/\s+/g, " ");

            // Build fingerprint index of already-saved leads
            // A match on ANY two of: (title, phone, email1) counts as a duplicate
            const existingTitle = new Set(leads.map((l) => norm(l.title)));
            const existingPhone = new Set(leads.map((l) => norm(l.phone)).filter(Boolean));
            const existingEmail = new Set(leads.map((l) => norm(l.email1)).filter(Boolean));

            // Intra-file dedup: track what we've already added from this upload
            const seenInBatch = new Set<string>();

            const batch = writeBatch(db);
            const newLeads: Lead[] = [];
            let skipped = 0;

            for (const row of rows) {
                const mapped = mapRowToLead(row);
                if (!mapped.title || mapped.title === "Unnamed") { skipped++; continue; }

                const t = norm(mapped.title);
                const p = norm(mapped.phone);
                const e = norm(mapped.email1);

                // Duplicate if same title+phone, title+email, or phone+email already exist
                const isDup =
                    (existingTitle.has(t) && existingPhone.has(p) && p) ||
                    (existingTitle.has(t) && existingEmail.has(e) && e) ||
                    (existingPhone.has(p) && existingEmail.has(e) && p && e);

                // Also deduplicate rows within this CSV
                const batchKey = `${t}|${p || e}`;
                const isDupInBatch = seenInBatch.has(batchKey) && batchKey !== "|";

                if (isDup || isDupInBatch) { skipped++; continue; }

                seenInBatch.add(batchKey);

                const leadData: Omit<Lead, "id"> = { ...mapped, status: "new", uploadedAt: now };
                const ref = doc(collection(db, "leads"));
                batch.set(ref, leadData);
                newLeads.push({ id: ref.id, ...leadData });
            }

            if (newLeads.length > 0) {
                await batch.commit();
                setLeads((prev) => [...newLeads, ...prev]);
            }

            if (skipped === 0) {
                toast.success(`✅ Uploaded ${newLeads.length} leads!`);
            } else if (newLeads.length > 0) {
                toast.success(`✅ ${newLeads.length} new leads added. ⚠️ ${skipped} duplicate${skipped !== 1 ? "s" : ""} skipped.`);
            } else {
                toast.info(`No new leads — all ${skipped} rows already exist in your database.`);
            }
        } catch (e) {
            console.error(e);
            toast.error("Upload failed. Check CSV format.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [leads]);


    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    // ── Status Update ──
    const updateStatus = async (id: string, status: LeadStatus) => {
        await updateDoc(doc(db, "leads", id), { status });
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    };

    // ── Delete ──
    const deleteLead = async (id: string) => {
        await deleteDoc(doc(db, "leads", id));
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
        toast.success("Lead deleted.");
    };

    const deleteSelected = async () => {
        if (!confirm(`Delete ${selectedIds.size} leads?`)) return;
        const batch = writeBatch(db);
        selectedIds.forEach((id) => batch.delete(doc(db, "leads", id)));
        await batch.commit();
        setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)));
        setSelectedIds(new Set());
        toast.success(`Deleted ${selectedIds.size} leads.`);
    };

    // ── Save note ──
    const saveNote = async () => {
        if (!editingNote) return;
        await updateDoc(doc(db, "leads", editingNote.id), { notes: editingNote.note });
        setLeads((prev) => prev.map((l) => l.id === editingNote.id ? { ...l, notes: editingNote.note } : l));
        setEditingNote(null);
        toast.success("Note saved.");
    };

    // ── Sort ──
    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortField(field); setSortDir("asc"); }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <FaSort className="opacity-30" size={10} />;
        return sortDir === "asc" ? <FaSortUp size={10} /> : <FaSortDown size={10} />;
    };

    // ── Export CSV ──
    const exportCSV = () => {
        const headers = ["Title", "Phone", "Email1", "Email2", "City", "Website", "Instagram", "Facebook", "LinkedIn", "Status", "Notes"];
        const rows = filtered.map((l) => [
            l.title, l.phone, l.email1, l.email2, l.city, l.website,
            l.instagram, l.facebook, l.linkedin, l.status, l.notes,
        ].map((v) => `"${(v || "").replace(/"/g, '""')}"`).join(","));
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `eventopic_leads_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Filter + Sort ──
    const cities = Array.from(new Set(leads.map((l) => l.city).filter(Boolean))) as string[];

    const filtered = leads
        .filter((l) => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                l.title.toLowerCase().includes(q) ||
                (l.phone || "").includes(q) ||
                (l.email1 || "").toLowerCase().includes(q) ||
                (l.city || "").toLowerCase().includes(q);
            const matchStatus = statusFilter === "all" || l.status === statusFilter;
            const matchCity = cityFilter === "all" || l.city === cityFilter;
            return matchSearch && matchStatus && matchCity;
        })
        .sort((a, b) => {
            const av = (a[sortField] || "") as string;
            const bv = (b[sortField] || "") as string;
            return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginated.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(paginated.map((l) => l.id)));
    };

    // ── Loading State ──
    if (loading || isLoading || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary)]" />
            </div>
        );
    }

    // ── Stats ──
    const stats = {
        total: leads.length,
        new: leads.filter((l) => l.status === "new").length,
        contacted: leads.filter((l) => l.status === "contacted").length,
        priority: leads.filter((l) => l.status === "priority").length,
    };

    return (
        <>
            <Navbar />
            <section className="pt-24 pb-16 min-h-screen bg-[var(--background)] relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 relative z-10 max-w-screen-2xl">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors text-sm mb-4">
                            <FaArrowLeft size={12} /> Back to Admin
                        </Link>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold font-display gradient-text mb-1">Leads</h1>
                                <p className="text-[var(--text-secondary)]">Upload, manage, and track your business contacts.</p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                {selectedIds.size > 0 && (
                                    <button onClick={deleteSelected} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-bold">
                                        <FaTrash size={12} /> Delete ({selectedIds.size})
                                    </button>
                                )}
                                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-secondary)] hover:text-white transition-all text-sm font-bold">
                                    <FaDownload size={12} /> Export CSV
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "Total Leads", value: stats.total, color: "from-[var(--primary)] to-[var(--secondary)]", icon: <FaUsers /> },
                            { label: "New", value: stats.new, color: "from-blue-500 to-blue-600", icon: <FaCircle /> },
                            { label: "Contacted", value: stats.contacted, color: "from-green-500 to-green-600", icon: <FaCheckCircle /> },
                            { label: "Priority", value: stats.priority, color: "from-amber-500 to-amber-600", icon: <FaStar /> },
                        ].map((stat) => (
                            <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-[var(--text-primary)]">{stat.value}</div>
                                    <div className="text-xs text-[var(--text-muted)] font-semibold">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Upload Zone */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`glass-card p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 ${isDragging ? "border-[var(--primary)] bg-[var(--primary)]/10 scale-[1.01]" : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--surface)]"}`}
                        >
                            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                                    <p className="text-[var(--text-secondary)] font-semibold">Uploading to Firebase...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-2xl shadow-lg">
                                        <FaFileUpload />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-[var(--text-primary)]">Drop CSV here or click to upload</p>
                                        <p className="text-sm text-[var(--text-muted)] mt-1">
                                            In Google Sheets: <strong>File → Download → Comma Separated Values (.csv)</strong>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--surface)] px-4 py-2 rounded-full border border-[var(--border)]">
                                        <FaUpload size={10} /> Supports: imageUrl, title, instagram, facebook, linkedin, phone, emails, city, website
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Filters */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 mb-6 flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={13} />
                            <input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search name, phone, email, city..."
                                className="modern-input pl-9 py-2.5 w-full text-sm"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={12} />
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                                className="modern-input pl-9 py-2.5 text-sm appearance-none bg-[var(--surface)] text-[var(--text-primary)] pr-8 min-w-[160px]"
                            >
                                <option value="all">All Statuses</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="priority">Priority</option>
                                <option value="rejected">Not Interested</option>
                            </select>
                        </div>

                        {/* City Filter */}
                        {cities.length > 0 && (
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={12} />
                                <select
                                    value={cityFilter}
                                    onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                                    className="modern-input pl-9 py-2.5 text-sm appearance-none bg-[var(--surface)] text-[var(--text-primary)] pr-8 min-w-[160px]"
                                >
                                    <option value="all">All Cities</option>
                                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}

                        <p className="text-xs text-[var(--text-muted)] ml-auto font-semibold">
                            {filtered.length} of {leads.length} leads
                        </p>
                    </motion.div>

                    {/* Table */}
                    {leads.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                            <div className="glass-card p-12 max-w-md mx-auto">
                                <FaUpload className="text-5xl text-[var(--primary)] mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No Leads Yet</h3>
                                <p className="text-[var(--text-secondary)]">Upload your Google Sheet CSV above to get started.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                            <div className="glass-card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                                                <th className="px-4 py-3 text-left w-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.size === paginated.length && paginated.length > 0}
                                                        onChange={toggleSelectAll}
                                                        className="rounded border-[var(--border)] bg-[var(--surface-elevated)]"
                                                    />
                                                </th>
                                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-semibold uppercase tracking-wider text-xs min-w-[200px]">
                                                    <button onClick={() => handleSort("title")} className="flex items-center gap-1 hover:text-white transition-colors">
                                                        Company / Lead <SortIcon field="title" />
                                                    </button>
                                                </th>
                                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-semibold uppercase tracking-wider text-xs min-w-[140px]">Contact</th>
                                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-semibold uppercase tracking-wider text-xs">
                                                    <button onClick={() => handleSort("city")} className="flex items-center gap-1 hover:text-white transition-colors">
                                                        City <SortIcon field="city" />
                                                    </button>
                                                </th>
                                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-semibold uppercase tracking-wider text-xs">Socials</th>
                                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-semibold uppercase tracking-wider text-xs">
                                                    <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-white transition-colors">
                                                        Status <SortIcon field="status" />
                                                    </button>
                                                </th>
                                                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-semibold uppercase tracking-wider text-xs">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {paginated.map((lead) => (
                                                <>
                                                    <tr
                                                        key={lead.id}
                                                        className={`hover:bg-[var(--surface)]/50 transition-colors cursor-pointer ${selectedIds.has(lead.id) ? "bg-[var(--primary)]/5" : ""}`}
                                                        onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                                                    >
                                                        {/* Checkbox */}
                                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.has(lead.id)}
                                                                onChange={() => toggleSelect(lead.id)}
                                                                className="rounded border-[var(--border)] bg-[var(--surface-elevated)]"
                                                            />
                                                        </td>

                                                        {/* Name + Image */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                                                                    {lead.imageUrl ? (
                                                                        <img src={lead.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                                                    ) : (
                                                                        <FaBuilding size={14} />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-[var(--text-primary)] leading-none">{lead.title}</p>
                                                                    {lead.website && (
                                                                        <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline" onClick={(e) => e.stopPropagation()}>
                                                                            {lead.website.replace(/^https?:\/\//, "").slice(0, 30)}
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Contact */}
                                                        <td className="px-4 py-3">
                                                            <div className="space-y-1">
                                                                {lead.phone && (
                                                                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors" onClick={(e) => e.stopPropagation()}>
                                                                        <FaPhone size={10} className="text-green-400" /> {lead.phone}
                                                                    </a>
                                                                )}
                                                                {lead.email1 && (
                                                                    <a href={`mailto:${lead.email1}`} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors" onClick={(e) => e.stopPropagation()}>
                                                                        <FaEnvelope size={10} className="text-blue-400" /> {lead.email1.slice(0, 25)}{lead.email1.length > 25 ? "…" : ""}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* City */}
                                                        <td className="px-4 py-3">
                                                            {lead.city && (
                                                                <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                                                                    <FaMapMarkerAlt className="text-[var(--primary)]" size={10} /> {lead.city}
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Socials */}
                                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex flex-wrap gap-1">
                                                                <SocialBtn href={lead.instagram} icon={<FaInstagram />} color="bg-pink-500/20 text-pink-400 hover:bg-pink-500/30" />
                                                                <SocialBtn href={lead.facebook} icon={<FaFacebook />} color="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30" />
                                                                <SocialBtn href={lead.linkedin} icon={<FaLinkedin />} color="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" />
                                                                <SocialBtn href={lead.youtube} icon={<FaYoutube />} color="bg-red-500/20 text-red-400 hover:bg-red-500/30" />
                                                                <SocialBtn href={lead.tiktok} icon={<FaTiktok />} color="bg-slate-500/20 text-slate-300 hover:bg-slate-500/30" />
                                                                <SocialBtn href={lead.twitter} icon={<FaTwitter />} color="bg-sky-500/20 text-sky-400 hover:bg-sky-500/30" />
                                                            </div>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                            <select
                                                                value={lead.status}
                                                                onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                                                                className={`px-2 py-1 rounded-lg border text-xs font-bold appearance-none cursor-pointer ${STATUS_CONFIG[lead.status].color}`}
                                                            >
                                                                <option value="new">🔵 New</option>
                                                                <option value="contacted">✅ Contacted</option>
                                                                <option value="priority">⭐ Priority</option>
                                                                <option value="rejected">❌ Not Interested</option>
                                                            </select>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => deleteLead(lead.id)}
                                                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                                                                title="Delete lead"
                                                            >
                                                                <FaTrash size={11} />
                                                            </button>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Row */}
                                                    <AnimatePresence>
                                                        {expandedId === lead.id && (
                                                            <motion.tr
                                                                key={`${lead.id}-expanded`}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                            >
                                                                <td colSpan={7} className="px-6 py-4 bg-[var(--surface)]/60 border-b border-[var(--border)]">
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                        {/* All Emails */}
                                                                        <div>
                                                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">All Emails</p>
                                                                            <div className="space-y-1">
                                                                                {[lead.email1, lead.email2, lead.email3, lead.email4, lead.email5].filter(Boolean).map((e, i) => (
                                                                                    <a key={i} href={`mailto:${e}`} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--primary)]">
                                                                                        <FaEnvelope size={10} /> {e}
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* All Socials */}
                                                                        <div>
                                                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">All Social Profiles</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {[
                                                                                    { href: lead.instagram, icon: <FaInstagram />, label: "IG 1", color: "bg-pink-500/20 text-pink-400" },
                                                                                    { href: lead.instagram2, icon: <FaInstagram />, label: "IG 2", color: "bg-pink-500/20 text-pink-400" },
                                                                                    { href: lead.facebook, icon: <FaFacebook />, label: "FB 1", color: "bg-blue-600/20 text-blue-400" },
                                                                                    { href: lead.facebook2, icon: <FaFacebook />, label: "FB 2", color: "bg-blue-600/20 text-blue-400" },
                                                                                    { href: lead.linkedin, icon: <FaLinkedin />, label: "LI 1", color: "bg-blue-500/20 text-blue-300" },
                                                                                    { href: lead.linkedin2, icon: <FaLinkedin />, label: "LI 2", color: "bg-blue-500/20 text-blue-300" },
                                                                                    { href: lead.youtube, icon: <FaYoutube />, label: "YT 1", color: "bg-red-500/20 text-red-400" },
                                                                                    { href: lead.youtube2, icon: <FaYoutube />, label: "YT 2", color: "bg-red-500/20 text-red-400" },
                                                                                    { href: lead.tiktok, icon: <FaTiktok />, label: "TT 1", color: "bg-slate-500/20 text-slate-300" },
                                                                                    { href: lead.tiktok2, icon: <FaTiktok />, label: "TT 2", color: "bg-slate-500/20 text-slate-300" },
                                                                                    { href: lead.twitter, icon: <FaTwitter />, label: "TW 1", color: "bg-sky-500/20 text-sky-400" },
                                                                                    { href: lead.twitter2, icon: <FaTwitter />, label: "TW 2", color: "bg-sky-500/20 text-sky-400" },
                                                                                ].filter((s) => s.href).map((s, i) => (
                                                                                    <a key={i} href={s.href!.startsWith("http") ? s.href! : `https://${s.href}`} target="_blank" rel="noopener noreferrer"
                                                                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${s.color}`}>
                                                                                        {s.icon} {s.label}
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Notes */}
                                                                        <div>
                                                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Notes</p>
                                                                            {editingNote?.id === lead.id ? (
                                                                                <div className="flex flex-col gap-2">
                                                                                    <textarea
                                                                                        value={editingNote.note}
                                                                                        onChange={(e) => setEditingNote({ id: lead.id, note: e.target.value })}
                                                                                        className="modern-input text-xs resize-none"
                                                                                        rows={3}
                                                                                        placeholder="Add a note..."
                                                                                    />
                                                                                    <div className="flex gap-2">
                                                                                        <button onClick={saveNote} className="btn-primary text-xs py-1.5 px-3">Save</button>
                                                                                        <button onClick={() => setEditingNote(null)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div
                                                                                    onClick={() => setEditingNote({ id: lead.id, note: lead.notes || "" })}
                                                                                    className="text-xs text-[var(--text-secondary)] p-2 rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--primary)] cursor-pointer min-h-[60px] transition-colors"
                                                                                >
                                                                                    {lead.notes || <span className="text-[var(--text-muted)] italic">Click to add a note…</span>}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        )}
                                                    </AnimatePresence>
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
                                        <p className="text-xs text-[var(--text-muted)]">
                                            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-[var(--text-secondary)] hover:text-white disabled:opacity-30 transition-colors"
                                            >
                                                <FaChevronLeft size={12} />
                                            </button>
                                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => setPage(p)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === p ? "bg-[var(--primary)] text-white" : "glass-card text-[var(--text-secondary)] hover:text-white"}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                                className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-[var(--text-secondary)] hover:text-white disabled:opacity-30 transition-colors"
                                            >
                                                <FaChevronRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>
        </>
    );
}
