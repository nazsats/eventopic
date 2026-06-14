"use client";

/**
 * A soft purple spotlight that trails the cursor and intensifies while
 * the user drags. Desktop only (skipped for touch / reduced-motion).
 * Fixed, pointer-events-none — never blocks clicks.
 */
import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x, ty = y;
    let down = false;
    let raf = 0;

    const move = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; el.style.opacity = "1"; };
    const enter = () => { el.style.opacity = "1"; };
    const leave = () => { el.style.opacity = "0"; };
    const onDown = () => { down = true; };
    const onUp = () => { down = false; };

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      const scale = down ? 1.35 : 1;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      el.style.background = down
        ? "radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(168,85,247,0.10) 35%, transparent 70%)"
        : "radial-gradient(circle, rgba(124,58,237,0.13) 0%, rgba(168,85,247,0.06) 40%, transparent 70%)";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseenter", enter);
    document.addEventListener("mouseleave", leave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseenter", enter);
      document.removeEventListener("mouseleave", leave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="hidden md:block fixed top-0 left-0 z-[9999] pointer-events-none rounded-full"
      style={{
        width: 460,
        height: 460,
        opacity: 0,
        transition: "opacity 0.3s ease",
        mixBlendMode: "multiply",
      }}
    />
  );
}
