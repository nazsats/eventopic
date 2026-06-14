// contexts/AuthContext.tsx
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
import { toast } from "sonner";
import { auth, db } from "../lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
  signInWithGoogle: async () => { },
  signInWithFacebook: async () => { },
  signInWithApple: async () => { },
  signInWithEmail: async () => { },
  signOut: async () => { },
  resetPassword: async () => { },
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

  // Function to save user email to Firestore
  const saveUserToFirestore = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          createdAt: new Date().toISOString(),
          isProfileComplete: false, // Default value for new users
        });
        console.log(`Saved user email ${user.email} to Firestore`);
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      toast.error("Failed to save user data.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      if (!navigator.onLine) {
        toast.error("Offline. Auth state may be inaccurate.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      }
      setUser(newUser);
      setLoading(false);

      if (!newUser) {
        // Redirect unauthenticated users away from the profile page
        if (pathname === "/profile") router.replace("/");
        return;
      }

      try {
        await saveUserToFirestore(newUser);

        // One read of the user's own profile doc.
        const userSnap = await getDoc(doc(db, "users", newUser.uid));
        const isProfileComplete = userSnap.exists() ? !!userSnap.data().isProfileComplete : false;

        // Cheap single-doc admin check — the security rules allow a user to
        // read their OWN admin doc, so we never fetch the whole collection.
        let isAdminUser = false;
        if (newUser.email) {
          try {
            const adminSnap = await getDoc(doc(db, "admins", newUser.email.toLowerCase()));
            isAdminUser = adminSnap.exists();
          } catch {
            // Read denied => not an admin. Safe to ignore.
          }
        }

        // Only nudge non-admins with an incomplete profile, and only from
        // public marketing pages (never mid-task on protected routes).
        const publicRoutes = ["/", "/about", "/services"];
        if (!isAdminUser && !isProfileComplete && publicRoutes.includes(pathname)) {
          router.replace("/profile");
        }
      } catch (error: unknown) {
        console.error("AuthContext: profile/admin check failed:", error instanceof Error ? error.message : error);
      }
    });
    return () => unsubscribe();
  }, [router, pathname]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await saveUserToFirestore(user); // Save user email on Google sign-in
      toast.success("Signed in with Google!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: any) {
      toast.error("Failed to sign in with Google.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await saveUserToFirestore(user); // Save user email on Facebook sign-in
      toast.success("Signed in with Facebook!", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    } catch (error: any) {
      toast.error("Failed to sign in with Facebook.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const provider = new OAuthProvider("apple.com");
      const { user } = await signInWithPopup(auth, provider);
      await saveUserToFirestore(user); // Save user email on Apple sign-in
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
        await saveUserToFirestore(user); // Save user email on email sign-up
        await sendEmailVerification(user);
        toast.info("Verification email sent! Please check your inbox.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(user); // Save user email on email sign-in
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