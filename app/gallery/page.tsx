"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { FaInstagram, FaFacebookF, FaEnvelope } from "react-icons/fa";
import { useState } from "react";

export default function Gallery() {
  const galleryImages = [
    { src: "/gallery/event1.png", alt: "Luxurious Wedding Event in Dubai by Eventopic", desc: "Elegant wedding at Burj Al Arab", category: "Weddings" },
    { src: "/gallery/event2.png", alt: "Corporate Gala in Dubai - Eventopic Management", desc: "Tech conference at DWTC", category: "Corporate" },
    { src: "/gallery/event3.png", alt: "Brand Activation Event in Dubai", desc: "Product launch with promoters", category: "Promotions" },
    { src: "/gallery/event4.png", alt: "Private Party in Dubai by Eventopic", desc: "Exclusive rooftop party", category: "Parties" },
    { src: "/gallery/event5.png", alt: "Cultural Event in Dubai - Eventopic Staffing", desc: "Government cultural festival", category: "Cultural" },
    { src: "/gallery/event6.png", alt: "Luxury Event in Dubai - Eventopic Planning", desc: "High-profile gala dinner", category: "Corporate" },
  ];

  const categories = ["All", "Weddings", "Corporate", "Promotions", "Parties", "Cultural"];
  const [filter, setFilter] = useState("All");

  const filteredImages = filter === "All" ? galleryImages : galleryImages.filter((img) => img.category === filter);

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        type: "spring",
        stiffness: 100, 
        damping: 10 
      } 
    },
  } as const;

  return (
    <>
      <Navbar />
      <section className="py-20 bg-[var(--secondary)] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1 
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-6xl font-bold mb-6 font-heading relative" 
            style={{ color: "var(--white)", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            Eventopic Gallery
          </motion.h1>
          <motion.p 
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl max-w-3xl mx-auto mb-12 font-body leading-relaxed relative" 
            style={{ color: "var(--light)" }}
          >
            Explore our portfolio of unforgettable events in Dubai &ndash; from luxurious weddings to high-energy corporate activations, crafted with precision by Eventopic.
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 relative overflow-hidden ${
                  filter === category 
                    ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)] shadow-lg" 
                    : "bg-[var(--accent)] text-[var(--white)] hover:bg-gradient-to-r hover:from-[var(--color-accent)] hover:to-[var(--teal-accent)] hover:text-[var(--primary)]"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-[var(--primary)] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--accent)]/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 font-heading relative" 
            style={{ color: "var(--white)", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
          >
            Our Signature Events
          </motion.h2>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="break-inside-avoid rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 relative group"
                style={{ position: "relative", width: "100%", aspectRatio: "4/3", minHeight: "200px" }}
              >
                <Image 
                  src={image.src} 
                  alt={image.alt} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  quality={85}
                  loading="eager" // Temporarily set to eager to rule out lazy loading issues
                  onError={() => console.error(`Failed to load image: ${image.src}`)}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" // Small placeholder
                />
                <div className="absolute inset-0 bg-[var(--accent)]/80 backdrop-blur-sm flex flex-col justify-end p-6 text-white rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100">
                  <span className="text-lg font-semibold font-body mb-2" style={{ color: "var(--color-accent)" }}>{image.desc}</span>
                  <span className="text-sm" style={{ color: "var(--light)" }}>{image.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredImages.length === 0 && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center text-lg mt-12" 
              style={{ color: "var(--light)" }}
            >
              No events found in this category. Explore others!
            </motion.p>
          )}
        </div>
      </section>

      <section className="py-20 bg-[var(--light)] relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent)]/5 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-8 font-heading" 
            style={{ color: "var(--primary)", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}
          >
            Plan Your Next Unforgettable Event
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body"
            style={{ color: "var(--accent)" }}
          >
            From concept to execution, Eventopic delivers world-class events in Dubai&apos;s vibrant scene with professional staffing and flawless planning.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/contact" 
              className="px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 inline-block border-2 border-[var(--teal-accent)] hover:border-[var(--color-accent)]" 
              style={{ backgroundColor: "transparent", color: "var(--accent)" }}
            >
              Get a Free Quote
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 relative" style={{ backgroundColor: "var(--primary)", color: "var(--white)", borderTop: "1px solid var(--color-accent)" }}>
        <div className="container mx-auto text-center px-4 relative z-10">
          <div className="flex justify-center space-x-8 mb-6">
            <a href="https://www.instagram.com/eventopic" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[var(--color-accent)] transition-all duration-300 hover:scale-110">
              <FaInstagram />
            </a>
            <a href="https://www.facebook.com/eventopic" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[var(--color-accent)] transition-all duration-300 hover:scale-110">
              <FaFacebookF />
            </a>
            <a href="mailto:info@eventopic.com" className="text-2xl hover:text-[var(--color-accent)] transition-all duration-300 hover:scale-110">
              <FaEnvelope />
            </a>
          </div>
          <p className="text-lg font-medium">&copy; 2025 Eventopic. All rights reserved. | Dubai&apos;s Premier Event Management Experts.</p>
        </div>
      </footer>
    </>
  );
}