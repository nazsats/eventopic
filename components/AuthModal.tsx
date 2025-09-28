
"use client";

import { useState, ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion, Variants } from "framer-motion";
import { toast } from "react-toastify";
import Link from "next/link";
import { FaGoogle, FaFacebookF, FaApple, FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";

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
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, label, onClick, disabled }) => (
  <motion.button
    variants={buttonVariants}
    whileHover="hover"
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className="flex items-center justify-center w-full h-9 px-3 py-1 rounded-md text-sm font-bold font-body shadow-md hover:shadow-[0_0_15px_rgba(0,196,180,0.5)] transition-all duration-300 group relative disabled:opacity-50 bg-[var(--accent)] text-[var(--white)] border-2 border-[var(--light)]"
    aria-label={label}
    aria-busy={disabled}
  >
    {disabled ? <FaSpinner className="animate-spin mr-1 text-base" /> : <span className="mr-1 text-base">{icon}</span>}
    {label}
    <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-md -z-10"></span>
  </motion.button>
);

const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, type: "spring", stiffness: 80, ease: "easeOut" } },
  hover: {
    scale: 1.05,
    y: -3,
    boxShadow: "0 6px 20px rgba(0, 196, 180, 0.3)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

const containerVariants: Variants = {
  visible: { transition: { staggerChildren: 0.15 } },
};

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
  const [errors, setErrors] = useState({ email: "", password: "", resetEmail: "" });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: "", password: "", resetEmail: "" });

    if (!email || !password) {
      setErrors({ email: !email ? "Required" : "", password: !password ? "Required" : "", resetEmail: "" });
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setErrors({ email: "", password: "Minimum 6 characters", resetEmail: "" });
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: "Invalid email format", password: "", resetEmail: "" });
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
    } catch (error) {
      console.error("Authentication error:", error);
      let errorMessage = "Authentication failed. Try again.";
      if (error instanceof Error) {
        switch (error.message) {
          case "auth/email-already-in-use":
            errorMessage = "Email already in use. Try signing in.";
            setErrors({ email: "Email already in use", password: "", resetEmail: "" });
            break;
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            errorMessage = "Invalid email or password.";
            setErrors({ email: "Invalid credentials", password: "Invalid credentials", resetEmail: "" });
            break;
          case "auth/weak-password":
            errorMessage = "Password too weak (min 6 characters).";
            setErrors({ email: "", password: "Too weak", resetEmail: "" });
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email format.";
            setErrors({ email: "Invalid email", password: "", resetEmail: "" });
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
    setErrors({ email: "", password: "", resetEmail: "" });

    if (!resetEmail) {
      setErrors({ email: "", password: "", resetEmail: "Required" });
      toast.error("Please enter your email.");
      return;
    }
    if (!validateEmail(resetEmail)) {
      setErrors({ email: "", password: "", resetEmail: "Invalid email format" });
      toast.error("Please enter a valid email.");
      return;
    }

    setIsProcessing(true);
    try {
      await resetPassword(resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setShowResetForm(false);
      setResetEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
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
      toast.success(`Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`);
      onClose();
    } catch (error) {
      console.error(`Social sign-in error (${provider}):`, error);
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
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ scale: 0.9, y: 50 }}
        className="p-4 rounded-md shadow-xl border border-[var(--light)]/30 bg-[var(--primary)] backdrop-blur-md max-w-[280px] sm:max-w-[300px] w-full mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg md:text-xl font-extrabold text-center mb-3 font-heading text-[var(--text-accent)] text-shadow" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}>
          {mode === "signup" ? "Sign Up" : "Sign In"} to Eventopic
        </h2>
        <motion.div className="flex flex-col gap-2 mb-3 w-full" variants={containerVariants}>
          <SocialButton
            icon={<FaGoogle />}
            label={`Sign ${mode === "signup" ? "Up" : "In"} with Google`}
            onClick={() => handleSocialSignIn(signInWithGoogle, "google")}
            disabled={socialLoading.google}
          />
          <SocialButton
            icon={<FaFacebookF />}
            label={`Sign ${mode === "signup" ? "Up" : "In"} with Facebook`}
            onClick={() => handleSocialSignIn(signInWithFacebook, "facebook")}
            disabled={socialLoading.facebook}
          />
          <SocialButton
            icon={<FaApple />}
            label={`Sign ${mode === "signup" ? "Up" : "In"} with Apple`}
            onClick={() => handleSocialSignIn(signInWithApple, "apple")}
            disabled={socialLoading.apple}
          />
        </motion.div>
        <div className="flex justify-center my-1.5 text-sm font-body text-[var(--text-body)]">
          or
        </div>
        {!showResetForm ? (
          <motion.form onSubmit={handleSubmit} className="space-y-1 w-full flex flex-col items-center" variants={containerVariants}>
            <motion.div variants={cardVariants} className="w-full">
              <label className="block mb-1 text-sm font-semibold font-body text-[var(--text-accent)]">
                <FaEnvelope className="inline mr-1 text-base" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 p-1.5 rounded-md text-sm font-body bg-[var(--primary)]/50 border border-[var(--light)]/30 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--teal-accent)]/50 focus:outline-none transition-all duration-300"
                placeholder="Enter your email"
                required
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
              />
              {errors.email && <p id="email-error" className="text-red-400 text-xs mt-0.5 text-center">{errors.email}</p>}
            </motion.div>
            <motion.div variants={cardVariants} className="w-full">
              <label className="block mb-1 text-sm font-semibold font-body text-[var(--text-accent)]">
                <FaLock className="inline mr-1 text-base" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 p-1.5 rounded-md text-sm font-body bg-[var(--primary)]/50 border border-[var(--light)]/30 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--teal-accent)]/50 focus:outline-none transition-all duration-300"
                placeholder="Enter your password"
                required
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
              {errors.password && <p id="password-error" className="text-red-400 text-xs mt-0.5 text-center">{errors.password}</p>}
            </motion.div>
            <motion.button
              variants={buttonVariants}
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center justify-center w-full h-9 px-3 py-1 rounded-md text-sm font-bold font-body shadow-md hover:shadow-[0_0_15px_rgba(0,196,180,0.5)] transition-all duration-300 group relative disabled:opacity-50 bg-[var(--accent)] text-[var(--white)] border-2 border-[var(--light)]"
              aria-busy={isProcessing}
              style={{ lineHeight: "normal" }}
            >
              {isProcessing ? (
                <span className="inline-flex items-center">
                  <FaSpinner className="animate-spin mr-1 text-base" />
                  Processing...
                </span>
              ) : mode === "signup" ? (
                "Sign Up"
              ) : (
                "Sign In"
              )}
              <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-md -z-10"></span>
            </motion.button>
          </motion.form>
        ) : (
          <motion.form onSubmit={handleResetSubmit} className="space-y-1 w-full flex flex-col items-center" variants={containerVariants}>
            <motion.div variants={cardVariants} className="w-full">
              <label className="block mb-1 text-sm font-semibold font-body text-[var(--text-accent)]">
                <FaEnvelope className="inline mr-1 text-base" /> Email
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full h-9 p-1.5 rounded-md text-sm font-body bg-[var(--primary)]/50 border border-[var(--light)]/30 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--teal-accent)]/50 focus:outline-none transition-all duration-300"
                placeholder="Enter your email"
                required
                aria-invalid={!!errors.resetEmail}
                aria-describedby="reset-email-error"
              />
              {errors.resetEmail && <p id="reset-email-error" className="text-red-400 text-xs mt-0.5 text-center">{errors.resetEmail}</p>}
            </motion.div>
            <motion.button
              variants={buttonVariants}
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center justify-center w-full h-9 px-3 py-1 rounded-md text-sm font-bold font-body shadow-md hover:shadow-[0_0_15px_rgba(0,196,180,0.5)] transition-all duration-300 group relative disabled:opacity-50 bg-[var(--accent)] text-[var(--white)] border-2 border-[var(--light)]"
              aria-busy={isProcessing}
              style={{ lineHeight: "normal" }}
            >
              {isProcessing ? (
                <span className="inline-flex items-center">
                  <FaSpinner className="animate-spin mr-1 text-base" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
              <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-md -z-10"></span>
            </motion.button>
          </motion.form>
        )}
        {mode === "signin" && !showResetForm && (
          <p className="text-center mt-1.5 text-sm font-body text-[var(--text-body)]">
            <span
              onClick={() => setShowResetForm(true)}
              className="cursor-pointer hover:text-[var(--text-accent)] transition-colors duration-200 underline"
              aria-label="Forgot password"
            >
              Forgot Password?
            </span>
          </p>
        )}
        {showResetForm && (
          <p className="text-center mt-1.5 text-sm font-body text-[var(--text-body)]">
            <span
              onClick={() => setShowResetForm(false)}
              className="cursor-pointer hover:text-[var(--text-accent)] transition-colors duration-200 underline"
              aria-label="Back to sign in"
            >
              Back to Sign In
            </span>
          </p>
        )}
        <p className="text-center mt-1.5 text-sm font-body text-[var(--text-body)]">
          {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
          <span
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="ml-1 cursor-pointer hover:text-[var(--text-accent)] transition-colors duration-200 underline"
            aria-label={mode === "signup" ? "Switch to sign in" : "Switch to sign up"}
          >
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </span>
        </p>
        <div className="flex justify-between mt-1.5 text-sm font-body text-[var(--text-body)] w-full">
          <Link href="/terms" className="hover:text-[var(--text-accent)] transition-colors duration-200">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[var(--text-accent)] transition-colors duration-200">
            Privacy
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, type: "spring", stiffness: 100, ease: "easeOut" } },
};
