import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

export interface ActivityLogEntry {
    actorEmail: string;
    actorRole: "super_admin" | "admin" | "user";
    action: string;
    category: "jobs" | "applications" | "admins" | "users" | "profile" | "system" | "leads";
    targetId?: string;
    targetLabel?: string;
    timestamp: string;
    details?: string;
}

export async function logActivity(entry: Omit<ActivityLogEntry, "timestamp">) {
    try {
        await addDoc(collection(db, "activityLogs"), {
            ...entry,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Failed to log activity:", err);
    }
}
