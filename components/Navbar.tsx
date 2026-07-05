"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  FaBars, FaTimes, FaBriefcase, FaChartPie,
  FaUserCircle, FaCog, FaArrowRight, FaSignOutAlt,
} from "react-icons/fa";

const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
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
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  // Single cheap doc read (new rules let a user read only their own admin doc).
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) { setIsAdmin(false); return; }
      try {
        const snap = await getDoc(doc(db, "admins", user.email.toLowerCase()));
        setIsAdmin(snap.exists());
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

  const avatarChar = user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      {/* ─── Nav bar ─── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled
          ? "bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] shadow-[var(--shadow-sm)]"
          : "bg-transparent"
          }`}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16 md:h-[68px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-sm)] group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-black text-sm leading-none">E</span>
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
                      ? "text-[var(--primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--primary-muted)]"
                      }`}
                  >
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-[var(--primary-muted)] border border-[var(--border-hover)] -z-10"
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
                          ? "bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-glow)]"
                          : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--primary)] border border-[var(--border)]"
                          }`}
                      >
                        <span className="text-[11px]">{item.icon}</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}

              {user ? (
                <div className="flex items-center gap-2 ml-1">
                  <Link href="/profile" className="w-9 h-9 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform shadow-[var(--shadow-sm)]">
                    {avatarChar}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors px-2 py-1.5 rounded-lg hover:bg-[var(--primary-muted)]"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <button onClick={() => setIsModalOpen(true)} className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5">
                    Sign In
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs px-5 py-2 rounded-full">
                    Join Free
                  </button>
                </div>
              )}
            </div>

            {/* ── Mobile right side ── */}
            <div className="flex lg:hidden items-center gap-2">
              {user ? (
                <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-white font-bold text-sm shadow-[var(--shadow-sm)]">
                  {avatarChar}
                </button>
              ) : (
                <button onClick={() => setIsModalOpen(true)} className="text-xs font-bold text-[var(--primary)] border border-[var(--border-hover)] px-4 py-2 rounded-full hover:bg-[var(--primary-muted)] transition-all">
                  Sign In
                </button>
              )}
              <button
                onClick={() => setIsMenuOpen(v => !v)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all"
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
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-[#00302E]/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[80vw] max-w-[320px] z-[120] bg-[var(--surface)] border-l border-[var(--border)] flex flex-col lg:hidden shadow-[var(--shadow-lg)]"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center">
                    <span className="text-white font-black text-xs">E</span>
                  </div>
                  <span className="font-display font-bold text-base text-[var(--text-primary)]">Eventopic</span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-muted)] transition-all">
                  <FaTimes size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                {user && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                    <div className="w-10 h-10 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-white font-bold text-base shrink-0">
                      {avatarChar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[var(--text-primary)] truncate">{user.displayName || "Welcome back"}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                    </div>
                  </div>
                )}

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
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                            ? "bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--border-hover)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                          {item.label}
                          {active && <FaArrowRight className="text-[10px] text-[var(--primary)]" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>

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
                              ? "bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-glow)]"
                              : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--primary)] border border-[var(--border)]"
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

              <div className="px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-[var(--border)]">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/8 border border-[var(--border)] transition-all"
                  >
                    <FaSignOutAlt className="text-xs" /> Sign Out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }}
                      className="w-full btn-primary py-2.5 text-sm rounded-xl"
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
