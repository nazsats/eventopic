
// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import { toast } from "react-toastify";
import { FaMoon, FaSun } from "react-icons/fa";

const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 80 } },
  hover: {
    scale: 1.1,
    y: -5,
    boxShadow: "0 8px 24px rgba(0, 196, 180, 0.4)",
    background: "linear-gradient(135deg, var(--teal-accent), var(--color-accent))",
    borderColor: "var(--teal-accent)",
    transition: { duration: 0.3 },
  },
};

const containerVariants: Variants = {
  visible: { transition: { staggerChildren: 0.2 } },
};

const logoContainerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 80 } },
  hover: {
    scale: 1.1,
    boxShadow: "0 8px 24px rgba(0, 196, 180, 0.4)",
    background: "linear-gradient(135deg, var(--teal-accent), var(--color-accent))",
    transition: { duration: 0.3 },
  },
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
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
  ];
  const adminMenu = user?.email === "ansarinazrul91@gmail.com" ? [{ href: "/admin", label: "Admin" }] : [];
  const menuItems = user && !loading
    ? [...baseMenu, { href: "/portal", label: "Portal" }, { href: "/dashboard", label: "Dashboard" }, { href: "/profile", label: "Profile" }, ...adminMenu]
    : baseMenu;

  if (loading) return <div className="h-24 bg-[var(--primary)] flex items-center justify-center text-[var(--text-body)]">Loading...</div>;

  return (
    <>
      <nav className="fixed top-0 z-50 p-4 shadow-xl w-full bg-[var(--primary)]/80 border-b border-[var(--light)]/20 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center" role="link" aria-label="Eventopic Home">
              <motion.div
                variants={logoContainerVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="relative w-14 h-14 md:w-16 md:h-16 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ring-1 ring-[var(--light)]/30"
                style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))" }}
              >
                <Image
                  src={isDarkMode ? "/logoWhite.png" : "/logoWhite.png"}
                  alt="Eventopic Logo - Event Management and Staffing in Dubai"
                  fill
                  sizes="(max-width: 768px) 56px, 64px"
                  className="object-contain"
                  priority
                />
                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
              </motion.div>
            </Link>
          </div>
          <motion.div className="hidden md:flex items-center space-x-6" variants={containerVariants} initial="hidden" animate="visible">
            {menuItems.map((item) => (
              <motion.div key={item.href} variants={buttonVariants}>
                <Link
                  href={item.href}
                  className={`text-lg font-medium relative hover:scale-105 transition-all duration-300 group text-[var(--text-body)] hover:text-[var(--text-accent)] ${
                    pathname === item.href ? "text-[var(--text-accent)] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-1 after:bg-[var(--teal-accent)] after:rounded-full" : ""
                  }`}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <motion.button
              variants={buttonVariants}
              onClick={handleAuthClick}
              className="px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
              style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--white)", border: "2px solid var(--light)" }}
            >
              {user ? "Sign Out" : "Sign In"}
              <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
            </motion.button>
            <motion.button
              variants={buttonVariants}
              onClick={toggleDarkMode}
              className="p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
              style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--white)", border: "2px solid var(--light)" }}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
            </motion.button>
          </motion.div>
          <motion.div className="flex items-center space-x-4 md:hidden" variants={containerVariants} initial="hidden" animate="visible">
            <motion.button
              variants={buttonVariants}
              onClick={handleAuthClick}
              className="px-4 py-1.5 text-sm font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 group relative sm:px-6 sm:py-2 sm:text-base"
              style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--white)", border: "2px solid var(--light)" }}
            >
              {user ? "Sign Out" : "Sign In"}
              <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
            </motion.button>
            <button
              className="text-2xl text-[var(--text-body)]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              ☰
            </button>
          </motion.div>
        </div>
        {isMenuOpen && (
          <motion.div
            variants={containerVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden mt-4 space-y-3 bg-[var(--primary)]/80 p-4 rounded-xl shadow-xl border border-[var(--light)]/30 mb-16 backdrop-blur-sm divide-y divide-[var(--light)]/20"
            id="mobile-menu"
          >
            {menuItems.map((item) => (
              <motion.div key={item.href} variants={buttonVariants}>
                <Link
                  href={item.href}
                  className="block text-lg font-medium py-1 text-[var(--text-body)] hover:text-[var(--text-accent)] transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <motion.div variants={buttonVariants}>
              <button
                onClick={toggleDarkMode}
                className="w-full text-left text-lg font-medium py-2 px-4 text-[var(--text-body)] hover:text-[var(--text-accent)] transition-colors duration-300 flex items-center gap-2 bg-[var(--secondary)]/50 rounded-md"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={isDarkMode}
              >
                {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </nav>
      <div className="h-24 md:h-14"></div>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode="signin" />
    </>
  );
}
