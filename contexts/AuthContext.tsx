
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { toast } from "react-toastify";
import { auth, db } from "../lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string, isSignUp?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  signInWithApple: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      if (!navigator.onLine) {
        toast.error("Offline. Auth state may be inaccurate.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      }
      setUser(newUser);
      setLoading(false);

      if (newUser) {
        // Fetch admin emails to check if the user is an admin
        try {
          const adminsSnapshot = await getDocs(collection(db, "admins"));
          const adminEmails = adminsSnapshot.docs.map(doc => doc.data().email as string);
          
          // Only redirect to /profile if the user is not on /admin and is not an admin
          if (pathname !== "/admin" && !adminEmails.includes(newUser.email!)) {
            console.log("AuthContext: Redirecting to /profile for non-admin user:", newUser.email);
            router.replace("/profile");
          } else {
            console.log("AuthContext: No redirect - user is on /admin or is an admin:", newUser.email);
          }
        } catch (error: unknown) {
          console.error("AuthContext: Error fetching admins:", error instanceof Error ? error.message : error);
          // Fallback to /profile if there's an error fetching admins, but not for /admin
          if (pathname !== "/admin") {
            console.log("AuthContext: Fallback redirect to /profile due to error, user:", newUser.email);
            router.replace("/profile");
          }
        }
      }
    });
    return () => unsubscribe();
  }, [router, pathname]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: any) {
      toast.error("Failed to sign in with Google.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Facebook!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: any) {
      toast.error("Failed to sign in with Facebook.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const provider = new OAuthProvider("apple.com");
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Apple!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: any) {
      toast.error("Failed to sign in with Apple.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string, isSignUp = false) => {
    try {
      if (isSignUp) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
        toast.info("Verification email sent! Please check your inbox.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Signed in with email!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      }
    } catch (error: any) {
      toast.error("Failed to sign in with email.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast.success("Signed out successfully!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: any) {
      toast.error("Failed to sign out.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: any) {
      toast.error("Failed to send reset email.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithFacebook, signInWithApple, signInWithEmail, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
