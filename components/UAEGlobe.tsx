"use client";

/**
 * Advanced interactive globe.
 * - Dotted sphere where LAND is rendered with denser, brighter dots so the
 *   continents read as hints; the sea is sparse and faint.
 * - Major world cities labelled as they rotate into view; the UAE is a big
 *   glowing, pulsing pin and is extra-highlighted.
 * - Auto-eases back to face the UAE when idle (so it never stays hidden);
 *   drag to explore the world (with inertia).
 * - Clicking the UAE pin (or the page button) fires onUAEClick.
 */
import { useEffect, useRef } from "react";

type Vec = { x: number; y: number; z: number };

function geo(lat: number, lon: number): Vec {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return { x: Math.cos(la) * Math.sin(lo), y: Math.sin(la), z: Math.cos(la) * Math.cos(lo) };
}

// Coarse continent outlines [lon, lat] — enough to "hint" land via dot density.
const CONTINENTS: number[][][] = [
  // Africa
  [[-17, 21], [-16, 14], [-8, 5], [9, 4], [13, -5], [12, -17], [18, -34], [27, -33], [37, -16], [42, -2], [51, 12], [44, 11], [35, 23], [33, 31], [22, 32], [10, 37], [-6, 35], [-16, 28]],
  // Europe
  [[-9, 38], [-9, 44], [-2, 49], [8, 54], [16, 55], [28, 59], [40, 60], [42, 50], [30, 45], [28, 41], [20, 40], [10, 44], [2, 43], [-4, 40]],
  // Asia (incl. Arabia, India, SE Asia)
  [[26, 41], [34, 47], [50, 52], [65, 55], [85, 56], [105, 52], [122, 49], [142, 46], [140, 35], [122, 30], [120, 21], [108, 13], [104, 8], [98, 8], [92, 20], [80, 8], [73, 18], [66, 25], [57, 25], [57, 15], [48, 12], [42, 13], [36, 28], [30, 35]],
  // North America
  [[-168, 65], [-150, 70], [-110, 72], [-80, 67], [-60, 58], [-56, 50], [-66, 44], [-75, 36], [-81, 25], [-93, 29], [-104, 22], [-116, 30], [-125, 42], [-135, 56], [-160, 60]],
  // South America
  [[-80, 8], [-66, 11], [-50, 0], [-37, -6], [-44, -22], [-58, -35], [-71, -52], [-74, -40], [-70, -18], [-78, -6], [-81, 2]],
  // Australia
  [[113, -22], [114, -33], [129, -32], [138, -36], [149, -38], [153, -28], [146, -18], [135, -14], [123, -17]],
];

function pointInPoly(lon: number, lat: number, poly: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function isLand(v: Vec): boolean {
  const lat = (Math.asin(Math.max(-1, Math.min(1, v.y))) * 180) / Math.PI;
  const lon = (Math.atan2(v.x, v.z) * 180) / Math.PI;
  for (const c of CONTINENTS) if (pointInPoly(lon, lat, c)) return true;
  return false;
}

function fibonacciSphere(n: number): Vec[] {
  const pts: Vec[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return pts;
}

const CITIES: { name: string; v: Vec; uae?: boolean }[] = [
  { name: "U.A.E", v: geo(25.2, 55.27), uae: true },
  { name: "London", v: geo(51.5, -0.12) },
  { name: "New York", v: geo(40.7, -74.0) },
  { name: "Mumbai", v: geo(19.07, 72.87) },
  { name: "Singapore", v: geo(1.35, 103.8) },
  { name: "Cairo", v: geo(30.04, 31.24) },
  { name: "Tokyo", v: geo(35.68, 139.69) },
  { name: "Paris", v: geo(48.85, 2.35) },
  { name: "Riyadh", v: geo(24.71, 46.68) },
  { name: "Istanbul", v: geo(41.0, 28.98) },
  { name: "Moscow", v: geo(55.75, 37.62) },
  { name: "Sydney", v: geo(-33.87, 151.2) },
];
const UAE = CITIES[0].v;

function rotY(p: Vec, a: number): Vec {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}
function rotX(p: Vec, a: number): Vec {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

export default function UAEGlobe({ onUAEClick }: { onUAEClick?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cbRef = useRef(onUAEClick);
  cbRef.current = onUAEClick;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const raw = fibonacciSphere(2600);
    const dots = raw.map((v, i) => ({ v, land: isLand(v), keep: i % 3 === 0 }));
    const TILT = -0.42;
    const yaw0 = -Math.atan2(UAE.x, UAE.z);

    let yaw = yaw0;
    let vel = 0;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastInteract = -9999;
    const pointer = { x: -9999, y: -9999, active: false };

    let R = 180, cx = 200, cy = 200, dpr = 1;
    let uaeScreen = { x: 0, y: 0, front: false };

    const resize = () => {
      const size = Math.min(wrap.clientWidth, 520);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";
      cx = (size * dpr) / 2;
      cy = (size * dpr) / 2;
      R = (size * dpr) / 2 - 30 * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Read theme colours from CSS variables (re-read when the theme changes).
    const themeCols = { land: "0, 70, 67", sea: "138, 153, 147", accent: "176, 141, 74", accentHex: "#B08D4A", primaryHex: "#004643" };
    const hexToRgb = (h: string) => {
      const m = h.trim().replace("#", "");
      if (m.length < 6) return null;
      return `${parseInt(m.slice(0, 2), 16)}, ${parseInt(m.slice(2, 4), 16)}, ${parseInt(m.slice(4, 6), 16)}`;
    };
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      const prim = cs.getPropertyValue("--primary").trim();
      const acc = cs.getPropertyValue("--accent").trim();
      const pr = hexToRgb(prim), ar = hexToRgb(acc);
      if (pr) { themeCols.land = pr; themeCols.primaryHex = prim; }
      if (ar) { themeCols.accent = ar; themeCols.accentHex = acc; }
    };
    readTheme();
    const onTheme = () => readTheme();
    window.addEventListener("themechange", onTheme);

    const project = (p: Vec) => {
      const a = rotX(rotY(p, yaw), TILT);
      return { sx: cx + a.x * R, sy: cy - a.y * R, z: a.z };
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let raf = 0;
    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const halo = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.3);
      halo.addColorStop(0, `rgba(${themeCols.accent}, 0.16)`);
      halo.addColorStop(1, `rgba(${themeCols.accent}, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // motion: drag -> inertia -> ease back to UAE when idle
      const now = time;
      if (dragging) {
        yaw += vel;
      } else {
        vel *= 0.94;
        yaw += vel;
        if (now - lastInteract > 2600) {
          const desired = yaw0 + 0.16 * Math.sin(time / 3600);
          const d = Math.atan2(Math.sin(desired - yaw), Math.cos(desired - yaw));
          yaw += d * 0.045;
        } else {
          yaw += 0.0011;
        }
      }

      const lr = 64 * dpr;
      for (const dot of dots) {
        if (!dot.land && !dot.keep) continue; // sparse sea
        const { sx, sy, z } = project(dot.v);
        if (z < -0.15 && !dot.land) continue;
        const t = (z + 1) / 2;
        let radius = (dot.land ? lerp(0.7, 2.3, t) : lerp(0.4, 1.3, t)) * dpr;
        let alpha = dot.land ? (z < 0 ? 0.12 : lerp(0.45, 1, t)) : (z < 0 ? 0.04 : lerp(0.12, 0.4, t));
        let col = dot.land ? themeCols.land : themeCols.sea;

        if (pointer.active && z > -0.1) {
          const dd = Math.hypot(sx - pointer.x, sy - pointer.y);
          if (dd < lr) {
            const k = 1 - dd / lr;
            radius += 2.4 * dpr * k;
            alpha = Math.min(1, alpha + 0.55 * k);
            col = themeCols.accent;
          }
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${col},${alpha})`;
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // arcs + city labels
      const u = project(UAE);
      ctx.textAlign = "left";
      for (const c of CITIES) {
        if (c.uae) continue;
        const hp = project(c.v);
        if (hp.z > 0.05 && u.z > 0.05) {
          const mx = (u.sx + hp.sx) / 2, my = (u.sy + hp.sy) / 2;
          const nx = mx - cx, ny = my - cy;
          const nl = Math.hypot(nx, ny) || 1;
          const lift = 34 * dpr;
          const cxp = mx + (nx / nl) * lift, cyp = my + (ny / nl) * lift;
          ctx.beginPath();
          ctx.moveTo(u.sx, u.sy);
          ctx.quadraticCurveTo(cxp, cyp, hp.sx, hp.sy);
          ctx.strokeStyle = `rgba(${themeCols.accent}, 0.22)`;
          ctx.lineWidth = 1 * dpr;
          ctx.stroke();
        }
        if (hp.z <= 0.02) continue;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${themeCols.land},${0.4 + hp.z * 0.5})`;
        ctx.arc(hp.sx, hp.sy, 2.6 * dpr, 0, Math.PI * 2);
        ctx.fill();
        if (hp.z > 0.42) {
          ctx.font = `600 ${10 * dpr}px 'Plus Jakarta Sans', system-ui, sans-serif`;
          ctx.fillStyle = `rgba(71, 85, 105,${hp.z})`;
          ctx.fillText(c.name, hp.sx + 5 * dpr, hp.sy + 3 * dpr);
        }
      }

      // UAE hero pin
      uaeScreen = { x: u.sx, y: u.sy, front: u.z > -0.05 };
      if (u.z > -0.05) {
        const pulse = (Math.sin(time / 420) + 1) / 2;
        const g = ctx.createRadialGradient(u.sx, u.sy, 0, u.sx, u.sy, 36 * dpr);
        g.addColorStop(0, `rgba(${themeCols.accent},0.6)`);
        g.addColorStop(1, `rgba(${themeCols.accent},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(u.sx, u.sy, 36 * dpr, 0, Math.PI * 2);
        ctx.fill();
        for (let k = 0; k < 2; k++) {
          const rp = (pulse + k * 0.5) % 1;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${themeCols.accent},${0.5 * (1 - rp)})`;
          ctx.lineWidth = 2 * dpr;
          ctx.arc(u.sx, u.sy, (8 + rp * 26) * dpr, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.fillStyle = themeCols.accentHex;
        ctx.arc(u.sx, u.sy, 8 * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.arc(u.sx, u.sy, 3 * dpr, 0, Math.PI * 2);
        ctx.fill();
        const label = "🇦🇪 U.A.E — live jobs";
        ctx.font = `800 ${13 * dpr}px Sora, system-ui, sans-serif`;
        const tw = ctx.measureText(label).width;
        const px = u.sx + 14 * dpr, py = u.sy - 10 * dpr;
        const rr = 8 * dpr, bw = tw + 18 * dpr, bh = 24 * dpr, bx = px - 6 * dpr, by = py - 17 * dpr;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.moveTo(bx + rr, by);
        ctx.arcTo(bx + bw, by, bx + bw, by + bh, rr);
        ctx.arcTo(bx + bw, by + bh, bx, by + bh, rr);
        ctx.arcTo(bx, by + bh, bx, by, rr);
        ctx.arcTo(bx, by, bx + bw, by, rr);
        ctx.fill();
        ctx.fillStyle = themeCols.primaryHex;
        ctx.fillText(label, px, py);
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const getXY = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: (e.clientX - rect.left) * dpr, y: (e.clientY - rect.top) * dpr };
    };
    const onDown = (e: PointerEvent) => {
      dragging = true; moved = 0; lastX = e.clientX; vel = 0; lastInteract = performance.now();
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const { x, y } = getXY(e);
      pointer.x = x; pointer.y = y; pointer.active = true;
      if (dragging) {
        const dx = e.clientX - lastX;
        moved += Math.abs(dx);
        yaw += dx * 0.006;
        vel = dx * 0.006;
        lastX = e.clientX;
        lastInteract = performance.now();
      } else {
        const near = uaeScreen.front && Math.hypot(x - uaeScreen.x, y - uaeScreen.y) < 26 * dpr;
        canvas.style.cursor = near ? "pointer" : "grab";
      }
    };
    const onUp = (e: PointerEvent) => {
      dragging = false; lastInteract = performance.now();
      const { x, y } = getXY(e);
      if (moved < 8 && uaeScreen.front && Math.hypot(x - uaeScreen.x, y - uaeScreen.y) < 28 * dpr) {
        cbRef.current?.();
      }
    };
    const onLeave = () => { pointer.active = false; };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("themechange", onTheme);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full flex items-center justify-center select-none">
      <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing touch-none" aria-label="Interactive globe — click the UAE for live jobs" />
    </div>
  );
}
