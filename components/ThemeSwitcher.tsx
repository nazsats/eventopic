"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { FaPalette, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeSwitcher() {
  const { currentTheme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme"
        className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] hover:text-[var(--accent)] hover:border-[var(--border-hover)] transition-colors"
      >
        <FaPalette className="text-sm" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-lg)] z-[200]"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-2 py-1.5">Choose a theme</p>
            {themes.map((t) => {
              const active = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${active ? "bg-[var(--primary-muted)]" : "hover:bg-[var(--surface-elevated)]"}`}
                >
                  <div className="flex -space-x-1.5 shrink-0">
                    {[t.swatches.primary, t.swatches.accent, t.swatches.secondary].map((c, i) => (
                      <span key={i} className="w-5 h-5 rounded-full border-2 border-[var(--surface)]" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{t.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{t.desc}</p>
                  </div>
                  {active && <FaCheck className="text-[var(--accent)] text-xs shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
