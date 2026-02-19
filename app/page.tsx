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
  FaArrowDown,
  FaBriefcase,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaRocket,
  FaGem,
  FaAward,
  FaQuoteLeft
} from "react-icons/fa";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/AuthModal";

// Types
interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  duration: string;
  rate: number;
  category: string;
  description?: string;
}

interface GalleryImage {
  src: string;
  alt: string;
  desc: string;
  category: string;
}

// --- COMPONENTS ---

function JobCard({ job, index, onAction }: { job: Job; index: number; onAction: (id: string) => void }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      onClick={() => onAction(job.id)}
      className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-[var(--primary)]/50 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-[var(--primary)]/20 transition-colors">
            <FaBriefcase className="text-xl text-[var(--primary)]" />
          </div>
          <motion.div whileHover={{ x: 5 }} className="text-white/50 group-hover:text-white transition-colors">
            <FaArrowRight />
          </motion.div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-1">{job.title}</h3>

        <div className="space-y-2 mb-6 flex-grow">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <FaMapMarkerAlt className="text-[var(--primary)]" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <FaClock className="text-[var(--secondary)]" />
            <span>{job.type}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-[var(--accent)] font-bold">
            <FaMoneyBillWave />
            <span>AED {job.rate} <span className="text-xs font-normal text-white/60">/ {(job as any).paymentFrequency ? (job as any).paymentFrequency.charAt(0).toUpperCase() + (job as any).paymentFrequency.slice(1) : 'Day'}</span></span>
          </div>
          <span className="text-xs text-white/40 uppercase tracking-widest">Apply Now</span>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ stat, index }: { stat: any; index: number }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <div className="text-center group p-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, type: "spring" }}
        className="text-4xl md:text-5xl font-display font-bold text-white mb-2 group-hover:text-[var(--primary)] transition-colors"
      >
        {stat.value}
      </motion.div>
      <div className="text-sm uppercase tracking-widest text-[var(--text-muted)] group-hover:text-white transition-colors">
        {stat.label}
      </div>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: any; index: number }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      viewport={{ once: true }}
      className="relative p-8 rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] group hover:-translate-y-2 transition-transform duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />

      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
          {feature.icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          {feature.desc}
        </p>
      </div>
    </motion.div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: any; index: number }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative"
    >
      <FaQuoteLeft className="absolute top-8 left-8 text-4xl text-[var(--primary)]/20" />
      <div className="relative z-10 pt-8">
        <p className="text-lg text-[var(--text-secondary)] italic mb-6 leading-relaxed">
          &quot;{testimonial.quote}&quot;
        </p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold">
            {testimonial.name[0]}
          </div>
          <div>
            <h4 className="font-bold text-white">{testimonial.name}</h4>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

  const handleJobAction = (jobId: string) => {
    if (user) {
      router.push(`/portal/applications/${jobId}`);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(collection(db, "jobs"), limit(3));
        const snapshot = await getDocs(jobsQuery);
        setJobs(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          description: doc.data().description || "Join our elite team for premium events."
        } as Job)));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const galleryImages: GalleryImage[] = [
    { src: "/gallery/event1.png", alt: "Luxurious Wedding", desc: "Royal Wedding", category: "Weddings" },
    { src: "/gallery/event2.png", alt: "Corporate Gala", desc: "Tech Summit 2024", category: "Corporate" },
    { src: "/gallery/event3.png", alt: "Brand Launch", desc: "Fashion Week", category: "Brand" },
  ];

  const features = [
    {
      icon: <FaRocket className="text-[var(--primary)]" />,
      title: "Expert Planning",
      desc: "Precision-engineered event management that transforms complex requirements into seamless experiences.",
    },
    {
      icon: <FaGem className="text-[var(--accent)]" />,
      title: "Elite Staffing",
      desc: "Access a curated roster of polished professionals trained to represent premium brands with elegance.",
    },
    {
      icon: <FaAward className="text-[var(--secondary)]" />,
      title: "Flawless Execution",
      desc: "Our rigorous quality control and on-site management ensure every moment is picture-perfect.",
    },
  ];

  const testimonials = [
    {
      quote: "Eventopic's team elevated our FIFA tournament operations to a global standard. Simply world-class.",
      name: "Sarah Johnson",
      role: "FIFA Operations Head",
    },
    {
      quote: "The most professional staffing agency we've worked with in Dubai. They understand luxury.",
      name: "Ahmed Al-Rashid",
      role: "Emaar Events Director",
    },
    {
      quote: "Strategic, creative, and reliable. They delivered our vision with absolute precision.",
      name: "Maria Rodriguez",
      role: "CEO, Lux Media",
    },
  ];

  return (
    <div className="bg-[var(--background)] min-h-screen selection:bg-[var(--primary)] selection:text-black">
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pb-20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[var(--background)]/80 z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/50 to-[var(--background)] z-10" />
            <Image
              src="/gallery/BurjKhalifa.png"
              alt="Background"
              fill
              className="object-cover opacity-60 mix-blend-overlay"
              priority
            />
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
                <span className="text-sm font-medium text-[var(--primary)] tracking-wide uppercase">Dubai&apos;s Fastest Staffing Agency</span>
              </div>

              <h1 className="font-display text-7xl md:text-[10rem] font-bold leading-[0.9] tracking-tight mb-8">
                <span className="block gradient-text">EVENTOPIC</span>
              </h1>

              <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                Unlock exclusive opportunities with top brands.
                We provide the <span className="text-white font-medium">fastest connection</span> between skilled professionals and premium events in the UAE.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/portal/applications" className="group relative px-8 py-4 bg-[var(--primary)] text-[var(--background)] font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.4)]">
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Jobs
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
                { label: "Active Jobs", value: "10+" },
                { label: "Real-time Applications", value: "2.4k" },
                { label: "Happy Clients", value: "5+" },
                { label: "Years Excellence", value: "03" },
              ].map((stat, i) => (
                <StatCard key={i} stat={stat} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* FEATURED JOBS */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Trending <span className="gradient-text">Opportunities</span></h2>
                <p className="text-[var(--text-secondary)] text-lg max-w-xl">Join elite teams at the region&apos;s most prestigious events.</p>
              </div>
              <Link href="/portal/applications" className="text-[var(--primary)] font-bold flex items-center gap-2 hover:gap-4 transition-all">
                View All Jobs <FaArrowRight />
              </Link>
            </div>

            {isLoadingJobs ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {jobs.map((job, index) => <JobCard key={job.id} job={job} index={index} onAction={handleJobAction} />)}
              </div>
            )}
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-32 bg-[var(--surface)]/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-transparent" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-4 block">Why Eventopic?</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Fastest Way to <span className="text-[var(--accent)]">Get Hired</span></h2>
              <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto">We streamline the process so you can focus on what you do best—delivering excellence.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FaRocket className="text-[var(--primary)]" />,
                  title: "Instant Matching", // Replaced Expert Planning
                  desc: "Our platform connects your profile with matching events immediately. No more waiting weeks for a response.",
                },
                {
                  icon: <FaGem className="text-[var(--accent)]" />,
                  title: "Premium Roles", // Replaced Elite Staffing
                  desc: "Access high-paying roles with top-tier brands that are not listed on standard job boards.",
                },
                {
                  icon: <FaMoneyBillWave className="text-[var(--secondary)]" />, // Changed icon
                  title: "Reliable Payments", // Replaced Flawless Execution
                  desc: "We ensure transparent and timely payments for all our staff, giving you peace of mind.",
                },
              ].map((feature, index) => <FeatureCard key={index} feature={feature} index={index} />)}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Our <span className="gradient-text-accent">Showcase</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleryImages.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative height-[400px] h-[400px] rounded-[2rem] overflow-hidden"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                    <span className="text-[var(--primary)] font-bold text-sm tracking-widest uppercase mb-2">{img.category}</span>
                    <h3 className="text-white font-display text-2xl font-bold">{img.desc}</h3>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/gallery" className="btn-secondary px-8 py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all">Explore Full Gallery</Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-32 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white">Trusted by <span className="text-[var(--primary)]">Leaders</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => <TestimonialCard key={i} testimonial={t} index={i} />)}
            </div>
          </div>
        </section>

        {/* CTA PROMO */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--primary)]/10 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="font-display text-5xl md:text-7xl font-bold mb-8">
              Ready to <span className="text-[var(--accent)]">Elevate?</span>
            </h2>
            <Link href="/contact" className="inline-block border-b border-[var(--primary)] text-[var(--primary)] text-2xl pb-2 hover:text-white hover:border-white transition-all">
              Start your journey with us
            </Link>
          </div>
        </section>
      </main>

      <ChatBot />

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode="signin" />
    </div>
  );
}