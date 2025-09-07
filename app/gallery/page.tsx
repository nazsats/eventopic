"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaInstagram, FaFacebookF, FaEnvelope } from "react-icons/fa";
import { useState } from "react";

export default function Gallery() {
  // Gallery images with categories for filtering
  const galleryImages = [
    { src: "/gallery/event1.png", alt: "Luxurious Wedding Event in Dubai by Eventopic", desc: "Elegant wedding at Burj Al Arab", category: "Weddings" },
    { src: "/gallery/event2.png", alt: "Corporate Gala in Dubai - Eventopic Management", desc: "Tech conference at DWTC", category: "Corporate" },
    { src: "/gallery/event3.png", alt: "Brand Activation Event in Dubai", desc: "Product launch with promoters", category: "Promotions" },
    { src: "/gallery/event4.png", alt: "Private Party in Dubai by Eventopic", desc: "Exclusive rooftop party", category: "Parties" },
    { src: "/gallery/event5.png", alt: "Cultural Event in Dubai - Eventopic Staffing", desc: "Government cultural festival", category: "Cultural" },
    { src: "/gallery/event6.png", alt: "Luxury Event in Dubai - Eventopic Planning", desc: "High-profile gala dinner", category: "Corporate" },
    // Fallbacks if images missing:
    // { src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587208?w=800&h=600&fit=crop", alt: "Eventopic Event", desc: "Placeholder event", category: "Weddings" },
  ];

  const categories = ["All", "Weddings", "Corporate", "Promotions", "Parties", "Cultural"];
  const [filter, setFilter] = useState("All");

  const filteredImages = filter === "All" ? galleryImages : galleryImages.filter((img) => img.category === filter);

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 10 } },
  };

  return (
    <>
      <Navbar />
      {/* Header: No hero image, clean and focused */}
      <section className="py-20 bg-[var(--secondary)]">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-6xl font-bold mb-6 font-heading" 
            style={{ color: "var(--white)" }}
          >
            Eventopic Gallery
          </motion.h1>
          <motion.p 
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl max-w-3xl mx-auto mb-12 font-body leading-relaxed" 
            style={{ color: "var(--light)" }}
          >
            Explore our portfolio of unforgettable events in Dubai – from luxurious weddings to high-energy corporate activations, crafted with precision by Eventopic.
          </motion.p>
          {/* Category Filters */}
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
                className={`px-4 py-2 rounded-full font-semibold text-sm md:text-base transition-all ${
                  filter === category ? "bg-[var(--white)] text-[var(--primary)]" : "bg-[var(--accent)] text-[var(--white)] hover:bg-[var(--light)] hover:text-[var(--primary)]"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid: Masonry-style, premium design */}
      <section className="py-24 bg-[var(--primary)]">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 font-heading" 
            style={{ color: "var(--white)" }}
          >
            Our Signature Events
          </motion.h2>
          <div className="gallery-grid">
            {filteredImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="gallery-item"
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
          {filteredImages.length === 0 && (
            <p className="text-center text-lg" style={{ color: "var(--light)" }}>
              No events found in this category. Explore others!
            </p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--accent)]">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-8 font-heading" 
            style={{ color: "var(--white)" }}
          >
            Plan Your Next Unforgettable Event
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body"
            style={{ color: "var(--light)" }}
          >
            From concept to execution, Eventopic delivers world-class events in Dubai with professional staffing and flawless planning.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            viewport={{ once: true }}
          >
            <Link 
              href="/contact" 
              className="px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all inline-block border-2 border-[var(--white)]" 
              style={{ backgroundColor: "transparent", color: "var(--white)" }}
            >
              Get a Free Quote
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer: With React Icons */}
      <footer className="py-12" style={{ backgroundColor: "var(--primary)", color: "var(--white)" }}>
        <div className="container mx-auto text-center px-4">
          <div className="flex justify-center space-x-8 mb-6">
            <a href="https://www.instagram.com/eventopic" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[var(--light)] transition-colors">
              <FaInstagram />
            </a>
            <a href="https://www.facebook.com/eventopic" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[var(--light)] transition-colors">
              <FaFacebookF />
            </a>
            <a href="mailto:info@eventopic.com" className="text-2xl hover:text-[var(--light)] transition-colors">
              <FaEnvelope />
            </a>
          </div>
          <p>&copy; 2025 Eventopic. All rights reserved. | Dubai's Premier Event Management Experts.</p>
        </div>
      </footer>
    </>
  );
}