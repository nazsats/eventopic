"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaUser, FaPhone, FaStar, FaFileAlt, FaCamera, FaCheckCircle,
  FaArrowRight, FaSpinner, FaShieldAlt, FaClock, FaTrash,
} from "react-icons/fa";

export default function ApplyPage() {
  const { user, loading, memberStatus, refreshMemberStatus } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", skills: "", about: "" });
  const [resumeUrl, setResumeUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState<"cv" | "photo" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Prefill from any existing data
  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const p = snap.data();
        setForm(f => ({
          ...f,
          firstName: p.firstName || (user.displayName?.split(" ")[0] ?? ""),
          lastName: p.lastName || (user.displayName?.split(" ").slice(1).join(" ") ?? ""),
          phone: p.phoneNumber || "",
          skills: Array.isArray(p.skills) ? p.skills.join(", ") : (p.skills || ""),
          about: p.introduction || "",
        }));
        if (p.resumeUrl) setResumeUrl(p.resumeUrl);
        if (p.profileImageUrl) setPhotoUrl(p.profileImageUrl);
      }
    })();
  }, [user]);

  const compress = (file: File, maxW = 900, q = 0.8): Promise<Blob> =>
    new Promise((res, rej) => {
      const img = new window.Image(); const url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, maxW / img.width);
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        cv.toBlob(b => (b ? res(b) : rej(new Error("fail"))), "image/jpeg", q);
      };
      img.onerror = rej; img.src = url;
    });

  const upload = async (kind: "cv" | "photo", file?: File) => {
    if (!file) return;
    setUploading(kind);
    try {
      const fd = new FormData();
      if (kind === "photo") fd.append("file", await compress(file), "photo.jpg");
      else fd.append("file", file);
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (preset) fd.append("upload_preset", preset);
      fd.append("folder", "eventopic/applications");
      const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloud) throw new Error("Cloudinary not configured");
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, fd);
      if (kind === "photo") setPhotoUrl(res.data.secure_url); else setResumeUrl(res.data.secure_url);
      toast.success(`${kind === "cv" ? "CV" : "Photo"} uploaded`);
    } catch (e) {
      console.error(e); toast.error("Upload failed. Please try again.");
    } finally { setUploading(null); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.firstName.trim()) return toast.error("Please enter your full name.");
    if (!/^\+?[\d\s\-()]{7,16}$/.test(form.phone.trim())) return toast.error("Please enter a valid phone number.");
    if (!form.skills.trim()) return toast.error("Please add a few of your skills.");
    if (!resumeUrl) return toast.error("Please upload your CV.");
    if (!photoUrl) return toast.error("Please upload a profile photo.");
    setSubmitting(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phone.trim(),
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        introduction: form.about.trim(),
        resumeUrl,
        profileImageUrl: photoUrl,
        profilePhotos: [photoUrl],
        isProfileComplete: true,
        membershipStatus: "pending",
        appliedAt: new Date().toISOString(),
      }, { merge: true });
      await refreshMemberStatus();
      setJustSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err); toast.error("Couldn't submit. Please try again.");
    } finally { setSubmitting(false); }
  };

  // ── Gates ──
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--background)]"><FaSpinner className="animate-spin text-2xl text-[var(--primary)]" /></div>;
  }
  if (!user) {
    return (
      <div className="bg-[var(--background)] min-h-screen"><Navbar />
        <div className="pt-32 pb-24 text-center px-5">
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">Create an account to apply</h1>
          <p className="text-[var(--text-secondary)] text-sm mb-6">Sign up first, then complete your membership application.</p>
          <Link href="/" className="btn-primary px-7 py-3 text-sm">Go to Home</Link>
        </div><Footer />
      </div>
    );
  }

  const status = justSubmitted ? "pending" : memberStatus;

  // Already submitted / decided → show status, not the form
  if (status === "pending" || status === "approved" || status === "rejected") {
    const meta = {
      pending: { icon: <FaClock />, color: "amber", title: "Application under review", body: "Thanks for applying! Our team reviews every applicant personally. We'll contact you within 7 days to arrange a short interview.", cta: null as React.ReactNode },
      approved: { icon: <FaCheckCircle />, color: "green", title: "You're a Verified Member 🎉", body: "Your application has been approved. You can now browse and apply to live jobs.", cta: <Link href="/jobs" className="btn-primary px-7 py-3 text-sm">Browse Jobs <FaArrowRight /></Link> },
      rejected: { icon: <FaShieldAlt />, color: "red", title: "Application not approved", body: "Thanks for your interest. Unfortunately we're not able to approve your membership at this time. You're welcome to reach out at info@eventopic.com.", cta: null },
    }[status]!;
    const ring = status === "approved" ? "var(--primary)" : status === "pending" ? "#F59E0B" : "#EF4444";
    return (
      <div className="bg-[var(--background)] min-h-screen"><Navbar />
        <section className="pt-28 pb-24">
          <div className="container mx-auto px-5 max-w-lg">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-sm p-8 md:p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl text-white mb-5 shadow-[var(--shadow-md)]" style={{ background: ring }}>
                {meta.icon}
              </div>
              <h1 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-3">{meta.title}</h1>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">{meta.body}</p>
              {meta.cta ?? <Link href="/dashboard" className="btn-secondary px-7 py-3 text-sm">Go to Dashboard</Link>}
            </motion.div>
          </div>
        </section><Footer />
      </div>
    );
  }

  // ── Application form (status: incomplete) ──
  const LABEL = "flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1.5";
  const INPUT = "w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-muted)] transition-all";

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <Navbar />
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-5 max-w-2xl">
          <div className="text-center mb-7">
            <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2">Membership Application</p>
            <h1 className="text-3xl md:text-4xl font-display font-black text-[var(--text-primary)] mb-3">Join Our Talent Network</h1>
            <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed">
              We keep our network high-quality by reviewing every applicant. Fill this in and we&apos;ll
              contact you within 7 days for a short interview.
            </p>
          </div>

          <motion.form initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit}
            className="glass-card rounded-sm p-6 md:p-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL}><FaUser className="text-[var(--primary)] text-[10px]" /> First name *</label>
                <input className={INPUT} placeholder="Your first name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div>
                <label className={LABEL}><FaUser className="text-[var(--primary)] text-[10px]" /> Last name</label>
                <input className={INPUT} placeholder="Your last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={LABEL}><FaPhone className="text-[var(--primary)] text-[10px]" /> Phone / WhatsApp *</label>
              <input type="tel" className={INPUT} placeholder="+971 5x xxx xxxx" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className={LABEL}><FaStar className="text-[var(--primary)] text-[10px]" /> Your skills *</label>
              <input className={INPUT} placeholder="e.g. Hostess, Arabic speaker, Promoter, Registration" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} required />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Separate with commas.</p>
            </div>
            <div>
              <label className={LABEL}><FaFileAlt className="text-[var(--primary)] text-[10px]" /> A little about you</label>
              <textarea rows={3} className={`${INPUT} resize-none`} placeholder="Experience, languages, availability…" value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} />
            </div>

            {/* Uploads */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* CV */}
              <div>
                <label className={LABEL}><FaFileAlt className="text-[var(--primary)] text-[10px]" /> Upload CV *</label>
                <label className={`flex items-center justify-center gap-2 h-[46px] rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm font-semibold ${resumeUrl ? "border-[var(--primary)]/40 bg-[var(--primary-muted)] text-[var(--primary)]" : "border-[var(--border)] hover:border-[var(--primary)]/50 text-[var(--text-secondary)]"}`}>
                  {uploading === "cv" ? <FaSpinner className="animate-spin" /> : resumeUrl ? <><FaCheckCircle /> CV added</> : <><FaFileAlt /> Choose file</>}
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" disabled={uploading === "cv"} onChange={e => upload("cv", e.target.files?.[0])} />
                </label>
                {resumeUrl && <button type="button" onClick={() => setResumeUrl("")} className="text-[10px] text-[var(--text-muted)] hover:text-red-500 mt-1 flex items-center gap-1"><FaTrash className="text-[8px]" /> Remove</button>}
              </div>
              {/* Photo */}
              <div>
                <label className={LABEL}><FaCamera className="text-[var(--primary)] text-[10px]" /> Profile photo *</label>
                <label className="relative flex items-center justify-center h-[46px] rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-all text-sm font-semibold border-[var(--border)] hover:border-[var(--primary)]/50 text-[var(--text-secondary)]">
                  {uploading === "photo" ? <FaSpinner className="animate-spin" /> : photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : <span className="flex items-center gap-2"><FaCamera /> Choose photo</span>}
                  <input type="file" accept="image/jpeg,image/png" className="hidden" disabled={uploading === "photo"} onChange={e => upload("photo", e.target.files?.[0])} />
                </label>
                {photoUrl && <button type="button" onClick={() => setPhotoUrl("")} className="text-[10px] text-[var(--text-muted)] hover:text-red-500 mt-1 flex items-center gap-1"><FaTrash className="text-[8px]" /> Remove</button>}
              </div>
            </div>

            <p className="flex items-start gap-1.5 text-[11px] text-[var(--text-muted)] leading-relaxed">
              <FaShieldAlt className="text-[9px] mt-0.5 shrink-0 text-[var(--primary)]" />
              Your CV and photo are stored securely and used only for recruitment and client selection, per our Privacy Policy.
            </p>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? <FaSpinner className="animate-spin" /> : <>Submit Application <FaArrowRight className="text-xs" /></>}
            </button>
          </motion.form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
