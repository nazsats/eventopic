
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {  FaCalendarAlt, FaUsers, FaCheckCircle, FaStar,  FaBriefcase, FaClock, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
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
}

function JobCard({ job }: { job: Job }) {
  const router = useRouter();

  return (
    <motion.div
      role="listitem"
      aria-label={`Job: ${job.title}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.05 }}
      onClick={() => router.push(`/portal/applications/${job.id}`)}
      className="card p-6 rounded-2xl shadow-xl border border-[var(--light)]/30 bg-[var(--primary)]/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group relative cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--teal-accent)]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <h3 className="text-2xl font-semibold mb-3 font-heading flex items-center gap-2 text-[var(--text-accent)] relative z-10">
        <FaBriefcase /> {job.title}
      </h3>
      <p className="mb-2 flex items-center gap-2 text-lg font-body text-[var(--text-body)] relative z-10">
        <FaMapMarkerAlt /> {job.location}
      </p>
      <p className="mb-2 flex items-center gap-2 text-lg font-body text-[var(--text-body)] relative z-10">
        <FaClock /> {job.type} - {job.duration}
      </p>
      <p className="mb-4 flex items-center gap-2 text-lg font-body text-[var(--text-body)] relative z-10">
        <FaMoneyBillWave /> AED {job.rate}/hour
      </p>
      <p className="text-base italic font-body text-[var(--teal-accent)] relative z-10">
        Click to view details
      </p>
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
        const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
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
    { number: "500+", label: "Profession Staff", icon: <FaUsers /> },
  ];

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 10 } },
  } as const;

  const staggerChildren: Variants = {
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 80 } },
    hover: {
      scale: 1.1,
      y: -5,
      boxShadow: "0 8px 24px rgba(0, 196, 180, 0.4)",
      backgroundColor: "var(--teal-accent)",
      borderColor: "var(--teal-accent)",
      transition: { duration: 0.3 },
    },
  };

  const SkeletonLoader = () => (
    <div className="break-inside-avoid rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--soft)", width: "100%", height: "300px" }}>
      <div className="animate-pulse h-full w-full bg-[var(--light)]/50"></div>
    </div>
  );

  return (
    <>
      <Navbar />
      <section className="relative overflow-hidden" style={{ minHeight: "100vh", background: "linear-gradient(to bottom, var(--accent), var(--primary))", color: "var(--white)" }}>
        <div className="hero-bg absolute inset-0">
          <Image
            src="/gallery/BurjKhalifa.png"
            alt="Dubai Skyline - Burj Khalifa, Symbolizing Luxury Events with Eventopic"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            quality={85}
            priority
            className="brightness-50 sepia-[10%] hue-rotate-[200deg]"
            onError={() => console.error("Failed to load hero image: /gallery/BurjKhalifa.png")}
          />
        </div>
        <div className="absolute inset-0 bg-[var(--accent)]/40 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col justify-center items-center text-center h-full py-20">
          <motion.h1
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-heading leading-tight"
            style={{ color: "var(--white)" }}
          >
            <span className="eventopic-title">Eventopic</span>
          </motion.h1>
          <motion.p
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl lg:text-4xl mb-8 font-body opacity-90"
            style={{ color: "var(--white)" }}
          >
            The Future Of Showcasing
          </motion.p>
          <motion.p
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-body opacity-80"
            style={{ color: "var(--light)" }}
          >
            Dubai&apos;s trusted partner for luxury event management and professional staffing. Create unforgettable moments with our expert team.
          </motion.p>
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center items-center space-x-8 md:space-x-12 mb-12 gap-4 md:gap-0"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={textVariants}
                className="text-center p-4 rounded-xl bg-[var(--accent)]/30"
              >
                <div className="text-3xl md:text-4xl font-bold mb-1 font-heading" style={{ color: "var(--white)" }}>
                  {stat.number}
                </div>
                <div className="text-sm md:text-base opacity-70 flex items-center gap-1 justify-center font-body" style={{ color: "var(--light)" }}>
                  {stat.icon} {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={buttonVariants} className="group relative">
              <Link
                href="/contact"
                className="px-10 py-4 rounded-full text-xl font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block focus:ring-4 focus:ring-[var(--teal-accent)]/50 relative z-10"
                style={{ background: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                aria-label="Get a Free Quote"
              >
                Get a Free Quote
                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants} className="group relative">
              <Link
                href="/contact#staff-form"
                className="px-10 py-4 rounded-full text-xl font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block focus:ring-4 focus:ring-[var(--teal-accent)]/50 relative z-10"
                style={{ background: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                aria-label="Join the Team"
              >
                Join the Team
                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative" style={{ background: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold text-center mb-12 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Job Opportunities
          </motion.h2>
          <p className="text-center mb-12 text-lg md:text-xl font-body opacity-80 text-[var(--text-body)]">
            Join our team and work at Dubai&apos;s most exciting events!
          </p>
          {isLoadingJobs ? (
            <div className="text-center font-body text-[var(--text-body)]">
              Loading jobs...
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-center font-body text-[var(--text-body)]">
              No jobs available at the moment. Check back soon!
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-center mt-12 group relative"
          >
            <motion.div variants={buttonVariants}>
              <Link
                href="/portal/applications"
                className="px-10 py-4 rounded-full text-xl font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block focus:ring-4 focus:ring-[var(--teal-accent)]/50 relative z-10"
                style={{ background: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                aria-label="View All Job Opportunities"
              >
                View All Jobs
                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative" style={{ background: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold text-center mb-16 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Why Choose Eventopic?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaCalendarAlt className="text-5xl md:text-6xl mb-6 mx-auto text-[var(--color-accent)]" />,
                title: "Expert Planning",
                desc: "From concept to cleanup, our end-to-end event management ensures every detail is perfect for your Dubai event.",
              },
              {
                icon: <FaUsers className="text-5xl md:text-6xl mb-6 mx-auto text-[var(--teal-accent)]" />,
                title: "Professional Staffing",
                desc: "Skilled promoters, hostesses, ushers, and volunteers tailored to make your event seamless and memorable.",
              },
              {
                icon: <FaCheckCircle className="text-5xl md:text-6xl mb-6 mx-auto text-[var(--color-accent)]" />,
                title: "Flawless Execution",
                desc: "Over 100 events delivered with precision in Dubai, turning your vision into reality.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2, type: "spring" }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="card p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-[var(--light)]/30 bg-[var(--primary)]/80 backdrop-blur-sm group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--teal-accent)]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 font-heading text-[var(--text-accent)] relative z-10">
                  {feature.title}
                </h3>
                <p className="text-lg leading-relaxed font-body text-[var(--text-body)] relative z-10">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative" style={{ background: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold text-center mb-12 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Our Event Portfolio
          </motion.h2>
          <p className="text-center mb-12 text-lg md:text-xl font-body opacity-80 text-[var(--text-body)]">
            Discover highlights from our luxurious events across Dubai.
          </p>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.length === 0
              ? Array.from({ length: 3 }).map((_, index) => <SkeletonLoader key={index} />)
              : galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05 }}
                    className="break-inside-avoid rounded-2xl overflow-hidden card relative group"
                    style={{ position: "relative", width: "100%", height: "300px" }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      quality={85}
                      loading={index > 2 ? "lazy" : "eager"}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      onError={() => console.error(`Failed to load image: ${image.src}`)}
                    />
                    <div className="absolute inset-0 bg-[var(--accent)]/80 backdrop-blur-sm flex flex-col justify-end p-6 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <span className="text-lg font-semibold font-body text-[var(--white)]">{image.desc}</span>
                      <span className="text-base font-body text-[var(--text-body)]">{image.category}</span>
                    </div>
                  </motion.div>
                ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-center mt-12 group relative"
          >
            <motion.div variants={buttonVariants}>
              <Link
                href="/gallery"
                className="px-10 py-4 rounded-full text-xl font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block focus:ring-4 focus:ring-[var(--teal-accent)]/50 relative z-10"
                style={{ background: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                aria-label="Explore Full Gallery"
              >
                Explore Full Gallery
                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative" style={{ background: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold text-center mb-16 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            What Our Clients Say
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { quote: "Eventopic’s volunteers were an absolute game-changer for the Beach Soccer FIFA 2024 tournament. Their team was professional, enthusiastic, and incredibly well-organized. They seamlessly managed crowd control, assisted with event logistics, and ensured our attendees had a fantastic experience. Their commitment and positive attitude were instrumental to the event's success. We look forward to partnering with Eventopic again in the future.", name: "Head of Operations, Beach Soccer FIFA 2024", rating: 5 },
              { quote: "For our recent corporate events, we relied on Eventopic to provide all our staffing needs. The team they provided was top-tier—highly trained, courteous, and efficient. They handled everything from guest registration to information desks with a level of professionalism that truly elevated our brand. Their staff integrated perfectly with our team and contributed significantly to the polished and professional atmosphere we wanted to create. Eventopic is our go-to for staffing solutions.", name: "Marketing Director, AYS Real Estate Company", rating: 5 },
              { quote: "We needed a skilled video creator for a series of new promotional campaigns, and Eventopic delivered beyond our expectations. The video creator they provided was not only technically proficient but also brought a creative and strategic vision to the project. The final videos were of exceptional quality and perfectly captured our brand's message. Eventopic's ability to match us with the right talent for this specialized task was impressive. We highly recommend them for their excellent service.", name: "CEO, New Link Consultancy", rating: 5 },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2, type: "spring" }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="card p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-[var(--light)]/30 bg-[var(--primary)]/80 backdrop-blur-sm group relative italic"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--teal-accent)]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex justify-center mb-4 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-[var(--color-accent)]" />
                  ))}
                </div>
                <p className="mb-4 text-lg font-body text-[var(--text-body)] relative z-10">
                  {testimonial.quote}
                </p>
                <p className="font-semibold text-right font-body text-[var(--text-accent)] relative z-10">
                  - {testimonial.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative" style={{ background: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold mb-8 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Ready to Elevate Your Event?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body text-[var(--text-body)]"
          >
            With over 3 years in Dubai&apos;s dynamic event scene, Eventopic is your partner for staffing, planning, and execution. Let&apos;s create memories that last.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="group relative"
          >
            <motion.div variants={buttonVariants}>
              <Link
                href="/about"
                className="px-10 py-4 rounded-full text-xl font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block focus:ring-4 focus:ring-[var(--teal-accent)]/50 relative z-10"
                style={{ background: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                aria-label="Discover More About Eventopic"
              >
                Discover More
                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-full">
        <ChatBot />
      </div>
      <Footer />
    </>
  );
}
