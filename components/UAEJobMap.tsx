"use client";

/**
 * Glowing low-poly UAE map with LIVE job markers per emirate.
 * - Real-time counts via Firestore onSnapshot (jobs are public-read).
 * - Markers pulse when jobs are live; brighten as the cursor nears them.
 * - Drifting ambient dots + a travelling light along the border.
 *
 * mode="showcase"  -> clicking an emirate navigates to /jobs
 * mode="browse"    -> clicking calls onSelectLocation(name) to filter
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

type City = { name: string; x: number; y: number; lx?: number; ly?: number; anchor?: "start" | "middle" | "end" };

// viewBox 1000 x 720 — positions are geographically proportional.
const CITIES: City[] = [
  { name: "Ras Al Khaimah", x: 853, y: 109, lx: 868, ly: 104, anchor: "start" },
  { name: "Umm Al Quwain", x: 787, y: 150, lx: 802, ly: 146, anchor: "start" },
  { name: "Ajman", x: 769, y: 171, lx: 660, ly: 168, anchor: "end" },
  { name: "Sharjah", x: 758, y: 187, lx: 648, ly: 196, anchor: "end" },
  { name: "Dubai", x: 742, y: 214, lx: 700, ly: 250, anchor: "end" },
  { name: "Fujairah", x: 916, y: 222, lx: 931, ly: 222, anchor: "start" },
  { name: "Abu Dhabi", x: 588, y: 338, lx: 588, ly: 372, anchor: "middle" },
];

// Low-poly Emirates outline (clockwise from the western Gulf coast).
const OUTLINE =
  "M120,382 L252,332 L432,322 L560,300 L682,250 L760,193 L820,150 L886,94 " +
  "L906,150 L936,232 L906,300 L858,360 L842,414 L700,470 L520,500 L340,470 L200,432 Z";

const AMBIENT = Array.from({ length: 16 }, (_, i) => ({
  x: 120 + ((i * 137) % 760),
  y: 110 + ((i * 211) % 360),
  d: (i % 5) * 0.6,
  s: 1 + (i % 3),
}));

export default function UAEJobMap({
  mode = "showcase",
  onSelectLocation,
  selectedLocation = null,
  counts: countsProp,
}: {
  mode?: "showcase" | "browse";
  onSelectLocation?: (loc: string | null) => void;
  selectedLocation?: string | null;
  counts?: Record<string, number>;
}) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [countsState, setCountsState] = useState<Record<string, number>>({});
  const [hover, setHover] = useState<string | null>(null);
  const [ptr, setPtr] = useState<{ x: number; y: number } | null>(null);

  // Self-subscribe only when counts aren't supplied by a parent.
  useEffect(() => {
    if (countsProp) return;
    const unsub = onSnapshot(
      collection(db, "jobs"),
      (snap) => {
        const c: Record<string, number> = {};
        snap.forEach((d) => {
          const loc = (d.data().location || "").trim();
          if (loc) c[loc] = (c[loc] || 0) + 1;
        });
        setCountsState(c);
      },
      () => {/* permission/offline: leave counts empty */ }
    );
    return () => unsub();
  }, [countsProp]);

  const counts = countsProp ?? countsState;

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const toSvg = (e: React.MouseEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return null;
    return { x: ((e.clientX - r.left) / r.width) * 1000, y: ((e.clientY - r.top) / r.height) * 720 };
  };

  const click = (name: string) => {
    if (mode === "browse") {
      onSelectLocation?.(selectedLocation === name ? null : name);
    } else {
      router.push("/jobs");
    }
  };

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox="0 0 1000 720"
        className="w-full h-auto select-none"
        onMouseMove={(e) => setPtr(toSvg(e))}
        onMouseLeave={() => { setPtr(null); setHover(null); }}
      >
        <defs>
          <linearGradient id="mapFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#004643" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#2E7D74" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="mapStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#004643" />
            <stop offset="100%" stopColor="#2E7D74" />
          </linearGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* filled landmass */}
        <path d={OUTLINE} fill="url(#mapFill)" stroke="url(#mapStroke)" strokeWidth="2.5" strokeLinejoin="round" filter="url(#glow)" />
        {/* travelling light along border */}
        <path d={OUTLINE} fill="none" stroke="#D3B878" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="60 1600" opacity="0.9">
          <animate attributeName="stroke-dashoffset" from="0" to="-1660" dur="6s" repeatCount="indefinite" />
        </path>

        {/* ambient drifting dots */}
        {AMBIENT.map((a, i) => (
          <circle key={i} cx={a.x} cy={a.y} r={a.s} fill="#2E7D74" opacity="0.35">
            <animate attributeName="cy" values={`${a.y};${a.y - 14};${a.y}`} dur={`${4 + a.d}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.5;0.15" dur={`${4 + a.d}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* city markers */}
        {CITIES.map((c) => {
          const n = counts[c.name] || 0;
          const active = n > 0;
          const isSel = selectedLocation === c.name;
          const near = ptr ? Math.hypot(ptr.x - c.x, ptr.y - c.y) : 9999;
          const lit = near < 90 || hover === c.name || isSel;
          const baseR = active ? 7 : 4;
          const r = baseR + (lit ? 3 : 0);

          return (
            <g
              key={c.name}
              className="cursor-pointer"
              onClick={() => click(c.name)}
              onMouseEnter={() => setHover(c.name)}
              style={{ transition: "transform 0.2s" }}
            >
              {/* pulse ring for active emirates */}
              {active && (
                <circle cx={c.x} cy={c.y} r={baseR} fill="none" stroke="#004643" strokeWidth="2" opacity="0.6">
                  <animate attributeName="r" from={baseR} to={baseR + 22} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* halo when lit */}
              {lit && <circle cx={c.x} cy={c.y} r={r + 12} fill="#004643" opacity="0.18" />}
              {/* dot */}
              <circle cx={c.x} cy={c.y} r={r} fill={active ? "url(#mapStroke)" : "#9DBBB5"} stroke="#fff" strokeWidth="1.5"
                style={{ transition: "r 0.2s" }} />
              {active && <circle cx={c.x} cy={c.y} r={2} fill="#fff" />}
              {/* count badge */}
              {active && (
                <g transform={`translate(${c.x + 8}, ${c.y - 8})`}>
                  <circle r="11" fill="#004643" />
                  <text textAnchor="middle" dy="4" fontSize="13" fontWeight="800" fill="#fff">{n}</text>
                </g>
              )}
              {/* label */}
              <text
                x={c.lx} y={c.ly} textAnchor={c.anchor || "start"}
                fontSize="17" fontWeight={lit ? 800 : 600}
                fill={lit ? "#004643" : "#6B7A76"}
                style={{ transition: "fill 0.2s", fontFamily: "Sora, sans-serif" }}
              >
                {c.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* live banner */}
      <div className="absolute top-2 left-2 md:top-3 md:left-3 flex items-center gap-2 px-3 py-2 rounded-sm bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] shadow-[var(--shadow-sm)]">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-bold text-[var(--text-primary)]">
          {total > 0 ? `${total} live ${total === 1 ? "gig" : "gigs"} across the UAE` : "Live UAE job map"}
        </span>
      </div>

      {mode === "browse" && selectedLocation && (
        <button
          onClick={() => onSelectLocation?.(null)}
          className="absolute bottom-2 right-2 text-xs font-bold text-[var(--primary)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-full shadow-[var(--shadow-sm)] hover:bg-[var(--primary-muted)] transition-colors"
        >
          Clear filter · {selectedLocation} ✕
        </button>
      )}
    </div>
  );
}
