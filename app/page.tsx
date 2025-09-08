// Updated app/page.tsx
// Changes: Updated color theme integration (e.g., buttons, stats, icons). Added ChatBot component fixed bottom-right.

"use client";

import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot"; // New import for chatbot
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { FaInstagram, FaFacebookF, FaEnvelope, FaCalendarAlt, FaUsers, FaCheckCircle } from "react-icons/fa";

export default function Home() {
  const galleryImages = [
    { src: "/gallery/event1.png", alt: "Luxurious Wedding Event in Dubai by Eventopic", desc: "Elegant wedding setup", category: "Weddings" },
    { src: "/gallery/event2.png", alt: "Corporate Gala in Dubai - Eventopic Management", desc: "Tech conference", category: "Corporate" },
    { src: "/gallery/event3.png", alt: "Brand Activation Event in Dubai", desc: "Product launch", category: "Promotions" },
    { src: "/gallery/event4.png", alt: "Private Party in Dubai by Eventopic", desc: "Rooftop party", category: "Parties" },
    { src: "/gallery/event5.png", alt: "Cultural Event in Dubai - Eventopic Staffing", desc: "Cultural festival", category: "Cultural" },
    { src: "/gallery/event6.png", alt: "Luxury Event in Dubai - Eventopic Planning", desc: "Gala dinner", category: "Corporate" },
    // Fallbacks: Uncomment if images missing
    // { src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587208?w=800&h=600&fit=crop", alt: "Eventopic Event", desc: "Placeholder event", category: "Weddings" },
  ];

  const stats = [
    { number: "3+", label: "Years Experience" },
    { number: "100+", label: "Events Managed" },
    { number: "500+", label: "Happy Clients" },
  ];

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring" as const, stiffness: 100, damping: 10 } },
  } as const;

  const staggerChildren: Variants = {
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, type: "spring" as const, stiffness: 80 } },
    hover: { scale: 1.05, y: -5, transition: { duration: 0.3 } },
  };

  return (
    <>
      <Navbar />
      {/* Hero Section: Image with grayscale-to-color animation -> Updated filter */}
      <section className="relative overflow-hidden" style={{ minHeight: "100vh", background: "linear-gradient(to bottom, var(--accent), var(--primary))", color: "var(--white)" }}>
        <div className="hero-bg">
          <Image
            src="/gallery/BurjKhalifa.png" // Fallback: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=1920&h=1080&fit=cover"
            alt="Dubai Skyline - Burj Khalifa, Symbolizing Luxury Events with Eventopic"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            quality={85}
            priority
            className="brightness-50 sepia(10%) hue-rotate(200deg)"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col justify-center items-center text-center h-full py-20">
          <motion.h1 
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-2xl font-heading leading-tight"
          >
            <span className="eventopic-title">Eventopic</span>
          </motion.h1>
          <motion.p 
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl lg:text-4xl mb-8 drop-shadow-lg font-body opacity-90"
          >
            Where Ideas Become Experiences
          </motion.p>
          <motion.p 
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed opacity-80"
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
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: "var(--white)" }}>
                  {stat.number}
                </div>
                <div className="text-sm md:text-base opacity-70" style={{ color: "var(--light)" }}>
                  {stat.label}
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
            <motion.div variants={buttonVariants} whileHover="hover">
              <Link 
                href="/contact" 
                className="px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 inline-block border-2 border-[var(--white)]" 
                style={{ backgroundColor: "transparent", color: "var(--white)" }}
              >
                Get a Free Quote
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover">
              <Link 
                href="/contact#staff-form" 
                className="px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 inline-block" 
                style={{ backgroundColor: "var(--white)", color: "var(--primary)" }}
              >
                Join the Team
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Eventopic: Relevant icons, B&W gradient -> Updated to blue gradient */}
      <section className="py-24" style={{ background: "linear-gradient(to right, var(--primary), var(--accent))" }}>
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading" 
            style={{ color: "var(--white)" }}
          >
            Why Choose Eventopic?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <FaCalendarAlt className="text-5xl md:text-6xl mb-6 mx-auto" />, 
                title: "Expert Planning", 
                desc: "From concept to cleanup, our end-to-end event management ensures every detail is perfect for your Dubai event." 
              },
              { 
                icon: <FaUsers className="text-5xl md:text-6xl mb-6 mx-auto" />, 
                title: "Professional Staffing", 
                desc: "Skilled promoters, hostesses, ushers, and volunteers tailored to make your event seamless and memorable." 
              },
              { 
                icon: <FaCheckCircle className="text-5xl md:text-6xl mb-6 mx-auto" />, 
                title: "Flawless Execution", 
                desc: "Over 100 events delivered with precision in Dubai, turning your vision into reality." 
              },
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card p-8 rounded-xl shadow-xl text-center"
              >
                <div style={{ color: "var(--accent)" }}>{feature.icon}</div>
                <h3 className="text-xl md:text-2xl font-semibold mb-4 font-heading" style={{ color: "var(--primary)" }}>{feature.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: "var(--accent)" }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24" style={{ background: "linear-gradient(to left, var(--primary), var(--accent))" }}>
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-12 font-heading" 
            style={{ color: "var(--white)" }}
          >
            Our Event Portfolio
          </motion.h2>
          <p className="text-center mb-12 text-lg md:text-xl opacity-80" style={{ color: "var(--light)" }}>
            Discover highlights from our luxurious events across Dubai.
          </p>
          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="gallery-item relative"
              >
                <Image 
                  src={image.src} 
                  alt={image.alt} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-xl object-cover" 
                  quality={85}
                  loading={index > 2 ? "lazy" : "eager"}
                />
                <div className="overlay rounded-xl">
                  <span className="text-white text-lg font-semibold font-body">{image.desc}</span>
                  <span className="text-sm text-[var(--light)] mt-2">{image.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link 
              href="/gallery" 
              className="px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all inline-block border-2 border-[var(--white)]" 
              style={{ backgroundColor: "transparent", color: "var(--white)" }}
            >
              Explore Full Gallery
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24" style={{ background: "linear-gradient(to right, var(--accent), var(--primary))" }}>
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading" 
            style={{ color: "var(--white)" }}
          >
            What Our Clients Say
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { quote: "&quot;Eventopic turned our corporate gala into an unforgettable night. Professional staff and seamless planning!&quot;", name: "Ahmed K., CEO" },
              { quote: "&quot;The promoters were outstanding &ndash; boosted our brand visibility like never before.&quot;", name: "Sara L., Marketing Director" },
              { quote: "&quot;From wedding setup to volunteers, everything was perfect. Highly recommend for Dubai events!&quot;", name: "Fatima R., Bride" },
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card p-6 rounded-xl shadow-xl italic"
              >
                <p className="mb-4 text-lg" style={{ color: "var(--accent)" }}>{testimonial.quote}</p>
                <p className="font-semibold text-right" style={{ color: "var(--primary)" }}>- {testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24" style={{ background: "linear-gradient(to left, var(--accent), var(--primary))" }}>
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-8 font-heading" 
            style={{ color: "var(--white)" }}
          >
            Ready to Elevate Your Event?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body"
            style={{ color: "var(--light)" }}
          >
            With over 3 years in Dubai&apos;s dynamic event scene, Eventopic is your partner for staffing, planning, and execution. Let&apos;s create memories that last.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" as const }}
            viewport={{ once: true }}
          >
            <Link 
              href="/about" 
              className="px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all inline-block border-2 border-[var(--white)]" 
              style={{ backgroundColor: "transparent", color: "var(--white)" }}
            >
              Discover More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ChatBot Component - Positioned fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBot />
      </div>

      {/* Footer: With React Icons - Updated hover color to gold */}
      <footer className="py-12" style={{ backgroundColor: "var(--primary)", color: "var(--white)" }}>
        <div className="container mx-auto text-center px-4">
          <div className="flex justify-center space-x-8 mb-6">
            <a href="https://www.instagram.com/eventopic" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[var(--color-accent)] transition-colors">
              <FaInstagram />
            </a>
            <a href="https://www.facebook.com/eventopic" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[var(--color-accent)] transition-colors">
              <FaFacebookF />
            </a>
            <a href="mailto:info@eventopic.com" className="text-2xl hover:text-[var(--color-accent)] transition-colors">
              <FaEnvelope />
            </a>
          </div>
          <p>&copy; 2025 Eventopic. All rights reserved. | Dubai&apos;s Trusted Event Management Partner.</p>
        </div>
      </footer>
    </>
  );
}