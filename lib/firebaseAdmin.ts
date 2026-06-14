// lib/firebaseAdmin.ts
// Server-only Firebase Admin Firestore. Writes here BYPASS security rules,
// which is exactly what public lead forms need (anonymous visitors can't be
// granted Firestore write access directly). Always pair with validation +
// rate limiting on the route.
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function ensureApp() {
  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!process.env.FIREBASE_CLIENT_EMAIL || !privateKey || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error(
        "Firebase Admin not configured. Set FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID."
      );
    }
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
}

export function getAdminDb() {
  ensureApp();
  return getFirestore();
}

export { FieldValue };
