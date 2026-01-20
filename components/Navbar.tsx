// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import { toast } from "react-toastify";
import { FaMoon, FaSun, FaBars, FaTimes, FaRocket, FaUser } from "react-icons/fa";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

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

  const adminMenu = user?.email === "ansarinazrul91@gmail.com" ? [{ href: "/admin", label: "Admin" }] : [];
  const menuItems = user && !loading
    ? [...baseMenu, { href: "/portal", label: "Jobs" }, { href: "/dashboard", label: "Dashboard" }, { href: "/profile", label: "Profile" }, ...adminMenu]
    : baseMenu;

  if (loading) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
          ? 'bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border)] shadow-2xl py-2'
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

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-4 py-2 rounded-full font-heading font-semibold transition-all duration-300 group ${pathname === item.href
                      ? 'text-[var(--primary)] bg-[var(--primary-muted)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                      }`}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-[var(--primary-muted)] rounded-full -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* User Avatar & Auth */}
              {user ? (
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)]">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                      <FaUser className="text-white text-sm" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] max-w-24 truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <motion.button
                    onClick={handleAuthClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary text-sm px-4 py-2 rounded-full"
                  >
                    Sign Out
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={handleAuthClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:block btn-primary text-sm px-6 py-2 rounded-full"
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
          className="lg:hidden overflow-hidden bg-[var(--surface)] border-t border-[var(--border)]"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-full font-heading font-semibold transition-all duration-300 ${pathname === item.href
                      ? 'text-[var(--primary)] bg-[var(--primary-muted)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                      }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-[var(--border)] mt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-[var(--surface-elevated)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                      <FaUser className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {user.displayName || 'User'}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
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
                    className="w-full btn-secondary text-sm py-3 rounded-full"
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
                  className="w-full btn-primary text-sm py-3 rounded-full"
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