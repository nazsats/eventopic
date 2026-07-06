// app/jobs/[jobId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import {
    doc, getDoc, collection, getDocs, query,
    where, addDoc, limit
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import AuthModal from "../../../components/AuthModal";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import {
    FaBriefcase, FaMapMarkerAlt, FaClock,
    FaCheckCircle, FaUser, FaPaperPlane, FaArrowLeft,
    FaShieldAlt, FaTrophy, FaStar, FaLock, FaPhone,
    FaEnvelope, FaCalendarAlt, FaCommentAlt,
} from "react-icons/fa";

interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    duration: string;
    rate: number;
    paymentFrequency?: string;
    description?: string;
    summary?: string;
    category: string;
    requirements?: string[];
    benefits?: string[];
}

interface RelatedJob {
    id: string;
    title: string;
    rate: number;
    location: string;
}

const DEFAULT_REQUIREMENTS = [
    "Valid UAE residence or work permit",
    "Professional appearance and a positive attitude",
    "Excellent communication skills",
    "Punctual and reliable",
    "Team player with high energy",
];

const DEFAULT_BENEFITS = [
    "Competitive daily rate",
    "Flexible working hours",
    "Career growth opportunities",
    "Networking at premium events",
];

export default function JobDetailPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { jobId } = useParams();

    const [job, setJob] = useState<Job | null>(null);
    const [relatedJobs, setRelatedJobs] = useState<RelatedJob[]>([]);
    const [alreadyApplied, setAlreadyApplied] = useState<string | null>(null); // status string if applied
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        mobile: "",
        availability: "",
        whyYou: "",
    });

    // Progress: count non-empty required fields
    const requiredFields: (keyof typeof form)[] = ["name", "email", "mobile", "availability", "whyYou"];
    const progress = Math.round((requiredFields.filter(f => form[f]).length / requiredFields.length) * 100);

    useEffect(() => {
        const load = async () => {
            if (typeof jobId !== "string") return;
            try {
                const jobDoc = await getDoc(doc(db, "jobs", jobId));
                if (!jobDoc.exists()) {
                    toast.error("Job not found.");
                    router.push("/jobs");
                    return;
                }
                const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
                setJob(jobData);

                // Related jobs
                const relq = query(collection(db, "jobs"), where("category", "==", jobData.category), limit(4));
                const relSnap = await getDocs(relq);
                setRelatedJobs(
                    relSnap.docs.filter(d => d.id !== jobId).slice(0, 3)
                        .map(d => ({ id: d.id, ...d.data() } as RelatedJob))
                );

                // Auto-fill from profile
                if (user) {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const p = userDoc.data();
                        setForm(prev => ({
                            ...prev,
                            name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || user.displayName || "",
                            email: user.email || "",
                            mobile: p.phoneNumber || "",
                        }));
                    } else {
                        setForm(prev => ({ ...prev, name: user.displayName || "", email: user.email || "" }));
                    }

                    // Check existing application
                    const appsQ = query(
                        collection(db, "applications"),
                        where("userEmail", "==", user.email),
                        where("jobId", "==", jobId)
                    );
                    const appsSnap = await getDocs(appsQ);
                    if (!appsSnap.empty) {
                        setAlreadyApplied(appsSnap.docs[0].data().status);
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load job details.");
            }
        };
        load();
    }, [jobId, user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { setIsAuthModalOpen(true); return; }

        const errors: string[] = [];
        if (!form.name.trim()) errors.push("Full name is required");
        if (!form.email.trim()) errors.push("Email is required");
        if (!form.mobile.trim()) errors.push("Mobile number is required");
        if (!form.availability) errors.push("Availability is required");
        if (!form.whyYou.trim() || form.whyYou.length < 30)
            errors.push("Please write at least 30 characters about why you're a good fit");

        if (errors.length) {
            toast.error(errors[0]);
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "applications"), {
                userEmail: user.email,
                userId: user.uid,
                jobId,
                jobTitle: job?.title,
                ...form,
                timestamp: new Date().toISOString(),
                status: "pending",
            });
            setAlreadyApplied("pending");
            setSubmitted(true);
            setShowConfetti(true);
            toast.success("Application submitted! 🎉");
            setTimeout(() => setShowConfetti(false), 5000);
        } catch (err) {
            console.error(err);
            toast.error("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ---------- Loading / auth gates ----------
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-[var(--primary)]" />
            </div>
        );
    }

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
                    <div className="glass-card p-10 max-w-sm w-full text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] text-2xl mx-auto mb-5">
                            <FaLock />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Sign in to Apply</h2>
                        <p className="text-[var(--text-secondary)] mb-6 text-sm">Create a free account to view and apply for this job.</p>
                        <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary w-full py-3">
                            Sign In / Register
                        </button>
                    </div>
                </div>
                <Footer />
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode="signin" />
            </>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-[var(--primary)]" />
            </div>
        );
    }

    return (
        <>
            <Navbar />
            {/* JobPosting structured data — Google Jobs eligibility */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "JobPosting",
                        title: job.title,
                        description: job.summary || job.description || `${job.title} — staffing role in ${job.location}, UAE.`,
                        datePosted: new Date().toISOString().split("T")[0],
                        validThrough: new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0],
                        employmentType: ({ "Full-time": "FULL_TIME", "Part-time": "PART_TIME", "Freelance": "CONTRACTOR", "Contract": "CONTRACTOR", "Temporary": "TEMPORARY", "One-time Event": "TEMPORARY" } as Record<string, string>)[job.type] || "OTHER",
                        hiringOrganization: { "@type": "Organization", name: "Eventopic", sameAs: "https://eventopic.com" },
                        jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location, addressRegion: job.location, addressCountry: "AE" } },
                        baseSalary: { "@type": "MonetaryAmount", currency: "AED", value: { "@type": "QuantitativeValue", value: job.rate, unitText: ({ hourly: "HOUR", daily: "DAY", weekly: "WEEK", monthly: "MONTH", annual: "YEAR" } as Record<string, string>)[(job.paymentFrequency || "daily").toLowerCase()] || "DAY" } },
                    }),
                }}
            />
            {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

            <section className="pt-28 pb-20 bg-[var(--background)] min-h-screen relative overflow-hidden">
                {/* BG orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-[var(--secondary)]/5 rounded-full blur-[80px]" />
                </div>

                <div className="container mx-auto px-5 max-w-6xl relative z-10">

                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors font-medium">
                            <FaArrowLeft className="text-xs" /> Back to Jobs
                        </Link>
                    </div>

                    {/* Page header — banner card */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
                        <div className="relative rounded-sm overflow-hidden p-6 md:p-8 bg-[image:var(--gradient-royal)]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.25),transparent_55%)] pointer-events-none" />
                            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                                <div className="min-w-0">
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white/80 bg-white/15 border border-white/20 px-2.5 py-1 rounded-full mb-3">
                                        {job.category === "staffing" ? "Staffing" :
                                            job.category === "models_entertainment" ? "Models" :
                                                job.category === "promotions" ? "Promotions" : "Other"}
                                    </span>
                                    <h1 className="text-2xl md:text-4xl font-bold font-display text-white leading-tight mb-3">
                                        {job.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="flex items-center gap-1.5 text-xs text-white/90 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
                                            <FaMapMarkerAlt className="text-[10px]" /> {job.location}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-white/90 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
                                            <FaClock className="text-[10px]" /> {job.type}{job.duration ? ` · ${job.duration}` : ""}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 text-left md:text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Pay rate</p>
                                    <p className="font-display font-black text-3xl md:text-4xl text-white leading-none">
                                        AED {job.rate}
                                        <span className="text-sm font-medium text-white/70 ml-1.5">
                                            /{job.paymentFrequency
                                                ? job.paymentFrequency.charAt(0).toUpperCase() + job.paymentFrequency.slice(1)
                                                : "Day"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main 2-col layout */}
                    <div className="grid lg:grid-cols-5 gap-8">

                        {/* LEFT: Job details */}
                        <div className="lg:col-span-3 space-y-6">

                            {/* Description */}
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-7">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <FaBriefcase className="text-[var(--primary)]" /> About This Role
                                </h2>
                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                    {job.summary || job.description || "Join our professional team for part-time and short-term opportunities in the UAE."}
                                </p>
                            </motion.div>

                            {/* Requirements */}
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-7">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <FaShieldAlt className="text-[var(--secondary)]" /> Requirements
                                </h2>
                                <ul className="space-y-2.5">
                                    {(job.requirements && job.requirements.length > 0 ? job.requirements : DEFAULT_REQUIREMENTS).map((req, i) => (
                                        <li key={i} className="flex items-start gap-3 text-[var(--text-secondary)] text-sm">
                                            <FaCheckCircle className="text-[var(--primary)] mt-0.5 shrink-0" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Benefits */}
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-7">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <FaTrophy className="text-[var(--accent)]" /> What You Get
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {(job.benefits && job.benefits.length > 0 ? job.benefits : DEFAULT_BENEFITS).map((b, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5 rounded-xl">
                                            <FaStar className="text-[var(--accent)] shrink-0 text-xs" />
                                            {b}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Related jobs */}
                            {relatedJobs.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-7">
                                    <h2 className="font-bold text-xl mb-4">Similar Roles</h2>
                                    <div className="space-y-3">
                                        {relatedJobs.map(rj => (
                                            <Link key={rj.id} href={`/jobs/${rj.id}`}
                                                className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/40 transition-all group">
                                                <span className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors">{rj.title}</span>
                                                <span className="text-sm font-bold text-[var(--accent)]">AED {rj.rate}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* RIGHT: Apply form (sticky) */}
                        <div className="lg:col-span-2" id="apply">
                            <div className="lg:sticky lg:top-28 scroll-mt-24">
                                <AnimatePresence mode="wait">
                                    {submitted || alreadyApplied ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="glass-card p-8 text-center"
                                        >
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                                                <FaCheckCircle className="text-5xl text-green-400 mx-auto mb-4" />
                                            </motion.div>
                                            <h3 className="text-2xl font-bold mb-2">Application Sent!</h3>
                                            <p className="text-[var(--text-secondary)] text-sm mb-2">
                                                Status: <span className="font-bold capitalize text-[var(--primary)]">{alreadyApplied}</span>
                                            </p>
                                            <p className="text-[var(--text-secondary)] text-sm mb-6">
                                                We'll review your application and get back to you within a few business days.
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                <Link href="/dashboard" className="btn-primary w-full py-2.5 text-sm text-center">
                                                    Track in Dashboard
                                                </Link>
                                                <Link href="/jobs" className="btn-secondary w-full py-2.5 text-sm text-center">
                                                    Browse More Jobs
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-7">
                                            {/* Header + progress */}
                                            <div className="mb-6">
                                                <h2 className="font-bold text-xl">Apply Now</h2>
                                                <p className="text-[var(--text-secondary)] text-sm mt-1">Fill in the form below and submit — takes under 2 minutes.</p>
                                                <div className="mt-4">
                                                    <div className="flex justify-between text-xs font-bold mb-1">
                                                        <span className="text-[var(--text-muted)]">Form completion</span>
                                                        <span className="text-[var(--primary)]">{progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
                                                            animate={{ width: `${progress}%` }}
                                                            transition={{ duration: 0.4 }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                {/* Name */}
                                                <div>
                                                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                                                        Full Name <span className="text-red-400">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
                                                        <input name="name" value={form.name} onChange={handleChange}
                                                            className="modern-input pl-10 py-2.5 text-sm" placeholder="Your full name" required />
                                                    </div>
                                                </div>

                                                {/* Email */}
                                                <div>
                                                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                                                        Email <span className="text-red-400">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
                                                        <input name="email" type="email" value={form.email} onChange={handleChange}
                                                            className="modern-input pl-10 py-2.5 text-sm" placeholder="you@email.com" required />
                                                    </div>
                                                </div>

                                                {/* Mobile + Availability side by side */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                                                            Mobile <span className="text-red-400">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
                                                            <input name="mobile" type="tel" value={form.mobile} onChange={handleChange}
                                                                className="modern-input pl-10 py-2.5 text-sm" placeholder="+971 5x xxx xxxx" required />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                                                            Available from <span className="text-red-400">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
                                                            <input name="availability" type="date" value={form.availability} onChange={handleChange}
                                                                className="modern-input pl-10 py-2.5 text-sm" required />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Why you */}
                                                <div>
                                                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                                                        Why are you a good fit? <span className="text-red-400">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <FaCommentAlt className="absolute left-3.5 top-3.5 text-[var(--text-muted)] text-sm" />
                                                        <textarea name="whyYou" value={form.whyYou} onChange={handleChange}
                                                            rows={3} className="modern-input pl-10 py-2.5 text-sm resize-none"
                                                            placeholder="A couple of lines about your experience and energy…" required />
                                                    </div>
                                                    <p className={`text-xs mt-1 ${form.whyYou.length >= 30 ? "text-green-500" : "text-[var(--text-muted)]"}`}>
                                                        {form.whyYou.length >= 30 ? "✓ Looks good" : `${form.whyYou.length}/30 characters minimum`}
                                                    </p>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base font-bold disabled:opacity-60 mt-2"
                                                >
                                                    {isSubmitting ? (
                                                        <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                                                    ) : (
                                                        <>
                                                            <FaPaperPlane /> Submit Application
                                                        </>
                                                    )}
                                                </button>

                                                <p className="text-xs text-[var(--text-muted)] text-center mt-1">
                                                    Your info is auto-filled from your profile and kept private.
                                                </p>
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Mobile sticky apply bar */}
            {!submitted && !alreadyApplied && (
                <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--border)] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-[var(--primary)] text-base leading-none">
                            AED {job.rate}
                            <span className="text-[10px] font-medium text-[var(--text-muted)] ml-1">
                                /{job.paymentFrequency ? job.paymentFrequency.charAt(0).toUpperCase() + job.paymentFrequency.slice(1) : "Day"}
                            </span>
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">{job.location} · {job.type}</p>
                    </div>
                    <a href="#apply" className="btn-primary px-6 py-2.5 text-sm shrink-0 rounded-full">
                        Apply Now
                    </a>
                </div>
            )}

            <Footer />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode="signin" />
        </>
    );
}
