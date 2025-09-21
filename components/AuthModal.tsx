"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Link from "next/link";
import { FaGoogle, FaFacebookF, FaApple, FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithFacebook, signInWithApple, resetPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email.");
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
    } catch (error: unknown) {
      console.error("Auth error:", error);
      let errorMessage = "Authentication failed. Try again.";
      if (error instanceof Error) {
        switch (error.message) {
          case "auth/email-already-in-use":
            errorMessage = "Email already in use. Try signing in.";
            break;
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            errorMessage = "Invalid email or password.";
            break;
          case "auth/weak-password":
            errorMessage = "Password too weak (min 6 characters).";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email format.";
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      toast.error(errorMessage);
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
    if (!validateEmail(resetEmail)) {
      toast.error("Please enter a valid email.");
      return;
    }
    setIsProcessing(true);
    try {
      await resetPassword(resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setShowResetForm(false);
      setResetEmail("");
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      toast.error("Failed to send reset email. Check if the email is registered.");
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
      onClose();
    } catch (error: unknown) {
      console.error(`${provider} sign-in error:`, error);
      toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in failed. Try again.`);
    } finally {
      setSocialLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="p-6 rounded-xl shadow-xl border border-[var(--accent)]/30 bg-[var(--primary)]/80 backdrop-blur-md max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-xl font-bold text-center mb-4"
          style={{ color: "var(--white)", textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
        >
          {mode === "signup" ? "Sign Up" : "Sign In"} to Eventopic
        </h2>
        <div className="space-y-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSocialSignIn(signInWithGoogle, "google")}
            disabled={socialLoading.google}
            className="w-full p-2 rounded-lg flex items-center justify-center gap-2 font-medium text-sm shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
          >
            {socialLoading.google ? <FaSpinner className="animate-spin" /> : <FaGoogle />}
            Sign {mode === "signup" ? "Up" : "In"} with Google
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSocialSignIn(signInWithFacebook, "facebook")}
            disabled={socialLoading.facebook}
            className="w-full p-2 rounded-lg flex items-center justify-center gap-2 font-medium text-sm shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
          >
            {socialLoading.facebook ? <FaSpinner className="animate-spin" /> : <FaFacebookF />}
            Sign {mode === "signup" ? "Up" : "In"} with Facebook
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSocialSignIn(signInWithApple, "apple")}
            disabled={socialLoading.apple}
            className="w-full p-2 rounded-lg flex items-center justify-center gap-2 font-medium text-sm shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
          >
            {socialLoading.apple ? <FaSpinner className="animate-spin" /> : <FaApple />}
            Sign {mode === "signup" ? "Up" : "In"} with Apple
          </motion.button>
        </div>
        <div className="text-center my-3 text-sm" style={{ color: "var(--light)" }}>
          or
        </div>
        {!showResetForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--light)" }}>
                <FaEnvelope className="inline mr-1" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--accent)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--light)" }}>
                <FaLock className="inline mr-1" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--accent)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                placeholder="Enter your password"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isProcessing}
              className="w-full p-2 rounded-lg font-medium text-sm shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Processing...
                </>
              ) : mode === "signup" ? (
                "Sign Up"
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--light)" }}>
                <FaEnvelope className="inline mr-1" /> Email
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full p-2 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--accent)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                placeholder="Enter your email"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isProcessing}
              className="w-full p-2 rounded-lg font-medium text-sm shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </motion.button>
          </form>
        )}
        {mode === "signin" && !showResetForm && (
          <p className="text-center mt-3 text-xs" style={{ color: "var(--light)" }}>
            <span
              onClick={() => setShowResetForm(true)}
              className="cursor-pointer hover:text-[var(--color-accent)] transition-colors duration-200 underline"
            >
              Forgot Password?
            </span>
          </p>
        )}
        {showResetForm && (
          <p className="text-center mt-3 text-xs" style={{ color: "var(--light)" }}>
            <span
              onClick={() => setShowResetForm(false)}
              className="cursor-pointer hover:text-[var(--color-accent)] transition-colors duration-200 underline"
            >
              Back to Sign In
            </span>
          </p>
        )}
        <p className="text-center mt-3 text-xs" style={{ color: "var(--light)" }}>
          {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
          <span
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="ml-1 cursor-pointer hover:text-[var(--color-accent)] transition-colors duration-200 underline"
          >
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </span>
        </p>
        <div className="flex justify-between mt-4 text-xs" style={{ color: "var(--light)" }}>
          <Link href="/terms" className="hover:text-[var(--color-accent)] transition-colors duration-200">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[var(--color-accent)] transition-colors duration-200">
            Privacy
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}