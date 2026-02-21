"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FaTimes, FaExpand, FaArrowRight } from "react-icons/fa";

interface GalleryImage {
  src: string;
  alt: string;
  desc: string;
  category: string;
}

const GALLERY: GalleryImage[] = [
  { src: "/gallery/event1.png", alt: "Luxurious Wedding Event in Dubai by Eventopic", desc: "Elegant wedding at Burj Al Arab", category: "Weddings" },
  { src: "/gallery/event2.png", alt: "Corporate Gala in Dubai — Eventopic Management", desc: "Tech conference at DWTC", category: "Corporate" },
  { src: "/gallery/event3.png", alt: "Brand Activation Event in Dubai", desc: "Product launch with promoters", category: "Promotions" },
  { src: "/gallery/event4.png", alt: "Private Party in Dubai by Eventopic", desc: "Exclusive rooftop party", category: "Parties" },
  { src: "/gallery/event5.png", alt: "Cultural Event in Dubai — Eventopic Staffing", desc: "Government cultural festival", category: "Cultural" },
  { src: "/gallery/event6.png", alt: "Luxury Event in Dubai — Eventopic Planning", desc: "High-profile gala dinner", category: "Corporate" },
  { src: "/gallery/event1.png", alt: "Wedding Ceremony Dubai", desc: "Beachside wedding ceremony", category: "Weddings" },
  { src: "/gallery/event2.png", alt: "Business Conference Dubai", desc: "Annual corporate summit", category: "Corporate" },
  { src: "/gallery/event3.png", alt: "Mall Activation Dubai", desc: "Interactive brand experience", category: "Promotions" },
];

const CATEGORIES = [
  { name: "All", icon: "🎯" },
  { name: "Weddings", icon: "💒" },
  { name: "Corporate", icon: "🏢" },
  { name: "Promotions", icon: "📢" },
  { name: "Parties", icon: "🎉" },
  { name: "Cultural", icon: "🎭" },
];

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(9);
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  const filtered = filter === "All" ? GALLERY : GALLERY.filter(i => i.category === filter);
  const shown = filtered.slice(0, visibleCount);

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--primary)]/8 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-5 max-w-3xl text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-3">
            Our Work
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4 leading-tight">
            Event <span className="gradient-text">Portfolio</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-[var(--text-secondary)] text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Explore our collection of unforgettable events, activations, and experiences across Dubai.
          </motion.p>
        </div>
      </section>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[64px] z-40 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => {
              const active = filter === cat.name;
              const count = cat.name === "All" ? GALLERY.length : GALLERY.filter(i => i.category === cat.name).length;
              return (
                <button
                  key={cat.name}
                  onClick={() => { setFilter(cat.name); setVisibleCount(9); }}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${active
                      ? "bg-[var(--primary)] text-black shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                      : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                    }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${active ? "bg-black/20 text-black" : "bg-white/5 text-[var(--text-muted)]"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Gallery grid ── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <AnimatePresence mode="wait">
            {shown.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-16 glass-card rounded-2xl">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-bold text-[var(--text-primary)] mb-1">No events found</h3>
                <p className="text-sm text-[var(--text-secondary)]">Try another category.</p>
              </motion.div>
            ) : (
              <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shown.map((img, i) => (
                  <motion.div
                    key={`${img.src}-${i}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    onClick={() => setSelected(img)}
                    className="group cursor-pointer rounded-2xl overflow-hidden relative"
                    style={{ aspectRatio: "4/3" }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Image
                      src={img.src} alt={img.alt} fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading={i < 6 ? "eager" : "lazy"}
                    />
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white">
                      {img.category}
                    </div>
                    {/* Expand icon */}
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaExpand className="text-white text-[10px]" />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white font-bold text-sm">{img.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load more */}
          {shown.length < filtered.length && (
            <div className="text-center mt-10">
              <button
                onClick={() => setVisibleCount(v => v + 6)}
                className="btn-primary px-8 py-3 text-sm font-bold"
              >
                Load More ({filtered.length - shown.length} remaining)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-3xl"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl mb-4">
                <Image src={selected.src} alt={selected.alt} fill className="object-cover" quality={95} priority />
              </div>
              <div className="glass-card p-5 rounded-2xl text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--primary)] text-black text-xs font-bold mb-2">
                  {selected.category}
                </span>
                <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">{selected.desc}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{selected.alt}</p>
              </div>
            </motion.div>
            {/* Close */}
            <button
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              onClick={() => setSelected(null)}
            >
              <FaTimes className="text-white text-sm" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA ── */}
      <section className="py-14 md:py-20 border-t border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--primary)]/6 pointer-events-none" />
        <div className="container mx-auto px-5 max-w-2xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              Ready to Create Your Own <span className="gradient-text">Masterpiece?</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-7 max-w-sm mx-auto">
              From intimate celebrations to grand corporate events — we bring your vision to life.
            </p>
            <Link href="/contact" className="btn-primary px-8 py-3.5 text-sm font-bold inline-flex items-center gap-2">
              Start Planning <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}