"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import { toast } from "react-toastify";
import { FaMoon, FaSun } from "react-icons/fa";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  // Load theme preference from localStorage on mount
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

  // Toggle dark/light mode and save to localStorage
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
      } catch (error: unknown) {
        console.error("Sign out error:", error instanceof Error ? error.message : "Unknown error");
        toast.error("Failed to sign out.");
      }
    } else {
      setIsModalOpen(true);
    }
  };

  // Base menu items visible to all users
  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
  ];

  // Add protected routes only if user is signed in
  if (!loading && user) {
    menuItems.push(
      { href: "/portal", label: "Portal" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/profile", label: "Profile" }
    );
    if (user.email === "ansarinazrul91@gmail.com") {
      menuItems.push({ href: "/admin", label: "Admin" });
    }
  }

  return (
    <>
      <nav
        className="fixed top-0 z-50 p-4 shadow-xl w-full mb-8"
        style={{
          background: "linear-gradient(to right, var(--primary), var(--accent))",
          color: "var(--white)",
          borderBottom: "1px solid var(--color-accent)/20",
        }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logoWhite.png"
              alt="Eventopic Logo"
              width={56}
              height={56}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
              priority
            />
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-medium relative hover:scale-105 transition-all duration-300 group ${
                  pathname === item.href
                    ? "text-[var(--color-accent)] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-[var(--color-accent)] after:to-[var(--teal-accent)] after:rounded-full"
                    : "hover:text-[var(--color-accent)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuthClick}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)] shadow-md hover:shadow-lg"
            >
              {loading ? "Loading..." : user ? "Sign Out" : "Sign In"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 bg-[var(--accent)] hover:bg-[var(--teal-accent)]"
              style={{ color: "var(--white)" }}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </motion.button>
          </div>
          <button
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: "var(--white)" }}
            aria-label="Toggle mobile menu"
            aria-expanded={isMenuOpen}
          >
            ☰
          </button>
        </div>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden mt-4 space-y-3 bg-[var(--secondary)] p-4 rounded-xl shadow-xl border border-[var(--accent)]/30 mb-16"
          >
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-base font-medium py-1 hover:text-[var(--color-accent)] transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuthClick}
              className="w-full text-left px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)]"
            >
              {loading ? "Loading..." : user ? "Sign Out" : "Sign In"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="w-full text-left px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 bg-[var(--accent)] hover:bg-[var(--teal-accent)] text-[var(--white)]"
            >
              {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </motion.button>
          </motion.div>
        )}
      </nav>
      <div className="h-24 md:h-14"></div>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}