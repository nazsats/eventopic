"use client";

import { useState, ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { FaGoogle, FaFacebookF, FaApple, FaEnvelope, FaLock, FaSpinner, FaTimes, FaRocket } from "react-icons/fa";

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
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`relative w-full flex items-center justify-center gap-3 p-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 overflow-hidden group ${colorClass}`}
  >
    {disabled ? <FaSpinner className="animate-spin text-lg" /> : <span className="text-lg">{icon}</span>}
    <span>{label}</span>
    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
  </motion.button>
);

export default function AuthModal({ isOpen, onClose, mode: initialMode }: AuthModalProps) {
  const { signInWithGoogle, signInWithFacebook, signInWithApple, resetPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    setIsProcessing(true);
    try {
      if (mode === "signup") {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", user.uid), { email, createdAt: new Date().toISOString() });
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md relative"
          >
            {/* Ambient Glow */}
            <div className="absolute bg-[var(--primary)]/20 inset-4 blur-3xl rounded-full -z-10 animate-pulse" />

            <div className="glass-card p-8 border border-[var(--border)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)]" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 hover:bg-[var(--surface-elevated)] rounded-full"
              >
                <FaTimes />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] p-[1px]">
                  <div className="w-full h-full rounded-full bg-[var(--surface)] flex items-center justify-center">
                    <FaRocket className="text-2xl text-[var(--primary)]" />
                  </div>
                </div>
                <h2 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
                  {mode === "signin" ? "Welcome Back" : "Join Eventopic"}
                </h2>
                <p className="text-[var(--text-secondary)]">
                  {mode === "signin"
                    ? "Sign in to access your dashboard"
                    : "Create an account to get started"}
                </p>
              </div>

              {!showResetForm ? (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    <div>
                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="modern-input pl-12"
                          placeholder="Email Address"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="modern-input pl-12"
                          placeholder="Password"
                          required
                        />
                      </div>
                    </div>

                    {mode === "signin" && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setShowResetForm(true)}
                          className="text-sm text-[var(--primary)] hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <FaSpinner className="animate-spin" /> : null}
                      {mode === "signin" ? "Sign In" : "Create Account"}
                    </button>
                  </form>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--border)]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[var(--surface)] text-[var(--text-secondary)]">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <SocialButton
                      icon={<FaGoogle />}
                      label=""
                      onClick={() => handleSocialSignIn(signInWithGoogle, "google")}
                      disabled={socialLoading.google}
                      colorClass="bg-white text-black hover:bg-gray-100"
                    />
                    <SocialButton
                      icon={<FaFacebookF />}
                      label=""
                      onClick={() => handleSocialSignIn(signInWithFacebook, "facebook")}
                      disabled={socialLoading.facebook}
                      colorClass="bg-[#1877F2] text-white hover:bg-[#166fe5]"
                    />
                    <SocialButton
                      icon={<FaApple />}
                      label=""
                      onClick={() => handleSocialSignIn(signInWithApple, "apple")}
                      disabled={socialLoading.apple}
                      colorClass="bg-black text-white hover:bg-gray-900 border border-[var(--border)]"
                    />
                  </div>
                </>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="text-center mb-6 p-4 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)]">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="modern-input pl-12"
                      placeholder="Email Address"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <FaSpinner className="animate-spin" /> : null}
                    Send Reset Link
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowResetForm(false)}
                    className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="text-[var(--text-secondary)]">
                {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="ml-2 font-bold text-[var(--primary)] hover:underline"
                >
                  {mode === "signin" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
