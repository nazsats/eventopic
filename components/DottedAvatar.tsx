"use client";

/**
 * Clean "dotted" avatar — a gradient disc with a halftone dot texture,
 * a bold initial, a floating role badge, and a cursor-reactive tilt.
 * No photo needed; looks detailed and on-brand.
 */
import { useRef } from "react";
import { motion } from "framer-motion";

// Pre-computed halftone dots inside a circle (denser/larger toward centre).
const DOTS = (() => {
  const out: { x: number; y: number; r: number }[] = [];
  const cx = 60, cy = 60, R = 54;
  for (let gy = 8; gy <= 112; gy += 7) {
    for (let gx = 8; gx <= 112; gx += 7) {
      const d = Math.hypot(gx - cx, gy - cy);
      if (d > R) continue;
      const r = Math.max(0.5, 2.6 * (1 - d / R));
      out.push({ x: gx, y: gy, r });
    }
  }
  return out;
})();

export default function DottedAvatar({
  initial,
  emoji,
  gradient = "from-[#7C3AED] to-[#C084FC]",
}: {
  initial: string;
  emoji?: string;
  gradient?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // subtle parallax tilt toward the cursor
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(500px) rotateY(${px * 14}deg) rotateX(${-py * 14}deg)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ""; };

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-24 h-24 mx-auto"
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${gradient} shadow-[var(--shadow-md)] transition-transform duration-200 will-change-transform overflow-hidden`}
      >
        {/* halftone dot texture */}
        <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full opacity-50">
          {DOTS.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" />
          ))}
        </svg>
        {/* sheen */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.45),transparent_55%)]" />
        {/* initial */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-black text-4xl text-white drop-shadow">{initial}</span>
        </div>
      </div>
      {/* role badge */}
      {emoji && (
        <div className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex items-center justify-center text-lg">
          {emoji}
        </div>
      )}
    </motion.div>
  );
}
