"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Link from "next/link";

// Child component that uses useSearchParams
function AuthContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();  // This is now inside the suspended component
  const mode = searchParams.get("mode") || "signin";

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
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        // Create profile doc if needed
        await setDoc(doc(db, "users", email), { email, createdAt: new Date().toISOString() });
        toast.success("Account created! Welcome!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Signed in!");
      }
      router.push("/portal");
    } catch (error: unknown) {
      console.error("Auth error:", error);
      // Type guard to safely access error properties
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        const { code, message } = error as { code: string; message: string };
        let errorMessage = "Auth failed. Try again.";
        if (code === 'auth/email-already-in-use') {
          errorMessage = "Email already exists. Try signing in.";
        } else if (code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          errorMessage = "Invalid email or password.";
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
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="py-20 bg-[var(--secondary)] min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--teal-accent)]/10"></div>
        <div className="container mx-auto px-4 max-w-md relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="card p-8 rounded-2xl shadow-2xl border border-[var(--accent)]/30 bg-[var(--primary)]/70 backdrop-blur-md"
          >
            <h1 className="text-3xl font-bold text-center mb-8 font-heading relative" style={{ color: "var(--white)", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
              {mode === "signup" ? "Sign Up" : "Sign In"} to Eventopic Portal
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 relative" style={{ color: "var(--light)" }}>Email</label>
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
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--light)" }}>Password</label>
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
                disabled={loading}
                className="w-full p-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
              >
                {loading ? "Processing..." : (mode === "signup" ? "Sign Up" : "Sign In")}
              </button>
            </form>
            <p className="text-center mt-6" style={{ color: "var(--light)" }}>
              {mode === "signup" ? "Already have an account?" : "Don't have an account?"} 
              <Link href={`/auth?mode=${mode === "signup" ? "signin" : "signup"}`} className="ml-2 hover:text-[var(--color-accent)] font-semibold transition-colors duration-200">
                {mode === "signup" ? "Sign In" : "Sign Up"}
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}

// Default export: Wrap the child in Suspense
export default function Auth() {
  return (
    <Suspense fallback={<div className="py-20 text-center flex items-center justify-center min-h-screen" style={{ color: "var(--white)" }}>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}