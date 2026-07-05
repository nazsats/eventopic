"use client";

/**
 * Detailed, decorative UAE map for the jobs popup.
 * - Glowing Emirates outline + animated border + drifting dots.
 * - Real-time job counts per emirate (Firestore onSnapshot).
 * - Iconic landmarks (Burj Khalifa, Museum of the Future, Burj Al Arab,
 *   Sheikh Zayed Mosque, Louvre Abu Dhabi) as glowing, bobbing pins.
 * - Clicking anywhere navigates to the jobs page via onJobsClick.
 */
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

const OUTLINE =
  "M120,382 L252,332 L432,322 L560,300 L682,250 L760,193 L820,150 L886,94 " +
  "L906,150 L936,232 L906,300 L858,360 L842,414 L700,470 L520,500 L340,470 L200,432 Z";

type E = { name: string; x: number; y: number; lx: number; ly: number; anchor: "start" | "middle" | "end" };
const EMIRATES: E[] = [
  { name: "Ras Al Khaimah", x: 853, y: 109, lx: 868, ly: 104, anchor: "start" },
  { name: "Umm Al Quwain", x: 787, y: 150, lx: 802, ly: 146, anchor: "start" },
  { name: "Ajman", x: 769, y: 171, lx: 655, ly: 166, anchor: "end" },
  { name: "Sharjah", x: 758, y: 187, lx: 645, ly: 196, anchor: "end" },
  { name: "Dubai", x: 742, y: 214, lx: 690, ly: 250, anchor: "end" },
  { name: "Fujairah", x: 916, y: 222, lx: 931, ly: 222, anchor: "start" },
  { name: "Abu Dhabi", x: 588, y: 338, lx: 560, ly: 372, anchor: "middle" },
];

const MONUMENTS = [
  { name: "Burj Khalifa", emoji: "🏙️", x: 735, y: 196 },
  { name: "Museum of the Future", emoji: "🛸", x: 770, y: 206 },
  { name: "Burj Al Arab", emoji: "⛵", x: 712, y: 230 },
  { name: "Sheikh Zayed Mosque", emoji: "🕌", x: 580, y: 354 },
  { name: "Louvre Abu Dhabi", emoji: "🏛️", x: 616, y: 328 },
];

const AMBIENT = Array.from({ length: 18 }, (_, i) => ({
  x: 130 + ((i * 149) % 740), y: 110 + ((i * 197) % 360), d: (i % 5) * 0.5, s: 1 + (i % 3),
}));

export default function UAEDetailMap({ onJobsClick }: { onJobsClick: () => void }) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "jobs"),
      (snap) => {
        const c: Record<string, number> = {};
        snap.forEach((d) => { const l = (d.data().location || "").trim(); if (l) c[l] = (c[l] || 0) + 1; });
        setCounts(c);
      },
      () => {/* ignore */ }
    );
    return () => unsub();
  }, []);

  return (
    <button onClick={onJobsClick} className="group relative w-full text-left cursor-pointer" aria-label="Browse UAE jobs">
      <svg viewBox="0 0 1000 720" className="w-full h-auto">
        <defs>
          <radialGradient id="dFill" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#2E7D74" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#004643" stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id="dStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#004643" />
            <stop offset="100%" stopColor="#B08D4A" />
          </linearGradient>
          <filter id="dGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path d={OUTLINE} fill="url(#dFill)" stroke="url(#dStroke)" strokeWidth="3" strokeLinejoin="round" filter="url(#dGlow)" className="transition-all group-hover:opacity-90" />
        <path d={OUTLINE} fill="none" stroke="#D3B878" strokeWidth="3" strokeLinejoin="round" strokeDasharray="80 1600" opacity="0.9">
          <animate attributeName="stroke-dashoffset" from="0" to="-1680" dur="6s" repeatCount="indefinite" />
        </path>

        {AMBIENT.map((a, i) => (
          <circle key={i} cx={a.x} cy={a.y} r={a.s} fill="#2E7D74" opacity="0.3">
            <animate attributeName="cy" values={`${a.y};${a.y - 12};${a.y}`} dur={`${4 + a.d}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.12;0.45;0.12" dur={`${4 + a.d}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* emirate job markers */}
        {EMIRATES.map((e) => {
          const n = counts[e.name] || 0;
          const active = n > 0;
          return (
            <g key={e.name}>
              {active && (
                <circle cx={e.x} cy={e.y} r={6} fill="none" stroke="#004643" strokeWidth="2" opacity="0.6">
                  <animate attributeName="r" from="6" to="26" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={e.x} cy={e.y} r={active ? 7 : 4} fill={active ? "url(#dStroke)" : "#9DBBB5"} stroke="#fff" strokeWidth="1.5" />
              {active && <circle cx={e.x} cy={e.y} r={2.2} fill="#fff" />}
              {active && (
                <g transform={`translate(${e.x + 9}, ${e.y - 9})`}>
                  <circle r="11" fill="#004643" />
                  <text textAnchor="middle" dy="4" fontSize="13" fontWeight="800" fill="#fff">{n}</text>
                </g>
              )}
              <text x={e.lx} y={e.ly} textAnchor={e.anchor} fontSize="16" fontWeight="700" fill="#004643" style={{ fontFamily: "Sora, sans-serif" }}>
                {e.name}
              </text>
            </g>
          );
        })}

        {/* landmark pins */}
        {MONUMENTS.map((m, i) => (
          <g key={m.name}>
            <title>{m.name}</title>
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -6; 0 0" dur={`${3 + (i % 3) * 0.6}s`} repeatCount="indefinite" />
            <circle cx={m.x} cy={m.y} r="20" fill="#004643" opacity="0.16" />
            <circle cx={m.x} cy={m.y} r="14" fill="#fff" stroke="url(#dStroke)" strokeWidth="2" />
            <text x={m.x} y={m.y} textAnchor="middle" dy="5" fontSize="15">{m.emoji}</text>
          </g>
        ))}
      </svg>

      {/* live banner */}
      <div className="absolute top-2 left-2 flex items-center gap-2 px-3 py-2 rounded-sm bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] shadow-[var(--shadow-sm)]">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-bold text-[var(--text-primary)]">
          {Object.values(counts).reduce((a, b) => a + b, 0)} live gigs across the UAE
        </span>
      </div>

      {/* hover hint */}
      <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="px-4 py-2 rounded-full bg-[image:var(--gradient-primary)] text-white text-sm font-bold shadow-[var(--shadow-md)]">
          Browse all UAE jobs →
        </span>
      </div>
    </button>
  );
}
