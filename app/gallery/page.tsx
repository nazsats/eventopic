//app/gallery/page.tsx
"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaFilter, FaTimes, FaImages, FaPlay } from "react-icons/fa";

interface GalleryImage {
  src: string;
  alt: string;
  desc: string;
  category: string;
}

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [visibleImages, setVisibleImages] = useState(9);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const galleryImages: GalleryImage[] = [
    { src: "/gallery/event1.png", alt: "Luxurious Wedding Event in Dubai by Eventopic", desc: "Elegant wedding at Burj Al Arab", category: "Weddings" },
    { src: "/gallery/event2.png", alt: "Corporate Gala in Dubai - Eventopic Management", desc: "Tech conference at DWTC", category: "Corporate" },
    { src: "/gallery/event3.png", alt: "Brand Activation Event in Dubai", desc: "Product launch with promoters", category: "Promotions" },
    { src: "/gallery/event4.png", alt: "Private Party in Dubai by Eventopic", desc: "Exclusive rooftop party", category: "Parties" },
    { src: "/gallery/event5.png", alt: "Cultural Event in Dubai - Eventopic Staffing", desc: "Government cultural festival", category: "Cultural" },
    { src: "/gallery/event6.png", alt: "Luxury Event in Dubai - Eventopic Planning", desc: "High-profile gala dinner", category: "Corporate" },
    { src: "/gallery/event1.png", alt: "Wedding Ceremony Dubai", desc: "Beachside wedding ceremony", category: "Weddings" },
    { src: "/gallery/event2.png", alt: "Business Conference Dubai", desc: "Annual corporate summit", category: "Corporate" },
    { src: "/gallery/event3.png", alt: "Mall Activation Dubai", desc: "Interactive brand experience", category: "Promotions" },
  ];

  const categories = [
    { name: "All", icon: "🎯", count: galleryImages.length },
    { name: "Weddings", icon: "💒", count: galleryImages.filter(img => img.category === "Weddings").length },
    { name: "Corporate", icon: "🏢", count: galleryImages.filter(img => img.category === "Corporate").length },
    { name: "Promotions", icon: "📢", count: galleryImages.filter(img => img.category === "Promotions").length },
    { name: "Parties", icon: "🎉", count: galleryImages.filter(img => img.category === "Parties").length },
    { name: "Cultural", icon: "🎭", count: galleryImages.filter(img => img.category === "Cultural").length }
  ];

  const filteredImages = filter === "All" ? galleryImages : galleryImages.filter((img) => img.category === filter);
  const paginatedImages = filteredImages.slice(0, visibleImages);

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="section-hero relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--accent)] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container relative z-10 min-h-[60vh] flex flex-col justify-center items-center text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto shadow-2xl">
                <FaImages className="text-3xl text-white" />
              </div>
            </motion.div>

            <h1 className="font-display text-6xl md:text-8xl font-bold mb-6 leading-tight">
              Our <span className="gradient-text">Portfolio</span>
            </h1>
            
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-[var(--text-secondary)] leading-relaxed">
              Explore our collection of unforgettable events across Dubai — from elegant weddings 
              to high-energy corporate activations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-[var(--background)] sticky top-20 z-40 border-b border-[var(--border)] backdrop-blur-xl">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <FaFilter className="text-[var(--primary)]" />
              <span className="font-heading font-semibold">Filter by:</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category, index) => (
                <motion.button
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => {
                    setFilter(category.name);
                    setVisibleImages(9);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                    filter === category.name
                      ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg"
                      : "glass-card text-[var(--text-primary)] hover:border-[var(--border-hover)]"
                  }`}
                  aria-label={`Filter by ${category.name}`}
                  aria-pressed={filter === category.name}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    filter === category.name 
                      ? "bg-white/20 text-white" 
                      : "bg-[var(--surface)] text-[var(--text-muted)]"
                  }`}>
                    {category.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-standard">
        <div className="container">
          {paginatedImages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="glass-card p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No events found</h3>
                <p className="text-[var(--text-secondary)]">
                  No events found in this category. Try another filter!
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedImages.map((image, index) => (
                  <motion.div
                    key={`${image.src}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setSelectedImage(image)}
                    className="gallery-item cursor-pointer group"
                    style={{ height: "400px" }}
                  >
                    <div className="glass-card p-0 h-full overflow-hidden">
                      <div className="relative h-full">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          quality={85}
                          loading={index < 6 ? "eager" : "lazy"}
                        />
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[var(--primary)]/90 backdrop-blur-sm border border-[var(--border)]">
                          <span className="text-white text-xs font-bold">{image.category}</span>
                        </div>

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FaPlay className="text-white text-xl ml-1" />
                          </div>
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                          <div>
                            <h3 className="text-white font-heading font-bold text-xl mb-2">
                              {image.desc}
                            </h3>
                            <p className="text-white/90 text-sm">
                              Click to view details
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {paginatedImages.length < filteredImages.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-16"
                >
                  <motion.button
                    onClick={() => setVisibleImages((prev) => prev + 6)}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-lg px-12 py-4"
                    aria-label="Load More Images"
                  >
                    Load More Events
                    <span className="ml-2">({filteredImages.length - paginatedImages.length} remaining)</span>
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.button
            onClick={() => setSelectedImage(null)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all z-10"
            aria-label="Close modal"
          >
            <FaTimes className="text-white text-xl" />
          </motion.button>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl w-full"
          >
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                className="object-cover"
                quality={95}
                priority
              />
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-center"
            >
              <div className="glass-card p-6 mx-auto max-w-2xl">
                <span className="inline-block px-4 py-2 rounded-full bg-[var(--primary)] text-white text-sm font-bold mb-4">
                  {selectedImage.category}
                </span>
                <h3 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-3">
                  {selectedImage.desc}
                </h3>
                <p className="text-[var(--text-secondary)] text-lg">
                  {selectedImage.alt}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

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
            <div className="glass-card p-16 max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 -z-10"></div>
              <div className="relative z-10">
                <h2 className="font-display text-5xl md:text-6xl font-bold mb-8 text-balance">
                  Ready to Create Your Own <span className="gradient-text">Masterpiece?</span>
                </h2>
                <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
                  From intimate celebrations to grand corporate events, we bring your vision to life 
                  with creativity, precision, and unmatched attention to detail.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/contact"
                    className="btn-primary text-lg px-12 py-5 inline-flex items-center gap-3"
                    aria-label="Start Planning Your Event"
                  >
                    Start Planning Your Event
                    <FaPlay />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}