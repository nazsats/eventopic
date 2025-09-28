//app/portal/page.tsx
"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion, Variants } from "framer-motion";
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

  if (loading) return <div className="py-20 text-center flex items-center justify-center min-h-screen font-body text-[var(--text-body)]" style={{ backgroundColor: "var(--secondary)" }}>Loading...</div>;
  if (!user) return null;

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 10 } },
  };

  const containerVariants: Variants = {
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", stiffness: 100 } },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 80 } },
    hover: {
      scale: 1.1,
      y: -5,
      boxShadow: "0 8px 24px rgba(0, 196, 180, 0.4)",
      backgroundColor: "var(--teal-accent)",
      borderColor: "var(--teal-accent)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <Navbar />
      <section className="py-24 min-h-screen relative" style={{ backgroundColor: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl font-bold text-center mb-16 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Welcome to Eventopic Portal
          </motion.h1>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              {
                icon: <FaClipboardList />,
                title: "Client Inquiries",
                desc: "Submit or view your event requests.",
                link: "/portal/inquiries",
                label: "Coming soon",
              },
              {
                icon: <FaUserTie />,
                title: "Apply Jobs",
                desc: "Browse and apply for roles or track applications.",
                link: "/portal/applications",
                label: "Browse Jobs",
              },
              {
                icon: <FaTachometerAlt />,
                title: "Dashboard",
                desc: "View your profile details.",
                link: "/dashboard",
                label: "View Dashboard",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -10, scale: 1.05 }}
                className="card p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border max-w-sm mx-auto bg-[var(--primary)]/80 backdrop-blur-sm relative overflow-hidden group"
                style={{ borderColor: "var(--light)/30" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--teal-accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex justify-center items-center h-16 w-16 mx-auto mb-6 relative z-10">
                  <div className="text-5xl text-[var(--color-accent)]">{item.icon}</div>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 font-heading text-center text-[var(--text-accent)] relative z-10">
                  {item.title}
                </h2>
                <p className="text-lg leading-relaxed font-body text-center text-[var(--text-body)] relative z-10">
                  {item.desc}
                </p>
                <motion.div
                  variants={buttonVariants}
                  className="mt-6 text-center group relative"
                >
                  <Link
                    href={item.link}
                    className="px-10 py-4 rounded-full text-xl font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block focus:ring-4 focus:ring-[var(--teal-accent)]/50 relative z-10"
                    style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                    aria-label={item.label}
                  >
                    {item.label}
                    <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}
