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
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaStar,
  FaBriefcase,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaArrowRight,
  FaRocket,
  FaGem,
  FaAward,
  FaQuoteLeft
} from "react-icons/fa";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

interface GalleryImage {
  src: string;
  alt: string;
  desc: string;
  category: string;
}

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

function JobCard({ job, index }: { job: Job; index: number }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 80,
        damping: 20
      }}
      viewport={{ once: true }}
      whileHover={{ y: -12, scale: 1.02 }}
      onClick={() => router.push(`/portal/applications/${job.id}`)}
      className="glass-card p-8 group cursor-pointer relative overflow-hidden"
      role="button"
      aria-label={`View details for ${job.title} position`}
    >
      {/* Background gradient - positioned behind content */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/50 via-[var(--primary)]/30 to-[var(--secondary)]/50 opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>

      {/* Top section */}
      <div className="relative z-20 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="job-card-icon">
            <FaBriefcase />
          </div>
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-all duration-300"
            whileHover={{ x: 4 }}
          >
            <FaArrowRight className="text-[var(--primary)] text-xl" />
          </motion.div>
        </div>

        <h3 className="job-card-title group-hover:gradient-text transition-all duration-300">
          {job.title}
        </h3>
      </div>

      {/* Job details */}
      <div className="relative z-20 space-y-4 mb-6">
        <div className="job-card-meta">
          <FaMapMarkerAlt className="text-[var(--primary)]" />
          <span>{job.location}</span>
        </div>

        <div className="job-card-meta">
          <FaClock className="text-[var(--secondary)]" />
          <span>{job.type} • {job.duration}</span>
        </div>

        {job.description && (
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2">
            {job.description}
          </p>
        )}
      </div>

      {/* Bottom section */}
      <div className="relative z-20 flex items-center justify-between">
        <div className="job-card-salary">
          <FaMoneyBillWave />
          <span>AED {job.rate}/hour</span>
        </div>
        <span className="text-xs text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all duration-300">
          Click to apply
        </span>
      </div>
    </motion.div>
  );
}

function StatCard({ stat, index }: { stat: any; index: number }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="stat-card group"
    >
      <div className="stat-number">{stat.number}</div>
      <div className="stat-label flex items-center justify-center gap-2">
        {stat.icon}
        {stat.label}
      </div>
    </motion.div>
  );
}

function FeatureCard({ feature, index }: { feature: any; index: number }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        type: "spring",
        stiffness: 80
      }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="glass-card p-8 text-center group h-full relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

      <motion.div
        className="text-5xl mb-6 mx-auto inline-block relative z-10"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {feature.icon}
      </motion.div>
      <h3 className="font-heading text-xl font-semibold mb-4 text-[var(--text-primary)] group-hover:gradient-text transition-all duration-300 relative z-10">
        {feature.title}
      </h3>
      <p className="text-[var(--text-secondary)] leading-relaxed relative z-10">
        {feature.desc}
      </p>
    </motion.div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: any; index: number }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 80
      }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="testimonial-card relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10"></div>

      <div className="flex mb-4 relative z-10">
        {[...Array(testimonial.rating)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <FaStar className="text-[var(--accent)] text-lg" />
          </motion.div>
        ))}
      </div>
      <div className="testimonial-quote relative z-10">
        <FaQuoteLeft className="text-[var(--primary)] opacity-30 absolute -top-4 -left-4 text-3xl" />
        {testimonial.quote}
      </div>
      <div className="testimonial-author relative z-10">{testimonial.name}</div>
      <div className="testimonial-role relative z-10">{testimonial.role}</div>
    </motion.div>
  );
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(collection(db, "jobs"), limit(3));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsList = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          description: doc.data().description || "Join our professional team for exciting event opportunities in Dubai&apos;s vibrant event scene."
        } as Job));
        setJobs(jobsList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const galleryImages: GalleryImage[] = [
    { src: "/gallery/event1.png", alt: "Luxurious Wedding Event in Dubai by Eventopic", desc: "Elegant wedding setup", category: "Weddings" },
    { src: "/gallery/event2.png", alt: "Corporate Gala in Dubai - Eventopic Management", desc: "Tech conference", category: "Corporate" },
    { src: "/gallery/event3.png", alt: "Brand Activation Event in Dubai", desc: "Product launch", category: "Promotions" },
    { src: "/gallery/event4.png", alt: "Private Party in Dubai by Eventopic", desc: "Rooftop party", category: "Parties" },
    { src: "/gallery/event5.png", alt: "Cultural Event in Dubai - Eventopic Staffing", desc: "Cultural festival", category: "Cultural" },
    { src: "/gallery/event6.png", alt: "Luxury Event in Dubai - Eventopic Planning", desc: "Gala dinner", category: "Corporate" },
  ];

  const stats = [
    { number: "3+", label: "Years Experience", icon: <FaCalendarAlt /> },
    { number: "100+", label: "Events Managed", icon: <FaCheckCircle /> },
    { number: "500+", label: "Professional Staff", icon: <FaUsers /> },
  ];

  const features = [
    {
      icon: <FaRocket className="gradient-text" />,
      title: "Expert Planning",
      desc: "From concept to execution, our comprehensive event management ensures every detail exceeds expectations in Dubai's competitive event landscape.",
    },
    {
      icon: <FaGem className="gradient-text-accent" />,
      title: "Premium Staffing",
      desc: "Carefully selected professionals including hostesses, promoters, and event coordinators who embody excellence and professionalism.",
    },
    {
      icon: <FaAward className="gradient-text" />,
      title: "Flawless Execution",
      desc: "With 100+ successful events, we deliver precision-crafted experiences that transform your vision into unforgettable reality.",
    },
  ];

  const testimonials = [
    {
      quote: "Eventopic's volunteers were an absolute game-changer for the Beach Soccer FIFA 2024 tournament. Their professionalism and enthusiasm elevated our entire event experience.",
      name: "Sarah Johnson",
      role: "Head of Operations, Beach Soccer FIFA 2024",
      rating: 5
    },
    {
      quote: "The staffing solutions provided were top-tier. Their team integrated seamlessly with ours and contributed significantly to our professional atmosphere.",
      name: "Ahmed Al-Rashid",
      role: "Marketing Director, AYS Real Estate",
      rating: 5
    },
    {
      quote: "Exceptional creative talent. The video creator they provided brought strategic vision and technical excellence that perfectly captured our brand message.",
      name: "Maria Rodriguez",
      role: "CEO, New Link Consultancy",
      rating: 5
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 100 }
    },
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="section-hero relative">
        <div className="absolute inset-0">
          <Image
            src="/gallery/BurjKhalifa.png"
            alt="Dubai Skyline - Burj Khalifa"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            quality={90}
            priority
            className="opacity-30"
            onError={() => console.error("Failed to load hero image")}
          />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container relative z-10 min-h-screen flex flex-col justify-center items-center text-center py-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <motion.h1
              variants={fadeInUp}
              className="font-display text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight"
            >
              <span className="gradient-text">Event</span>
              <span className="text-white">opic</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="font-heading text-2xl md:text-3xl lg:text-4xl mb-8 gradient-text-accent"
            >
              The Future Of Showcasing
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed text-[var(--text-secondary)]"
            >
              Dubai&apos;s most trusted partner for luxury event management and professional staffing.
              We transform ideas into extraordinary experiences that captivate and inspire.
            </motion.p>

            {/* Stats */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto"
            >
              {stats.map((stat, index) => (
                <StatCard key={index} stat={stat} index={index} />
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={containerVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <motion.div variants={fadeInUp}>
                <Link href="/contact" className="btn-primary group">
                  Get a Free Quote
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link href="/contact#staff-form" className="btn-secondary group">
                  <FaUsers />
                  Join the Team
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Job Opportunities Section */}
      <section className="section-standard">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 gradient-text text-balance">
              Premium Job Opportunities
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Join our elite team and work at Dubai&apos;s most prestigious events.
              Build your career in the luxury event industry.
            </p>
          </motion.div>

          {isLoadingJobs ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="glass-card p-8 skeleton h-64"></div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center">
              <div className="glass-card p-12 max-w-md mx-auto">
                <FaBriefcase className="text-4xl text-[var(--primary)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)]">
                  No positions available at the moment.
                  <br />Check back soon for new opportunities!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/portal/applications" className="btn-primary group">
              View All Opportunities
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Eventopic Section */}
      <section className="section-standard">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 text-balance">
              Why Choose <span className="gradient-text">Eventopic?</span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              We don&apos;t just manage events—we craft extraordinary experiences that leave lasting impressions
              and exceed every expectation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-standard">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 text-balance">
              Our <span className="gradient-text-accent">Event Portfolio</span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              Discover the artistry behind our luxury events—each one a masterpiece of planning,
              execution, and unforgettable moments.
            </p>
          </motion.div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="gallery-item"
                style={{ height: '300px' }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  quality={85}
                  loading={index > 2 ? "lazy" : "eager"}
                />
                <div className="gallery-overlay">
                  <div>
                    <h3 className="font-heading text-white font-semibold text-lg mb-1">
                      {image.desc}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                      {image.category}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/gallery" className="btn-primary group">
              Explore Full Gallery
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-standard">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 text-balance">
              Client <span className="gradient-text">Testimonials</span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              Don&apos;t just take our word for it—hear from the industry leaders who trust us
              with their most important events.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-standard">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="glass-card p-16 max-w-4xl mx-auto">
              <h2 className="font-display text-5xl md:text-6xl font-bold mb-8 text-balance">
                Ready to Elevate Your <span className="gradient-text">Event?</span>
              </h2>
              <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
                With over 3 years in Dubai&apos;s dynamic event scene, we&apos;re your trusted partner
                for creating memories that last a lifetime.
              </p>
              <Link href="/about" className="btn-primary group text-lg px-12 py-5">
                Discover Our Story
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chat Bot */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="animate-glow">
          <ChatBot />
        </div>
      </div>

      <Footer />
    </>
  );
}