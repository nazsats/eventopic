//contexts/AuthModal.tsx

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
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
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

  useEffect(() => {
    console.log("AuthProvider: Setting up onAuthStateChanged listener");
    let isInitialLoad = true;
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      console.log("Auth state changed: user =", newUser ? newUser.uid : null, "email =", newUser?.email);
      setUser(newUser);
      setLoading(false);
      if (newUser && !isInitialLoad) {
        console.log("AuthProvider: User signed in, redirecting to /profile");
        router.replace("/profile");
      }
      isInitialLoad = false;
    });
    return () => {
      console.log("AuthProvider: Cleaning up onAuthStateChanged listener");
      unsubscribe();
    };
  }, [router]);

  const signInWithGoogle = async () => {
    try {
      console.log("signInWithGoogle: Starting Google sign-in");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log("signInWithGoogle: Success, redirecting to /profile");
      toast.success("Signed in with Google!");
      router.replace("/profile");
    } catch (error: any) {
      console.error("signInWithGoogle: Error:", error.message || error);
      toast.error("Failed to sign in with Google.");
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      console.log("signInWithFacebook: Starting Facebook sign-in");
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      console.log("signInWithFacebook: Success, redirecting to /profile");
      toast.success("Signed in with Facebook!");
      router.replace("/profile");
    } catch (error: any) {
      console.error("signInWithFacebook: Error:", error.message || error);
      toast.error("Failed to sign in with Facebook.");
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      console.log("signInWithApple: Starting Apple sign-in");
      const provider = new OAuthProvider("apple.com");
      await signInWithPopup(auth, provider);
      console.log("signInWithApple: Success, redirecting to /profile");
      toast.success("Signed in with Apple!");
      router.replace("/profile");
    } catch (error: any) {
      console.error("signInWithApple: Error:", error.message || error);
      toast.error("Failed to sign in with Apple.");
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("signInWithEmail: Starting email sign-in for", email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("signInWithEmail: Success, redirecting to /profile");
      toast.success("Signed in with email!");
      router.replace("/profile");
    } catch (error: any) {
      console.error("signInWithEmail: Error:", error.message || error);
      toast.error("Failed to sign in with email.");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("signOut: Starting sign-out");
      await firebaseSignOut(auth);
      setUser(null);
      console.log("signOut: Success");
      toast.success("Signed out successfully!");
      // No redirect here; page.tsx handles redirect to /
    } catch (error: any) {
      console.error("signOut: Error:", error.message || error);
      toast.error("Failed to sign out.");
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("resetPassword: Sending password reset email to", email);
      await sendPasswordResetEmail(auth, email);
      console.log("resetPassword: Email sent successfully");
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("resetPassword: Error:", error.message || error);
      toast.error("Failed to send password reset email.");
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
