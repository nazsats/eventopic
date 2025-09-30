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
import { toast } from "react-toastify";
import { auth, db } from "../lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";

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

      if (newUser) {
        // Save user email to Firestore on login
        await saveUserToFirestore(newUser);

        try {
          // Fetch admin emails to check if the user is an admin
          const adminsSnapshot = await getDocs(collection(db, "admins"));
          const adminEmails = adminsSnapshot.docs.map(doc => doc.data().email as string);

          // Define protected routes where no redirect to /profile is needed
          const protectedRoutes = ["/profile", "/portal", "/dashboard", "/admin"];
          
          // Define public routes where redirect to /profile is allowed if profile is incomplete
          const publicRoutes = ["/", "/about", "/services", "/gallery"];

          // Check if the user’s profile is complete
          const userDoc = await getDoc(doc(db, "users", newUser.uid));
          const isProfileComplete = userDoc.exists() ? userDoc.data().isProfileComplete : false;

          // Redirect to /profile only if:
          // 1. The user is not an admin
          // 2. The profile is incomplete
          // 3. The current route is a public route (not a protected route)
          if (
            !adminEmails.includes(newUser.email!) &&
            !isProfileComplete &&
            publicRoutes.includes(pathname) &&
            !protectedRoutes.includes(pathname)
          ) {
            console.log(`AuthContext: Redirecting to /profile for non-admin user with incomplete profile: ${newUser.email}, current path: ${pathname}`);
            router.replace("/profile");
          } else {
            console.log(`AuthContext: No redirect needed for user: ${newUser.email}, current path: ${pathname}, isProfileComplete: ${isProfileComplete}`);
          }
        } catch (error: unknown) {
          console.error("AuthContext: Error checking profile or admins:", error instanceof Error ? error.message : error);
          // Avoid redirect in error case unless profile is incomplete and route is public
          const userDoc = await getDoc(doc(db, "users", newUser.uid));
          const isProfileComplete = userDoc.exists() ? userDoc.data().isProfileComplete : false;
          const publicRoutes = ["/", "/about", "/services", "/gallery"];
          const protectedRoutes = ["/profile", "/portal", "/dashboard", "/admin"];
          if (
            !isProfileComplete &&
            publicRoutes.includes(pathname) &&
            !protectedRoutes.includes(pathname)
          ) {
            console.log(`AuthContext: Fallback redirect to /profile due to error, user: ${newUser.email}, path: ${pathname}, isProfileComplete: ${isProfileComplete}`);
            router.replace("/profile");
          }
        }
      } else if (pathname === "/profile") {
        // Redirect unauthenticated users away from /profile
        console.log("AuthContext: Redirecting to / for unauthenticated user, current path: /profile");
        router.replace("/");
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