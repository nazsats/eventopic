"use client";

import { useState, ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { FaGoogle, FaFacebookF, FaApple, FaEnvelope, FaLock, FaSpinner, FaTimes, FaArrowRight, FaShieldAlt } from "react-icons/fa";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
}

interface SocialButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
  colorClass: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, label, onClick, disabled, colorClass }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={`relative w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl font-bold text-sm transition-colors duration-200 disabled:opacity-50 ${colorClass}`}
  >
    {disabled ? <FaSpinner className="animate-spin text-base" /> : <span className="text-base">{icon}</span>}
    {label && <span>{label}</span>}
  </motion.button>
);

export default function AuthModal({ isOpen, onClose, mode: initialMode }: AuthModalProps) {
  const { signInWithGoogle, signInWithFacebook, signInWithApple, resetPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    facebook: false,
    apple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (mode === "signup" && !acceptedTerms) {
      toast.error("Please accept the Privacy Policy and Terms & Conditions to create an account.");
      return;
    }

    setIsProcessing(true);
    try {
      if (mode === "signup") {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", user.uid), { email, createdAt: new Date().toISOString(), acceptedTermsAt: new Date().toISOString() });
        toast.success("Account created! Welcome!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Signed in!");
      }
      setEmail("");
      setPassword("");
      onClose();
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email.");
      return;
    }

    setIsProcessing(true);
    try {
      await resetPassword(resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setShowResetForm(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error("Failed to send reset email.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSocialSignIn = async (
    signInFn: () => Promise<void>,
    provider: keyof typeof socialLoading
  ) => {
    if (mode === "signup" && !acceptedTerms) {
      toast.error("Please accept the Privacy Policy and Terms & Conditions to create an account.");
      return;
    }
    setSocialLoading((prev) => ({ ...prev, [provider]: true }));
    try {
      await signInFn();
      toast.success(`Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`);
      onClose();
    } catch (error) {
      console.error(`Social sign-in error (${provider}):`, error);
      toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in failed.`);
    } finally {
      setSocialLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-[200] p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] relative max-h-[94vh] overflow-y-auto rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-lg)]"
          >
            {/* Top brand strip */}
            <div className="h-1 w-full bg-[image:var(--gradient-primary)]" />

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 z-10 w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] rounded-full transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="p-6 sm:p-7">
              {/* Header */}
              <div className="mb-5">
                <div className="w-11 h-11 mb-3 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-sm)]">
                  <span className="text-white font-display font-black text-lg">E</span>
                </div>
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)] leading-tight">
                  {showResetForm ? "Reset your password" : mode === "signin" ? "Welcome back" : "Create your free account"}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {showResetForm
                    ? "We'll email you a reset link."
                    : mode === "signin"
                      ? "Sign in to track your applications."
                      : "Get booked with the UAE's top brands."}
                </p>
              </div>

              {!showResetForm ? (
                <>
                  {/* Social — quick icon row */}
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    <SocialButton
                      icon={<FaGoogle />}
                      label=""
                      onClick={() => handleSocialSignIn(signInWithGoogle, "google")}
                      disabled={socialLoading.google}
                      colorClass="bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--surface-light)] border border-[var(--border)]"
                    />
                    <SocialButton
                      icon={<FaFacebookF />}
                      label=""
                      onClick={() => handleSocialSignIn(signInWithFacebook, "facebook")}
                      disabled={socialLoading.facebook}
                      colorClass="bg-[var(--surface-elevated)] text-[#1877F2] hover:bg-[var(--surface-light)] border border-[var(--border)]"
                    />
                    <SocialButton
                      icon={<FaApple />}
                      label=""
                      onClick={() => handleSocialSignIn(signInWithApple, "apple")}
                      disabled={socialLoading.apple}
                      colorClass="bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--surface-light)] border border-[var(--border)]"
                    />
                  </div>

                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--border)]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-[var(--surface)] text-[var(--text-muted)]">or use email</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="modern-input pl-11"
                        placeholder="Email address"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="modern-input pl-11"
                        placeholder={mode === "signup" ? "Create a password" : "Password"}
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        required
                      />
                    </div>

                    {mode === "signin" && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setShowResetForm(true)}
                          className="text-xs font-semibold text-[var(--primary)] hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {mode === "signup" && (
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--primary)] cursor-pointer"
                        />
                        <span className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                          I accept the{" "}
                          <Link href="/privacy" target="_blank" className="text-[var(--primary)] font-semibold hover:underline">Privacy Policy</Link>{" "}
                          and{" "}
                          <Link href="/terms" target="_blank" className="text-[var(--primary)] font-semibold hover:underline">Terms</Link>.
                        </span>
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
                    >
                      {isProcessing ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>{mode === "signin" ? "Sign In" : "Create Account"} <FaArrowRight className="text-xs" /></>
                      )}
                    </button>
                  </form>

                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] mt-3">
                    <FaShieldAlt className="text-[9px]" /> Secure &amp; free — takes under a minute.
                  </p>

                  <div className="mt-4 pt-4 border-t border-[var(--border)] text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                      {mode === "signin" ? "New to Eventopic?" : "Already have an account?"}
                      <button
                        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                        className="ml-1.5 font-bold text-[var(--primary)] hover:underline"
                      >
                        {mode === "signin" ? "Create an account" : "Sign in"}
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-3">
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="modern-input pl-11"
                      placeholder="Email address"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isProcessing ? <FaSpinner className="animate-spin" /> : null}
                    Send Reset Link
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowResetForm(false)}
                    className="w-full py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
