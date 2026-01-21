"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import { toast } from "react-toastify";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  FaRocket,
  FaBars,
  FaTimes,
  FaCompass,
  FaChartPie,
  FaUserCircle,
  FaCog
} from "react-icons/fa";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark");

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthClick = async () => {
    if (user) {
      try {
        await signOut();
        toast.success("Signed out successfully!");
      } catch (error) {
        console.error("Sign-out error:", error);
        toast.error("Failed to sign out.");
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const baseMenu = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  const userIcons = [
    { href: "/portal", label: "Jobs", icon: <FaCompass size={20} /> },
    { href: "/dashboard", label: "Dashboard", icon: <FaChartPie size={20} /> },
    { href: "/profile", label: "Profile", icon: <FaUserCircle size={20} /> },
  ];

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        try {
          const adminsSnapshot = await getDocs(collection(db, "admins"));
          const adminEmails = adminsSnapshot.docs.map(doc => doc.data().email);
          setIsAdmin(adminEmails.includes(user.email));
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (isAdmin) {
    userIcons.push({ href: "/admin", label: "Admin", icon: <FaCog size={20} /> });
  }

  if (loading) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
          ? 'bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)] shadow-2xl py-2'
          : 'bg-transparent py-4'
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] p-2 group-hover:scale-110 transition-all duration-300 shadow-xl"
                whileHover={{ rotate: 5 }}
              >
                <FaRocket className="w-full h-full text-white" />
              </motion.div>
              <motion.span
                className="font-display text-2xl font-bold text-[var(--text-primary)]"
                whileHover={{ scale: 1.05 }}
              >
                Eventopic
              </motion.span>
            </Link>

            {/* Desktop Menu - Center */}
            <div className="hidden lg:flex items-center gap-1">
              {baseMenu.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-5 py-2 rounded-full font-heading font-semibold transition-all duration-300 text-sm tracking-wide ${pathname === item.href
                      ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                      }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* User Icons (Desktop) */}
              {user && (
                <div className="hidden lg:flex items-center gap-1 mr-2">
                  {userIcons.map((item) => (
                    <motion.div key={item.href} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href={item.href}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2 ${pathname.startsWith(item.href)
                          ? 'bg-[var(--primary)] text-[var(--background)] shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                          : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-light)] border border-[var(--border)]'
                          }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Auth Button */}
              {user ? (
                <motion.button
                  onClick={handleAuthClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex btn-secondary text-sm px-5 py-2 rounded-full border border-[var(--border)]"
                >
                  Sign Out
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleAuthClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex btn-primary text-sm px-6 py-2 rounded-full shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                >
                  Sign In
                </motion.button>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-300"
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMenuOpen ? 'auto' : 0,
            opacity: isMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="lg:hidden overflow-hidden bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--border)]"
        >
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 gap-2 mb-6">
              {baseMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-center px-4 py-3 rounded-xl font-heading font-semibold transition-all duration-300 ${pathname === item.href
                    ? 'text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-light)]'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {user && (
              <div className="mb-6">
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 px-1">Apps</div>
                <div className="grid grid-cols-3 gap-3">
                  {userIcons.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 ${pathname.startsWith(item.href)
                        ? 'bg-[var(--primary)] text-[var(--background)]'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-light)]'
                        }`}
                    >
                      {item.icon}
                      <span className="text-xs font-bold">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-[var(--border)]">
              {user ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                      {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        {user.displayName || 'User'}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] truncate max-w-[150px]">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => {
                      handleAuthClick();
                      setIsMenuOpen(false);
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Sign Out
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => {
                    handleAuthClick();
                    setIsMenuOpen(false);
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full btn-primary text-sm py-3"
                >
                  Sign In
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.nav>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode="signin" />
    </>
  );
}