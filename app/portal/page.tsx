"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaClipboardList, FaUserTie, FaTachometerAlt } from "react-icons/fa";

export default function Portal() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?mode=signin");
    }
  }, [user, loading, router]);

  if (loading) return <div className="py-20 text-center flex items-center justify-center min-h-screen" style={{ color: "var(--white)" }}>Loading...</div>;
  if (!user) return null;

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
            Welcome to Eventopic Portal, {user.email}!
          </motion.h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              className="card p-8 rounded-2xl shadow-2xl text-center border border-[var(--accent)]/30 bg-[var(--primary)]/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
            >
              <FaClipboardList className="text-4xl mx-auto mb-4" style={{ color: "var(--color-accent)" }} />
              <h2 className="text-2xl font-semibold mb-4 font-heading" style={{ color: "var(--white)" }}>Client Inquiries</h2>
              <p style={{ color: "var(--light)" }}>Submit or view your event requests.</p>
              <Link href="/portal/inquiries" className="mt-4 inline-block px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}>
                Manage Inquiries
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="card p-8 rounded-2xl shadow-2xl text-center border border-[var(--accent)]/30 bg-[var(--primary)]/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
            >
              <FaUserTie className="text-4xl mx-auto mb-4" style={{ color: "var(--color-accent)" }} />
              <h2 className="text-2xl font-semibold mb-4 font-heading" style={{ color: "var(--white)" }}>Staff Applications</h2>
              <p style={{ color: "var(--light)" }}>Apply for roles or track applications.</p>
              <Link href="/portal/applications" className="mt-4 inline-block px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}>
                Manage Applications
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
              className="card p-8 rounded-2xl shadow-2xl text-center border border-[var(--accent)]/30 bg-[var(--primary)]/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
            >
              <FaTachometerAlt className="text-4xl mx-auto mb-4" style={{ color: "var(--color-accent)" }} />
              <h2 className="text-2xl font-semibold mb-4 font-heading" style={{ color: "var(--white)" }}>Dashboard</h2>
              <p style={{ color: "var(--light)" }}>View your profile details.</p>
              <Link href="/dashboard" className="mt-4 inline-block px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}>
                View Dashboard
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
