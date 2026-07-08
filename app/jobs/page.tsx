// app/jobs/page.tsx
"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CursorGlow from "../../components/CursorGlow";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import AuthModal from "../../components/AuthModal";
import Link from "next/link";
import {
    FaBriefcase, FaClock, FaMapMarkerAlt,
    FaSearch, FaArrowRight, FaUsers, FaFilter,
    FaCheckCircle, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";

interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    duration: string;
    rate: number;
    paymentFrequency?: string;
    description: string;
    category: string;
    createdAt?: string;
    expiryDate?: string;
}

const CATEGORIES = [
    { value: "all", label: "All Jobs", emoji: "🎯" },
    { value: "staffing", label: "Staffing", emoji: "👥" },
    { value: "models_entertainment", label: "Models", emoji: "🎭" },
    { value: "promotions", label: "Promotions", emoji: "📢" },
    { value: "other", label: "Other", emoji: "✨" },
];

const JOBS_PER_PAGE = 8;

function CategoryBadge({ category }: { category: string }) {
    const cat = CATEGORIES.find(c => c.value === category) ?? CATEGORIES[4];
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20">
            {cat.emoji} {cat.label}
        </span>
    );
}

export default function JobsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [page, setPage] = useState(1);

    // Fetch jobs + user's existing applications
    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobSnap = await getDocs(collection(db, "jobs"));
                const jobList = jobSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    description: doc.data().description || "Join our professional team for part-time and short-term opportunities in the UAE.",
                } as Job));
                // Newest first: active jobs (not expired) on top, then by post date.
                const now = Date.now();
                const ts = (j: Job) => (j.createdAt ? new Date(j.createdAt).getTime() : 0);
                const isExpired = (j: Job) => !!j.expiryDate && new Date(j.expiryDate).getTime() < now;
                jobList.sort((a, b) => {
                    const ea = isExpired(a) ? 1 : 0, eb = isExpired(b) ? 1 : 0;
                    if (ea !== eb) return ea - eb;          // active before expired
                    return ts(b) - ts(a);                    // newest first
                });
                setJobs(jobList);

                // If logged in, fetch which jobs they've already applied to
                if (user?.email) {
                    const appsQ = query(
                        collection(db, "applications"),
                        where("userEmail", "==", user.email)
                    );
                    const appsSnap = await getDocs(appsQ);
                    const ids = new Set(appsSnap.docs.map(d => d.data().jobId as string));
                    setAppliedJobIds(ids);
                }
            } catch {
                toast.error("Failed to load jobs. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Filter jobs based on category + search, reset page on filter change
    const filteredJobs = useMemo(() => {
        let result = jobs;
        if (selectedCategory !== "all") result = result.filter(j => j.category === selectedCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(j =>
                j.title.toLowerCase().includes(q) ||
                j.description?.toLowerCase().includes(q) ||
                j.location.toLowerCase().includes(q)
            );
        }
        return result;
    }, [selectedCategory, searchQuery, jobs]);

    // Reset to page 1 when filter/search changes
    useEffect(() => { setPage(1); }, [selectedCategory, searchQuery]);

    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    const pagedJobs = filteredJobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);

    const counts: Record<string, number> = { all: jobs.length };
    CATEGORIES.slice(1).forEach(c => {
        counts[c.value] = jobs.filter(j => j.category === c.value).length;
    });

    const handleJobClick = (jobId: string) => {
        if (user) router.push(`/jobs/${jobId}`);
        else setIsAuthModalOpen(true);
    };

    // Skeleton cards (mirrors the real card layout)
    const Skeleton = () => (
        <div className="glass-card p-5 animate-pulse h-48">
            <div className="flex justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--surface-elevated)]" />
                <div className="w-20 h-6 rounded-full bg-[var(--surface-elevated)]" />
            </div>
            <div className="w-3/4 h-4 bg-[var(--surface-elevated)] rounded mb-3" />
            <div className="flex gap-1.5 mb-5">
                <div className="w-20 h-6 rounded-full bg-[var(--surface-elevated)]" />
                <div className="w-16 h-6 rounded-full bg-[var(--surface-elevated)]" />
            </div>
            <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                <div className="w-16 h-4 bg-[var(--surface-elevated)] rounded" />
                <div className="w-16 h-7 rounded-full bg-[var(--surface-elevated)]" />
            </div>
        </div>
    );

    return (
        <>
            <CursorGlow />
            <Navbar />

            {/* ── Hero ── */}
            <section className="pt-28 md:pt-32 pb-8 bg-[var(--background)] relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="hidden md:block absolute -top-10 right-1/3 w-[500px] h-[500px] bg-[var(--primary)]/6 rounded-full blur-[120px]" />
                    <div className="hidden md:block absolute bottom-0 left-0 w-[350px] h-[350px] bg-[var(--secondary)]/6 rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-5 max-w-5xl relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                        {/* Live pill */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-[var(--border)] mb-4 text-xs md:text-sm font-bold text-[var(--primary)]">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            {jobs.length} Live Opportunities
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold font-display gradient-text mb-2 leading-tight">
                            Find Your Next Role
                        </h1>
                        <p className="text-sm md:text-base text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                            Part-time and event roles with the UAE&apos;s top brands. Apply in minutes.
                        </p>

                        {/* Search bar */}
                        <div className="max-w-2xl mx-auto relative group">
                            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors text-base z-10" />
                            <input
                                type="text"
                                placeholder="Search role, location or keyword…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="modern-input pl-12 pr-12 py-3.5 text-sm shadow-xl w-full"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-muted)] transition-all z-10"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Sticky category filter ── */}
            <div className="sticky top-[64px] z-40 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)] py-2.5">
                <div className="container mx-auto px-5 max-w-5xl flex items-center gap-2.5 overflow-x-auto scrollbar-none">
                    <FaFilter className="text-[var(--text-muted)] shrink-0 text-xs" />
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCategory === cat.value
                                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-md"
                                    : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                }`}
                        >
                            {cat.emoji} {cat.label}
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${selectedCategory === cat.value ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--text-muted)]"
                                }`}>
                                {counts[cat.value] ?? 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Jobs grid ── */}
            <section className="py-10 bg-[var(--background)]">
                <div className="container mx-auto px-5 max-w-5xl">

                    {/* Results count */}
                    {!isLoading && (
                        <p className="text-sm text-[var(--text-muted)] mb-5">
                            {filteredJobs.length === 0 ? "No jobs found" : `Showing ${(page - 1) * JOBS_PER_PAGE + 1}–${Math.min(page * JOBS_PER_PAGE, filteredJobs.length)} of ${filteredJobs.length} jobs`}
                        </p>
                    )}

                    {isLoading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
                        </div>
                    ) : pagedJobs.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold mb-2">No jobs found</h3>
                            <p className="text-[var(--text-secondary)] text-sm">Try a different search or category</p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                                className="btn-secondary mt-4 px-6 py-2 text-sm"
                            >
                                Clear filters
                            </button>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${selectedCategory}-${searchQuery}-${page}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {pagedJobs.map((job, i) => {
                                    const applied = appliedJobIds.has(job.id);
                                    const isNew = job.createdAt
                                        ? (Date.now() - new Date(job.createdAt).getTime()) < 7 * 864e5
                                        : false;
                                    return (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: i * 0.04 }}
                                            whileHover={{ y: -4 }}
                                            className="group cursor-pointer"
                                            onClick={() => handleJobClick(job.id)}
                                        >
                                            <div className={`glass-card p-5 h-full flex flex-col relative overflow-hidden transition-all border ${applied
                                                    ? "border-green-500/30 bg-green-500/3"
                                                    : "border-transparent group-hover:border-[var(--primary)]/30 group-hover:shadow-lg group-hover:shadow-[var(--primary)]/5"
                                                }`}>

                                                {/* Top row */}
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="relative w-11 h-11 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center text-white text-base shrink-0 group-hover:scale-110 transition-transform shadow-[var(--shadow-sm)]">
                                                        <FaBriefcase />
                                                        {isNew && !applied && (
                                                            <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full shadow-sm">New</span>
                                                        )}
                                                    </div>
                                                    {applied ? (
                                                        <span className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-500 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                            <FaCheckCircle className="text-[9px]" /> Applied
                                                        </span>
                                                    ) : (
                                                        <CategoryBadge category={job.category} />
                                                    )}
                                                </div>

                                                <h3 className="font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--primary)] transition-colors line-clamp-1 mb-3">
                                                    {job.title}
                                                </h3>

                                                {/* Meta chips */}
                                                <div className="flex flex-wrap gap-1.5 mb-4 flex-1 content-start">
                                                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 py-1 rounded-full">
                                                        <FaMapMarkerAlt className="text-[var(--accent)] text-[9px] shrink-0" />
                                                        {job.location}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 py-1 rounded-full">
                                                        <FaClock className="text-[9px] shrink-0" />
                                                        {job.type}
                                                    </span>
                                                    {job.duration && (
                                                        <span className="text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 py-1 rounded-full">
                                                            {job.duration}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-3.5 border-t border-[var(--border)]">
                                                    <div className="font-black text-[var(--primary)] text-base leading-none">
                                                        AED {job.rate}
                                                        <span className="text-[10px] font-medium text-[var(--text-muted)] ml-1">
                                                            /{job.paymentFrequency
                                                                ? job.paymentFrequency.charAt(0).toUpperCase() + job.paymentFrequency.slice(1)
                                                                : "Day"}
                                                        </span>
                                                    </div>
                                                    <span className={`flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full transition-all ${applied
                                                            ? "text-green-500 bg-green-500/10"
                                                            : "text-white bg-[image:var(--gradient-primary)] shadow-[var(--shadow-sm)] group-hover:shadow-[var(--shadow-md)] group-hover:gap-2.5"
                                                        }`}>
                                                        {applied ? (
                                                            <><FaCheckCircle className="text-[10px]" /> View</>
                                                        ) : (
                                                            <>Apply <FaArrowRight className="text-[9px]" /></>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* ── Pagination ── */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-10">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-9 h-9 flex items-center justify-center rounded-lg glass-card text-[var(--text-secondary)] hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === page
                                            ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-md"
                                            : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-9 h-9 flex items-center justify-center rounded-lg glass-card text-[var(--text-secondary)] hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    )}

                    {/* ── Bottom CTA ── */}
                    {!isLoading && filteredJobs.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-14 glass-card p-9 text-center max-w-xl mx-auto"
                        >
                            <FaUsers className="text-3xl text-[var(--primary)] mx-auto mb-3" />
                            <h3 className="text-xl font-bold mb-2">Don't see the right role?</h3>
                            <p className="text-[var(--text-secondary)] text-sm mb-5">
                                Complete your profile and we'll reach out when a matching opportunity opens up.
                            </p>
                            {user ? (
                                <Link href="/profile" className="btn-primary px-8 py-2.5 inline-flex items-center gap-2 text-sm">
                                    Complete Profile <FaArrowRight />
                                </Link>
                            ) : (
                                <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary px-8 py-2.5 inline-flex items-center gap-2 text-sm">
                                    Join Talent Pool <FaArrowRight />
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>
            </section>

            <Footer />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode="signin" />
        </>
    );
}
