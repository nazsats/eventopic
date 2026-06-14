"use client";

/**
 * Popup launched from the globe's UAE pin: a detailed, landmark-rich UAE map
 * with real-time job counts. Clicking the map goes to the jobs page.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaArrowRight } from "react-icons/fa";
import UAEDetailMap from "./UAEDetailMap";

const LANDMARKS = ["🏙️ Burj Khalifa", "🛸 Museum of the Future", "⛵ Burj Al Arab", "🕌 Sheikh Zayed Mosque", "🏛️ Louvre Abu Dhabi"];

export default function UAEJobsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const goToJobs = () => { onClose(); router.push("/jobs"); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1E1233]/55 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--surface)] w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl border border-[var(--border)] shadow-[var(--shadow-lg)] overflow-hidden flex flex-col"
            style={{ maxHeight: "92dvh" }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center text-white shadow-[var(--shadow-sm)]">🇦🇪</div>
                <div>
                  <h2 className="font-display font-bold text-[var(--text-primary)] leading-none">Live Jobs Across the UAE</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Tap the map to browse & apply</p>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-elevated)] transition-colors">
                <FaTimes />
              </button>
            </div>

            {/* detailed map */}
            <div className="overflow-y-auto">
              <div className="p-4 md:p-6 bg-[image:var(--gradient-mesh)]">
                <UAEDetailMap onJobsClick={goToJobs} />
              </div>

              {/* landmark legend */}
              <div className="px-5 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Featuring UAE icons</p>
                <div className="flex flex-wrap gap-2">
                  {LANDMARKS.map((l) => (
                    <span key={l} className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface-elevated)] border border-[var(--border)] px-3 py-1.5 rounded-full">{l}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="px-5 py-4 border-t border-[var(--border)] flex justify-end bg-[var(--surface)]">
              <button onClick={goToJobs} className="btn-primary px-6 py-2.5 text-sm">
                Browse all jobs <FaArrowRight />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
