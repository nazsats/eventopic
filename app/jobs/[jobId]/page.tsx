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
    FaBriefcase, FaMapMarkerAlt, FaClock, FaMoneyBillWave,
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
        whatsapp: "",
        availability: "",
        experience: "",
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
                            whatsapp: p.whatsappNumber || p.phoneNumber || "",
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
            {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

            <section className="pt-28 pb-20 bg-[var(--background)] min-h-screen relative overflow-hidden">
                {/* BG orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-[var(--secondary)]/5 rounded-full blur-[80px]" />
                </div>

                <div className="container mx-auto px-4 max-w-6xl relative z-10">

                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors font-medium">
                            <FaArrowLeft className="text-xs" /> Back to Jobs
                        </Link>
                    </div>

                    {/* Page header */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2 block">
                                    {job.category === "staffing" ? "Staffing" :
                                        job.category === "models_entertainment" ? "Entertainment" :
                                            job.category === "promotions" ? "Promotions" : "Other"}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--text-primary)] leading-tight">
                                    {job.title}
                                </h1>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <div className="glass-card px-4 py-2 text-sm flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-[var(--accent)] text-xs" />
                                    {job.location}
                                </div>
                                <div className="glass-card px-4 py-2 text-sm flex items-center gap-2">
                                    <FaClock className="text-xs" />
                                    {job.type} · {job.duration}
                                </div>
                                <div className="glass-card px-4 py-2 font-black text-[var(--accent)] flex items-center gap-2">
                                    <FaMoneyBillWave className="text-sm" />
                                    AED {job.rate}
                                    <span className="text-xs font-normal text-[var(--text-secondary)]">
                                        / {job.paymentFrequency
                                            ? job.paymentFrequency.charAt(0).toUpperCase() + job.paymentFrequency.slice(1)
                                            : "Day"}
                                    </span>
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
                                    {job.summary || job.description || "Join our professional team for exciting event opportunities in Dubai."}
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
                        <div className="lg:col-span-2">
                            <div className="lg:sticky lg:top-28">
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

                                                {/* Mobile + WhatsApp side by side */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                                                            Mobile <span className="text-red-400">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
                                                            <input name="mobile" value={form.mobile} onChange={handleChange}
                                                                className="modern-input pl-10 py-2.5 text-sm" placeholder="05xxxxxxxx" required />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">WhatsApp</label>
                                                        <div className="relative">
                                                            <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
                                                            <input name="whatsapp" value={form.whatsapp} onChange={handleChange}
                                                                className="modern-input pl-10 py-2.5 text-sm" placeholder="Same as mobile?" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Availability */}
                                                <div>
                                                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                                                        Available From <span className="text-red-400">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
                                                        <input name="availability" type="date" value={form.availability} onChange={handleChange}
                                                            className="modern-input pl-10 py-2.5 text-sm" required />
                                                    </div>
                                                </div>

                                                {/* Experience */}
                                                <div>
                                                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                                                        Relevant Experience
                                                    </label>
                                                    <input name="experience" value={form.experience} onChange={handleChange}
                                                        className="modern-input py-2.5 text-sm"
                                                        placeholder="e.g. 2 years event hosting" />
                                                </div>

                                                {/* Why you */}
                                                <div>
                                                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                                                        Why are you a good fit? <span className="text-red-400">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <FaCommentAlt className="absolute left-3.5 top-3.5 text-[var(--text-muted)] text-sm" />
                                                        <textarea name="whyYou" value={form.whyYou} onChange={handleChange}
                                                            rows={4} className="modern-input pl-10 py-2.5 text-sm resize-none"
                                                            placeholder="Tell us what makes you the right person for this role…" required />
                                                    </div>
                                                    <p className="text-xs text-[var(--text-muted)] mt-1">{form.whyYou.length} / 30 min chars</p>
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

            <Footer />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode="signin" />
        </>
    );
}
