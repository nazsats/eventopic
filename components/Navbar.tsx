"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import ThemeSwitcher from "./ThemeSwitcher";
import { toast } from "sonner";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  FaBars, FaTimes, FaBriefcase, FaChartPie,
  FaUserCircle, FaCog, FaArrowRight, FaSignOutAlt,
} from "react-icons/fa";

const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const USER_NAV = [
  { href: "/jobs", label: "Jobs", icon: <FaBriefcase /> },
  { href: "/dashboard", label: "Dashboard", icon: <FaChartPie /> },
  { href: "/profile", label: "Profile", icon: <FaUserCircle /> },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) { setIsAdmin(false); return; }
      try {
        const snap = await getDocs(collection(db, "admins"));
        setIsAdmin(snap.docs.some(d => d.data().email === user.email));
      } catch { setIsAdmin(false); }
    };
    checkAdmin();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully!");
      setIsMenuOpen(false);
    } catch {
      toast.error("Failed to sign out.");
    }
  };

  const allUserNav = isAdmin
    ? [...USER_NAV, { href: "/admin", label: "Admin", icon: <FaCog /> }]
    : USER_NAV;

  if (loading) return null;

  // Avatar initials
  const avatarChar = user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      {/* ─── Nav bar ─── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled
            ? "bg-[var(--background)]/85 backdrop-blur-xl border-b border-[var(--border)] shadow-lg"
            : "bg-transparent"
          }`}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16 md:h-[68px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-black font-black text-sm leading-none">E</span>
              </div>
              <span className="font-display font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                Eventopic
              </span>
            </Link>

            {/* ── Desktop center nav ── */}
            <div className="hidden lg:flex items-center gap-0.5">
              {PUBLIC_NAV.map(item => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${active
                        ? "text-[var(--primary)] bg-[var(--primary)]/10"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
                      }`}
                  >
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 -z-10"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ── Desktop right side ── */}
            <div className="hidden lg:flex items-center gap-2">
              {user && (
                <div className="flex items-center gap-1 mr-1">
                  {allUserNav.map(item => {
                    const active = pathname.startsWith(item.href) && item.href !== "/";
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${active
                            ? "bg-[var(--primary)] text-black shadow-[0_0_14px_rgba(0,212,255,0.35)]"
                            : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] border border-[var(--border)]"
                          }`}
                      >
                        <span className="text-[11px]">{item.icon}</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}

              <ThemeSwitcher />

              {user ? (
                <div className="flex items-center gap-2 ml-1">
                  {/* Avatar */}
                  <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-black font-bold text-sm hover:scale-110 transition-transform shadow-md">
                    {avatarChar}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <button onClick={() => setIsModalOpen(true)} className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5">
                    Sign In
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs px-5 py-2 rounded-full font-bold shadow-[0_0_18px_rgba(0,212,255,0.25)] hover:shadow-[0_0_28px_rgba(0,212,255,0.4)] transition-all">
                    Join Free
                  </button>
                </div>
              )}
            </div>

            {/* ── Mobile right side ── */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeSwitcher />
              {/* Mobile avatar or sign-in pill */}
              {user ? (
                <button onClick={() => setIsMenuOpen(true)} className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-black font-bold text-sm shadow-md">
                  {avatarChar}
                </button>
              ) : (
                <button onClick={() => setIsModalOpen(true)} className="text-xs font-bold text-[var(--primary)] border border-[var(--primary)]/30 px-3.5 py-1.5 rounded-full hover:bg-[var(--primary)]/10 transition-all">
                  Sign In
                </button>
              )}
              {/* Hamburger */}
              <button
                onClick={() => setIsMenuOpen(v => !v)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <FaTimes size={15} /> : <FaBars size={15} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Mobile slide-in drawer ─── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[80vw] max-w-[320px] z-[120] bg-[var(--surface)] border-l border-[var(--border)] flex flex-col lg:hidden shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                    <span className="text-black font-black text-xs">E</span>
                  </div>
                  <span className="font-display font-bold text-base text-[var(--text-primary)]">Eventopic</span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all">
                  <FaTimes size={15} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

                {/* User info */}
                {user && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-[var(--border)]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-black font-bold text-base shrink-0">
                      {avatarChar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[var(--text-primary)] truncate">{user.displayName || "Welcome back"}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Public nav */}
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2.5 px-1">Menu</p>
                  <div className="space-y-1">
                    {PUBLIC_NAV.map(item => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
                              ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                              : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                            }`}
                        >
                          {item.label}
                          {active && <FaArrowRight className="text-[10px] text-[var(--primary)]" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* User apps */}
                {user && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2.5 px-1">My Account</p>
                    <div className="grid grid-cols-2 gap-2">
                      {allUserNav.map(item => {
                        const active = pathname.startsWith(item.href) && item.href !== "/";
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${active
                                ? "bg-[var(--primary)] text-black shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                                : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] border border-[var(--border)]"
                              }`}
                          >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer footer */}
              <div className="px-4 py-4 border-t border-[var(--border)]">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/8 border border-[var(--border)] transition-all"
                  >
                    <FaSignOutAlt className="text-xs" /> Sign Out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }}
                      className="w-full btn-primary py-2.5 text-sm font-bold rounded-xl"
                    >
                      Join Free
                    </button>
                    <button
                      onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }}
                      className="w-full py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode="signin" />
    </>
  );
}
