"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import { toast } from "react-toastify";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const handleAuthClick = async () => {
    if (user) {
      try {
        await signOut(); // Use signOut from useAuth
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
      { href: "/profile", label: `Profile (${user.email})` }
    );
    if (user.email === "ansarinazrul91@gmail.com") {
      menuItems.push({ href: "/admin", label: "Admin" });
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 p-4 shadow-xl relative" style={{ background: "linear-gradient(to right, var(--primary), var(--accent))", color: "var(--white)", borderBottom: "1px solid var(--color-accent)/20" }}>
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logoWhite.png" 
              alt="Eventopic Logo" 
              width={80} 
              height={80} 
              className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300" 
              priority 
            />
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`text-lg font-semibold relative hover:scale-105 transition-all duration-300 group ${
                  pathname === item.href 
                    ? 'text-[var(--color-accent)] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-[var(--color-accent)] after:to-[var(--teal-accent)] after:rounded-full' 
                    : 'hover:text-[var(--color-accent)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuthClick}
              className="px-6 py-3 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)] shadow-lg hover:shadow-xl"
            >
              {loading ? "Loading..." : user ? "Sign Out" : "Sign In"}
            </motion.button>
          </div>
          <button className="md:hidden text-3xl" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ color: "var(--white)" }}>
            ☰
          </button>
        </div>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="md:hidden mt-4 space-y-4 bg-[var(--secondary)] p-6 rounded-2xl shadow-xl border border-[var(--accent)]/30"
          >
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="block text-lg font-semibold py-2 hover:text-[var(--color-accent)] transition-colors duration-300 relative group hover:after:w-full" 
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuthClick}
              className="w-full text-left px-4 py-3 rounded-2xl font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)]"
            >
              {loading ? "Loading..." : user ? "Sign Out" : "Sign In"}
            </motion.button>
          </motion.div>
        )}
      </nav>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}