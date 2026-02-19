// lib/auth.ts
import { NextRequest } from 'next/server';
import { auth } from './firebase';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK (server-side only)
if (!getApps().length) {
    try {
        // In production, use service account credentials
        // For now, we'll use the client SDK for verification
        initializeApp({
            credential: cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.warn('Firebase Admin initialization skipped:', error);
    }
}

/**
 * Extracts the authentication token from request headers
 */
export function getAuthToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Verifies the Firebase authentication token
 */
export async function verifyAuthToken(token: string): Promise<{
    uid: string;
    email: string | undefined;
    emailVerified: boolean;
}> {
    try {
        const adminAuth = getAuth();
        const decodedToken = await adminAuth.verifyIdToken(token);

        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified || false,
        };
    } catch (error) {
        throw new Error('Invalid authentication token');
    }
}

/**
 * Middleware to verify user authentication
 */
export async function requireAuth(request: NextRequest): Promise<{
    uid: string;
    email: string;
    emailVerified: boolean;
}> {
    const token = getAuthToken(request);

    if (!token) {
        throw new Error('Authentication required');
    }

    const user = await verifyAuthToken(token);

    if (!user.email) {
        throw new Error('Email not found in token');
    }

    return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
    };
}

/**
 * Checks if a user is an admin
 */
export async function isAdmin(email: string): Promise<boolean> {
    // This should query Firestore, but for now we'll use a simple check
    // In production, use custom claims or Firestore query
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    return adminEmails.includes(email);
}

/**
 * Middleware to require admin privileges
 */
export async function requireAdmin(request: NextRequest): Promise<{
    uid: string;
    email: string;
    isAdmin: true;
}> {
    const user = await requireAuth(request);

    const adminStatus = await isAdmin(user.email);

    if (!adminStatus) {
        throw new Error('Admin privileges required');
    }

    return {
        ...user,
        isAdmin: true,
    };
}

/**
 * Error response helper
 */
export function createAuthErrorResponse(error: unknown, status: number = 401) {
    const message = error instanceof Error ? error.message : 'Authentication failed';

    return {
        error: message,
        status,
    };
}
