"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaLock, FaClock, FaIdBadge, FaArrowRight, FaShieldAlt } from "react-icons/fa";
import type { MemberStatus } from "../contexts/AuthContext";

/**
 * Locked screen shown on members-only pages (Jobs) when the visitor
 * isn't an approved member yet. Jobs are private — every applicant is
 * reviewed and interviewed before their account is verified.
 */
export default function MembershipGate({
  status,
  onRegister,
}: {
  status: MemberStatus | null; // null = not signed in
  onRegister?: () => void;
}) {
  const config = (() => {
    if (!status) return {
      icon: <FaLock />, tone: "var(--primary)",
      title: "Members Only",
      body: "Our jobs are private. Create an account and apply to join our vetted talent network — we review every applicant personally.",
      action: onRegister
        ? <button onClick={onRegister} className="btn-primary px-7 py-3 text-sm">Create Account <FaArrowRight /></button>
        : <Link href="/apply" className="btn-primary px-7 py-3 text-sm">Apply to Join <FaArrowRight /></Link>,
    };
    if (status === "incomplete") return {
      icon: <FaIdBadge />, tone: "var(--primary)",
      title: "One Step to Unlock Jobs",
      body: "Complete your quick membership application — your details, skills and CV. We'll review it and get back to you within 7 days.",
      action: <Link href="/apply" className="btn-primary px-7 py-3 text-sm">Complete Application <FaArrowRight /></Link>,
    };
    if (status === "pending") return {
      icon: <FaClock />, tone: "#F59E0B",
      title: "Your Application Is Under Review",
      body: "Thanks for applying! We review every applicant personally and will contact you within 7 days to arrange a short interview. Once approved, jobs will unlock here.",
      action: <Link href="/dashboard" className="btn-secondary px-7 py-3 text-sm">Go to Dashboard</Link>,
    };
    return {
      icon: <FaShieldAlt />, tone: "#EF4444",
      title: "Membership Not Approved",
      body: "Thanks for your interest. We're not able to approve your membership at this time. Questions? Email info@eventopic.com.",
      action: <Link href="/" className="btn-secondary px-7 py-3 text-sm">Back to Home</Link>,
    };
  })();

  return (
    <section className="pt-28 pb-24 min-h-screen bg-[var(--background)]">
      <div className="container mx-auto px-5 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-sm p-8 md:p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl text-white mb-5 shadow-[var(--shadow-md)]" style={{ background: config.tone }}>
            {config.icon}
          </div>
          <h1 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-3">{config.title}</h1>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">{config.body}</p>
          {config.action}
        </motion.div>
      </div>
    </section>
  );
}
