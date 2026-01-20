"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  FaArrowRight,
  FaPlay,
  FaStar,
  FaArrowDown
} from "react-icons/fa";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

// Types
interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(collection(db, "jobs"), limit(3));
        const snapshot = await getDocs(jobsQuery);
        setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
      } catch (e) {
        console.error(e);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="bg-[var(--background)] min-h-screen selection:bg-[var(--primary)] selection:text-black">
      <Navbar />

      <main>
        {/* NEW HERO SECTION */}
        <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pb-20">
          {/* Enhanced Background */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Dark Overlay for contrast */}
            <div className="absolute inset-0 bg-[var(--background)]/80 z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/50 to-[var(--background)] z-10" />

            {/* Hero Image */}
            <Image
              src="/gallery/BurjKhalifa.png"
              alt="Background"
              fill
              className="object-cover opacity-60 mix-blend-overlay"
              priority
            />

            {/* Glowing Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[var(--primary)]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--secondary)]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container relative z-20 pt-32 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-ping" />
                <span className="text-sm font-medium text-[var(--primary)] tracking-wide uppercase">Dubai&apos;s #1 Staffing Agency</span>
              </div>

              <h1 className="font-display text-7xl md:text-[10rem] font-bold leading-[0.9] tracking-tight mb-8">
                <span className="block text-white mix-blend-overlay opacity-50">SHAPE</span>
                <span className="block gradient-text">EVENTS</span>
              </h1>

              <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                Connect with Dubai&apos;s most elite event professionals.
                We bring <span className="text-white font-medium">vision to life</span> through seamless management and premium staffing.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/portal" className="group relative px-8 py-4 bg-[var(--primary)] text-[var(--background)] font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.4)]">
                  <span className="relative z-10 flex items-center gap-2">
                    Find Talent
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>

                <Link href="/about" className="group flex items-center gap-4 px-8 py-4 rounded-full border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-elevated)] transition-all">
                  <div className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
                    <FaPlay className="pl-1 text-sm" />
                  </div>
                  <span className="font-medium">Watch Showreel</span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)]"
          >
            <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
            <FaArrowDown className="animate-bounce" />
          </motion.div>
        </section>

        {/* STATS STRIP */}
        <div className="border-y border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-sm -mt-20 relative z-30">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border)]">
              {[
                { label: "Active Events", value: "12" },
                { label: "Pro Staff", value: "500+" },
                { label: "Happy Clients", value: "150+" },
                { label: "Years", value: "03" },
              ].map((stat, i) => (
                <div key={i} className="py-8 text-center group hover:bg-[var(--surface-elevated)] transition-colors">
                  <div className="text-3xl font-display font-bold text-white mb-1 group-hover:text-[var(--primary)] transition-colors">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA PROMO */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-8">
              Ready to <span className="text-[var(--accent)]">Elevate?</span>
            </h2>
            <Link href="/contact" className="inline-block border-b border-[var(--primary)] text-[var(--primary)] text-xl pb-1 hover:text-white hover:border-white transition-all">
              Start your journey with us
            </Link>
          </div>
        </section>
      </main>

      {/* Chat Bot */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBot />
      </div>

      <Footer />
    </div>
  );
}