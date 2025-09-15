"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Link from "next/link";
import { FaGoogle, FaFacebookF, FaApple, FaEnvelope, FaLock } from "react-icons/fa";

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email.");
      return;
    }

    setIsProcessing(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", email), { email, createdAt: new Date().toISOString() });
        toast.success("Account created! Welcome!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Signed in!");
      }
      onClose();
    } catch (error: unknown) {
      console.error("Auth error:", error instanceof Error ? error.message : "Unknown error");
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        const { code, message } = error as { code: string; message: string };
        let errorMessage = "Auth failed. Try again.";
        if (code === 'auth/email-already-in-use') {
          errorMessage = "Email already exists. Try signing in.";
        } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          errorMessage = "Wrong password, try again.";
        } else if (code === 'auth/weak-password') {
          errorMessage = "Password too weak (min 6 chars).";
        } else if (code === 'auth/invalid-email') {
          errorMessage = "Invalid email format.";
        } else {
          errorMessage = message || "Auth failed. Try again.";
        }
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred. Try again.");
      }
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
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
      console.error("Reset password error:", error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to send reset email. Check if the email is registered.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="p-8 rounded-2xl shadow-2xl border border-[var(--accent)]/30 bg-[var(--primary)]/70 backdrop-blur-md max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-6" style={{ color: "var(--white)", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
          {mode === "signup" ? "Sign Up" : "Sign In"} to Eventopic
        </h2>
        <div className="space-y-4 mb-6">
          <button
            onClick={signInWithGoogle}
            className="w-full p-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
          >
            <FaGoogle /> Sign {mode === "signup" ? "Up" : "In"} with Google
          </button>
          <button
            onClick={signInWithFacebook}
            className="w-full p-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
          >
            <FaFacebookF /> Sign {mode === "signup" ? "Up" : "In"} with Facebook
          </button>
          <button
            onClick={signInWithApple}
            className="w-full p-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
          >
            <FaApple /> Sign {mode === "signup" ? "Up" : "In"} with Apple
          </button>
        </div>
        <div className="text-center my-4 text-[var(--light)]">or</div>
        {!showResetForm ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--light)" }}>
                <FaEnvelope className="inline mr-2" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--accent)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--light)" }}>
                <FaLock className="inline mr-2" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--accent)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full p-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
            >
              {isProcessing ? "Processing..." : (mode === "signup" ? "Sign Up" : "Sign In")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--light)" }}>
                <FaEnvelope className="inline mr-2" /> Email
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-300 bg-[var(--soft)] text-[var(--accent)] border border-[var(--light)]/50 hover:border-[var(--teal-accent)]/50"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full p-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
            >
              {isProcessing ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
        {mode === "signin" && !showResetForm && (
          <p className="text-center mt-4" style={{ color: "var(--light)" }}>
            <button onClick={() => setShowResetForm(true)} className="hover:text-[var(--color-accent)] font-semibold transition-colors duration-200">
              Forgot Password?
            </button>
          </p>
        )}
        {showResetForm && (
          <p className="text-center mt-4" style={{ color: "var(--light)" }}>
            <button onClick={() => setShowResetForm(false)} className="hover:text-[var(--color-accent)] font-semibold transition-colors duration-200">
              Back to Sign In
            </button>
          </p>
        )}
        <p className="text-center mt-4" style={{ color: "var(--light)" }}>
          {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="ml-2 hover:text-[var(--color-accent)] font-semibold transition-colors duration-200"
          >
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </button>
        </p>
        <div className="flex justify-between mt-6 text-sm" style={{ color: "var(--light)" }}>
          <Link href="/terms" className="hover:text-[var(--color-accent)] transition-colors duration-200">
            Terms and Conditions
          </Link>
          <Link href="/privacy" className="hover:text-[var(--color-accent)] transition-colors duration-200">
            Privacy Policy
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}